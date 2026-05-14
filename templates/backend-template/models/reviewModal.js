const mongoose = require("mongoose");


const reviewSchema = new mongoose.Schema({
    review: {
        type: String
    },
    rating: {
        type: Number
    },
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    author:{
        type: String
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    stars: {
        type: Number,
        // default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    username: {
        type: String,
    },
    images: {
        type: Array,
        default: []
    },
    status: {
        type: String,
        default: "pending",
        enum: {
          values: ["pending", "approved", "rejected"],
        },
    }

}, { timestamps: true });



module.exports = mongoose.model("Review", reviewSchema);
