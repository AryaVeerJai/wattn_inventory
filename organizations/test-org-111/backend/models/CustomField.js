const mongoose = require("mongoose");

const customFieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ["string", "number", "boolean", "date", "dropdown"] },
  required: { type: Boolean, default: false },
  options: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("CustomField", customFieldSchema);