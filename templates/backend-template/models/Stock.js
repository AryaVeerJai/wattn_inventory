const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
    unique: true, // one stock record per item
  },

  quantity: {
    type: Number,
    default: 0,
  },

  // Optional but useful
  reserved: {
    type: Number,
    default: 0,
  },

  available: {
    type: Number,
    default: 0,
  },

}, { timestamps: true });

module.exports = mongoose.model("Stock", stockSchema);