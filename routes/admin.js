const express = require("express");
const router = express.Router();
const ensureAuthenticated = require("../middlewares/auth");
const ensureAdmin = require("../middlewares/admin");
const Portfolio = require("../models/Portfolio");
const User = require("../models/User");
const sendEmail = require("../utils/mailer");
const upload = require("../config/multer");
const mongoose = require("mongoose");

// View All Portfolios
router.get("/", ensureAdmin, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({});
    res.render("admin/dashboard", { title: "Admin Dashboard", portfolios });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Edit Portfolio Page
router.get("/edit/:id", ensureAdmin, async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio) return res.status(404).send("Portfolio not found");
    res.render("admin/editPortfolio", { title: "Edit Portfolio", portfolio });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Handle Portfolio Edit
router.post(
  "/edit/:id",
  ensureAdmin,
  upload.array("images", 3),
  async (req, res) => {
    const portfolioId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(portfolioId)) {
      return res.status(400).send("Invalid portfolio ID");
    }

    try {
      // Fetch portfolio
      const portfolio = await Portfolio.findById(portfolioId);
      if (!portfolio) {
        return res.status(404).send("Portfolio not found");
      }

      const ownerEmail = portfolio.owner; // Assuming owner is stored as an email
      const owner = await User.findOne({ email: ownerEmail });
      if (!owner) {
        return res.status(404).send("Owner not found");
      }

      // Handle image removal
      if (req.body.removeImages) {
        const indicesToRemove = Array.isArray(req.body.removeImages)
          ? req.body.removeImages.map(Number)
          : [Number(req.body.removeImages)];

        portfolio.images = portfolio.images.filter(
          (_, index) => !indicesToRemove.includes(index)
        );
      }

      // Handle new image uploads
      const newImages = req.files.map((file) => file.path);

      // Update portfolio fields
      portfolio.title = req.body.title || portfolio.title;
      portfolio.description = req.body.description || portfolio.description;

      // Append new images to the existing image array
      if (newImages.length > 0) {
        portfolio.images.push(...newImages);
      }

      await portfolio.save();

      sendEmail(
        owner.email,
        "Portfolio Item Updated",
        `Hi ${owner.firstName},\n\nThe portfolio item titled "${portfolio.title}" has been updated successfully.\n\nBest Regards,\nPortfolio Platform Team`
      );

      res.redirect("/admin");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// Delete Portfolio
router.post("/delete/:id", ensureAdmin, async (req, res) => {
  const portfolioId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(portfolioId)) {
    return res.status(400).send("Invalid portfolio ID");
  }
  try {
    const portfolio = await Portfolio.findById(portfolioId);
    if (!portfolio) {
      return res.status(404).send("Portfolio not found");
    }

    const ownerEmail = portfolio.owner; // Assuming owner is stored as an email
    const owner = await User.findOne({ email: ownerEmail });
    if (!owner) {
      return res.status(404).send("Owner not found");
    }

    await Portfolio.findByIdAndDelete(portfolioId);

    sendEmail(
      req.user.email,
      "Portfolio Item Deleted",
      `Hi ${owner.firstName},\n\nYour portfolio titled "${portfolio.title}" has been deleted by an admin.\n\nBest Regards,\nPortfolio Platform Team`
    );

    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// List all users
router.get("/users", ensureAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.render("admin/users", { users });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Promote a user to admin
router.post("/promote/:id", ensureAdmin, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { role: "admin" });
    res.redirect("/admin/users");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Downgrade a user to editor
router.post("/downgrade/:id", ensureAdmin, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { role: "editor" });
    res.redirect("/admin/users");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
