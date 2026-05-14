const mongoose = require("mongoose");

const bomSchema = new mongoose.Schema({
  parentItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },

  components: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("BOM", bomSchema);