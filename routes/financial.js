const express = require("express");
const router = express.Router();
const axios = require("axios");
const ensureAuthenticated = require("../middlewares/auth");

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY; // Add your Alpha Vantage API key to .env

// Financial Data Page
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    // Example: Fetch data for Apple Inc. (AAPL)
    const symbol = req.query.symbol || "AAPL"; // Default to AAPL
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;

    const response = await axios.get(url);
    const timeSeries = response.data["Time Series (Daily)"];

    if (!timeSeries) {
      return res.status(400).send("Invalid symbol or data not available");
    }

    // Parse the data into a format suitable for Chart.js
    const labels = Object.keys(timeSeries).slice(0, 30).reverse(); // Last 30 days
    const prices = labels.map((date) =>
      parseFloat(timeSeries[date]["4. close"])
    );

    res.render("financial", {
      symbol,
      labels,
      prices,
      layout: true,
    });
  } catch (err) {
    console.error("Error fetching financial data:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
