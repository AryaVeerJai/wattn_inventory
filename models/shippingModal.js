
const mongoose = require("mongoose");


const shippingSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please Enter Name"],
    },
    lastName: {
        type: String,
        required: [true, "Please Enter Name"],
    },
    Address: {
        type: String,
        required: [true, "Please Enter Address"],
    },
    city: {
        type: String,
        required: [true, "Please Enter city"],
    },
    pincode: {
        type: String,
        required: [true, "Please Enter pincode"],
    },
    country: {
        type: String,
        required: [true, "Please Enter country"],
    },
    state: {
        type: String,
        required: [true, "Please Enter state"],
    },
    type: {
        type: String,
        enum: {
            values: ["billing", "shipping"],
            message: "Please select From Above Options",
        },
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

}, { timestamps: true });



module.exports = mongoose.model("Shipping", shippingSchema);

