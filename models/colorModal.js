const mongoose = require("mongoose");


const colorSchema = new mongoose.Schema({
    color: {
        type: String,
        required: [true, "Please Enter Color Code"],
        unique: [true, "Please Enter Unique Color"]
    }

}, { timestamps: true });



module.exports = mongoose.model("Color", colorSchema);
