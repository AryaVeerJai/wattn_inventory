const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Category Name"],
    },
    slug: {
        type: String,
        required: [true, "Please Enter Slug Info"],
    },
    description: {
        type: String,
    },
    seoDetails: {
        title: {
            type: String,
        },
        metaDescription: {
            type: String,
        },
    },
    visibility: {
        visibility: {
            type: String,
            enum: {
                values: ["Published", "Scheduled", "Hidden"],
                message: "Please select From Above Options",
            },
        },
        date: {
            type: Date
        }
    },
    type: {
        type: String,
        enum: {
            values: ["Root", "Main", "Sub"],
            message: "Please select From Above Options",
        },
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    image: {
        type: String,
        // required: [true, "Please Enter Image"],

    },
    adminPercentage: {
        type: Number
    },
    attributes: {
        type: Array,
        default: []
    }

}, { timestamps: true });



module.exports = mongoose.model("Category", categorySchema);
