const mongoose = require("mongoose");


const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Brand Name"],
        unique: [true, "Please Enter Unique Code Name"]
    },
    slug: {
        type: String,
        required: [true, "Please Enter Brand Slug"],
    },

}, { timestamps: true });



module.exports = mongoose.model("Brand", brandSchema);
