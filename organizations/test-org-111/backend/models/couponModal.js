const mongoose = require("mongoose");


const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Please Enter Code Name"],
        unique: [true, "Please Enter Unique Code Name"]
    },
    couponDescription: {
        type: String,
        required: [true, "Please Enter Coupon Description"],
    },
    type: {
        type: String,
        enum: {
            values: ["percent", "fixed", "freeship"],
            message: "Please select From Above Options",
        },
    },
    discountValue: {
        type: Number,
        default: 0
    },
    usageLimit: {
        type: Number,
    },
    // forRegisteredCustomer: {
    //     type: Boolean,
    //     default: false
    // },
    minSpent:{
        type: Number
    },
    maxSpent:{
        type: Number
    },
    status: {
        type: Boolean,
        default: true
    },
    category:[{
        categoryId: {
            type: mongoose.Schema.Types.ObjectId
        },
        categorySlug: {
            type: String
        },
        name: {
            type: String
        }
    }],
    // startDate: {
    //     type: Date
    // },
    endDate: {
        type: Date
    },
    // couponBy: {
    //     type: String
    // },
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    // }

}, { timestamps: true });



module.exports = mongoose.model("Coupon", couponSchema);
