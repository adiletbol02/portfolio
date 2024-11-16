const express = require("express");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const ensureAuthenticated = require("../middlewares/auth");
const User = require("../models/User");

const router = express.Router();

// Route to disable 2FA
router.post("/disable", ensureAuthenticated, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });
    console.log("2FA disabled for user:", req.user.email);
    res.redirect("/portfolio");
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    res.status(500).send("Error disabling 2FA");
  }
});

// Route to redirect to setup page if enabling
router.get("/enable", ensureAuthenticated, async (req, res) => {
  res.redirect("/2fa/setup");
});

// Enable 2FA and Generate QR Code
router.get("/setup", ensureAuthenticated, async (req, res) => {
  try {
    // Check if the user already has a secret
    const user = await User.findById(req.user._id);

    let secret;
    if (user.twoFactorSecret) {
      // Reuse the existing secret
      secret = { base32: user.twoFactorSecret };
      console.log("Using Existing 2FA Secret:", secret.base32);
    } else {
      // Generate a new secret
      secret = speakeasy.generateSecret({
        name: `PortfolioPlatform:${req.user.email}`,
      });

      // Save the new secret to the database
      await User.findByIdAndUpdate(req.user._id, {
        twoFactorSecret: secret.base32,
      });
      console.log("Generated New 2FA Secret:", secret.base32);
    }

    // Generate the otpauth URL
    const otpauthURL = `otpauth://totp/PortfolioPlatform:${req.user.email}?secret=${secret.base32}&issuer=PortfolioPlatform`;
    console.log("Generated QR Code URL:", otpauthURL);

    // Generate and send the QR code
    QRCode.toDataURL(otpauthURL, (err, dataUrl) => {
      if (err) {
        console.error("Error generating QR code:", err);
        return res.status(500).send("Error generating QR code");
      }
      res.render("2fa/setup", { qrCodeUrl: dataUrl, secret: secret.base32 });
    });
  } catch (error) {
    console.error("Error during 2FA setup:", error);
    res.status(500).send("Error during 2FA setup");
  }
});

// Verify 2FA Code and Enable 2FA
router.post("/verify", ensureAuthenticated, async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user._id);

  console.log("2FA Secret (Database):", user.twoFactorSecret);

  // Generate server token
  const serverToken = speakeasy.totp({
    secret: user.twoFactorSecret,
    encoding: "base32",
  });
  console.log("2FA Token (Server):", serverToken);
  console.log("2FA Token (Client):", token);

  const isVerified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 2,
  });
  console.log("2FA Verification Result:", isVerified);

  if (isVerified) {
    await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: true });
    res.redirect("/portfolio");
  } else {
    res.status(400).send("Invalid 2FA token");
  }
});

router.post("/login/2fa", async (req, res) => {
  const { email, token } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("User not found");

  const isVerified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
  });

  if (isVerified) {
    req.login(user, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Login error");
      }
      res.redirect("/portfolio");
    });
  } else {
    res.status(400).send("Invalid 2FA code");
  }
});

module.exports = router;
