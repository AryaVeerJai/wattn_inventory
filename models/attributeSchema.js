const mongoose = require("mongoose");


const attributeSchema = new mongoose.Schema({
    // id: Number,
    name: {
        type: String,
        required: [true, "Please Enter Attribute Name"],
    },
    slug: {
        type: String,
        required: [true, "Please Enter Attribute Slug"],
    },
    terms: [
        {
            name: String,
            value: String,
        }
    ],

}, { timestamps: true });



module.exports = mongoose.model("Attribute", attributeSchema);
