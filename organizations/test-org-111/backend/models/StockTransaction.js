// const mongoose = require("mongoose");

// const stockTransactionSchema = new mongoose.Schema({
//   item: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Item",
//     required: true,
//   },

//   type: {
//     type: String,
//     enum: ["IN", "OUT"],
//     required: true,
//   },

//   quantity: {
//     type: Number,
//     required: true,
//     min: 1,
//   },

//   reference: String,
//   note: String,

// }, { timestamps: true });

// module.exports = mongoose.model(
//   "StockTransaction",
//   stockTransactionSchema
// );


const mongoose = require("mongoose");

const stockTransactionSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },

  type: {
    type: String,
    enum: ["IN", "OUT"],
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
    min: 1,
  },

  // 🔥 IMPORTANT (WHY stock changed)
  reason: {
    type: String,
    enum: [
      "MANUAL",
      "PRODUCTION",
      "AUTO_CONSUME",
      "PURCHASE",
      "SALE",
      "ADJUSTMENT"
    ],
    default: "MANUAL",
  },

  // 🔗 Optional linking
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
  },

  referenceModel: {
    type: String, // e.g. "Production", "Order"
  },

  note: String,

}, { timestamps: true });

module.exports = mongoose.model(
  "StockTransaction",
  stockTransactionSchema
);