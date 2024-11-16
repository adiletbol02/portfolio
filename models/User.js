const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true }, // Replace username with email
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  role: { type: String, enum: ["admin", "editor"], default: "editor" }, // User role
  portfolioID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Portfolio",
    default: null,
  },
  twoFactorEnabled: { type: Boolean, default: false }, // 2FA status
  twoFactorSecret: { type: String, default: null }, // Secret for 2FA
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
