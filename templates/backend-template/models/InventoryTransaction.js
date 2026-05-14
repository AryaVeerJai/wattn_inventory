// models/InventoryTransaction.js
const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },

  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },

  type: {
    type: String,
    enum: ["IN", "OUT", "ADJUSTMENT", "PRODUCTION"],
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  reference: { type: String }, // orderId, productionId

  notes: { type: String }

}, { timestamps: true });

module.exports = mongoose.model("InventoryTransaction", inventoryTransactionSchema);