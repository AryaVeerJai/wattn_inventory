const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    cartItem: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            itemCount: {
                type: Number,
                default: 1
            },
            attribute: {
                type: Array,
                default: ""
            }
        }
    ]

}, { timestamps: true });



module.exports = mongoose.model("Cart", cartSchema);
