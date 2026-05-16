const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  email: String,
  profilePic: String,
  phoneNo: String,
  fcm: Array,
  role: { type: String, default: "user" },
  password: String,
  isVerified: Boolean,
  type: String,
  createdAt: Date,
  isVerifiedPhone: Boolean,
  verifiedByAdmin: Number,
  seller: mongoose.Schema.Types.ObjectId,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// DO NOT attach model here
module.exports = userSchema;