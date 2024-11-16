const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const User = require("../models/User");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const sendEmail = require("../utils/mailer");

// Render Registration Page
router.get("/register", (req, res) => {
  res.render("register", { layout: false });
});

// Handle User Registration
router.post(
  "/register",
  [
    check("email", "Valid email is required").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
    check("firstName", "First Name is required").notEmpty(),
    check("lastName", "Last Name is required").notEmpty(),
    check("age", "Age must be a number").isNumeric(),
    check("gender", "Gender is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, firstName, lastName, age, gender } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send("Email already registered");
      }

      // Create new user
      const newUser = new User({
        email,
        password,
        firstName,
        lastName,
        age,
        gender,
      });
      await newUser.save();

      sendEmail(
        email,
        "Welcome to Portfolio Platform",
        `Hi ${firstName},\n\nWelcome to Portfolio Platform! We're excited to have you on board.\n\nBest Regards,\nPortfolio Platform Team`
      );

      res.redirect("/login"); // Redirect to login page on success
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

router.get("/login", (req, res) => {
  res.render("login", {
    message: req.flash("error"), // Error message if any
    show2FAModal: false, // Default value for the modal
    user: null, // No user data for GET request
    layout: false,
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Incorrect credentials",
  }),
  (req, res) => {
    if (req.user.twoFactorEnabled) {
      // Render login page with 2FA modal
      res.render("login", {
        show2FAModal: true,
        user: req.user,
        message: null,
        layout: false,
      });
    } else {
      res.redirect("/portfolio");
    }
  }
);

router.post("/login/2fa", async (req, res) => {
  const { email, token } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.redirect("/login?message=User not found");

  const isVerified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
  });

  if (isVerified) {
    req.login(user, (err) => {
      if (err) {
        console.error(err);
        return res.redirect("/login?message=Login error");
      }
      res.redirect("/portfolio");
    });
  } else {
    res.redirect("/login?message=Invalid 2FA code");
  }
});

// Handle User Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Logout error");
    res.redirect("/login");
  });
});

module.exports = router;
