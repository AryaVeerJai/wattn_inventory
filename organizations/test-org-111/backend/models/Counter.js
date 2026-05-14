const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["PART", "SUBASSEMBLY", "ASSEMBLY"],
      unique: true, // one counter per type
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Counter", counterSchema);