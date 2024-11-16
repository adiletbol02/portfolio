const express = require("express");
const router = express.Router();
const ensureAuthenticated = require("../middlewares/auth");
const ensureAdmin = require("../middlewares/admin");
const Portfolio = require("../models/Portfolio");
const User = require("../models/User");
const sendEmail = require("../utils/mailer");

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
router.post("/edit/:id", ensureAdmin, async (req, res) => {
  try {
    const { title, description, images } = req.body;
    await Portfolio.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        images: images.split(","),
      },
      {
        new: true, // Return the updated document
        timestamps: true, // Ensure updatedAt is updated
      }
    );

    sendEmail(
      req.user.email,
      "Portfolio Item Updated",
      `Hi ${req.user.firstName},\n\nThe portfolio item titled "${title}" has been updated successfully.\n\nBest Regards,\nPortfolio Platform Team`
    );

    res.redirect("/admin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Delete Portfolio
router.post("/delete/:id", ensureAdmin, async (req, res) => {
  try {
    await Portfolio.findByIdAndDelete(req.params.id);

    sendEmail(
      req.user.email,
      "Portfolio Item Deleted",
      `Hi ${req.user.firstName},\n\nThe portfolio item has been deleted successfully.\n\nBest Regards,\nPortfolio Platform Team`
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
