const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: [String], required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Portfolio", PortfolioSchema);
