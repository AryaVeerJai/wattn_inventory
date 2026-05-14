const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["PART", "SUBASSEMBLY", "ASSEMBLY"],
    required: true
  },
  image: {
    type: String,
    default: null,
  },
  invNumber: { type: String, required: true, unique: true },

  attributes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }

}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);