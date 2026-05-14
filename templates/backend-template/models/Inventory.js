// models/Inventory.js
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    index: true
  },

  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },

  quantity: {
    type: Number,
    default: 0
  },

  location: { type: String } // optional

}, { timestamps: true });

// One inventory record per item per location
inventorySchema.index(
  { organizationId: 1, itemId: 1, location: 1 },
  { unique: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);