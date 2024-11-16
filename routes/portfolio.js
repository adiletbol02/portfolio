const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/mailer");
const ensureAuthenticated = require("../middlewares/auth");
const Portfolio = require("../models/Portfolio");

// Portfolio Home (Protected Route)
router.get("/", ensureAuthenticated, async (req, res) => {
  //res.render("portfolio");
  try {
    const portfolio = await Portfolio.findOne({ owner: req.user.email });
    if (!portfolio) {
      return res.render("portfolio", { portfolio: null });
    }
    res.render("portfolio", { portfolio });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Portfolio Creation Page (Protected Route)
router.get("/create", ensureAuthenticated, (req, res) => {
  res.render("createPortfolio");
});

// Handle Portfolio Creation (Protected Route)
router.post("/create", ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, images } = req.body;

    // Check if the user already has a portfolio
    const existingPortfolio = await Portfolio.findOne({
      owner: req.user.email,
    });
    if (existingPortfolio) {
      return res.status(400).send("You already have a portfolio.");
    }

    // Create new portfolio
    const newPortfolio = new Portfolio({
      owner: req.user.email,
      title,
      description,
      images: images.split(","), // Assuming comma-separated URLs
    });
    await newPortfolio.save();

    sendEmail(
      req.user.email,
      "New Portfolio Item Created",
      `Hi ${req.user.firstName},\n\nA new portfolio item titled "${title}" has been created successfully.\n\nBest Regards,\nPortfolio Platform Team`
    );

    res.redirect("/portfolio");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// View All Portfolios
router.get("/all", ensureAuthenticated, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({}, "owner title");
    res.render("allPortfolios", { title: "All Portfolios", portfolios });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// View a Specific Portfolio by Owner
router.get("/view/:email", ensureAuthenticated, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ owner: req.params.email });
    if (!portfolio) {
      return res.status(404).send("Portfolio not found");
    }

    res.render("viewPortfolio", { title: portfolio.title, portfolio });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;