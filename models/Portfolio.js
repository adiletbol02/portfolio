const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true }, // Email of the user
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true }, // Array of image URLs
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Portfolio", PortfolioSchema);
