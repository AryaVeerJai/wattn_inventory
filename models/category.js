const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema({
    // id: Number,
    name: {
        type: String,
        required: [true, "Please Enter Category Name"],
    },
    slug: {
        type: String,
        required: [true, "Please Enter Slug Info"],
    },
    type: {
        type: String,
        enum: {
            values: ["root", "main", "sub"],
            message: "Please select From Above Options",
        },
    },
    // productCount: {
    //     type: String
    // },
    image: {
       id: Number,
       thumbnail: {
        type: String,
        default: '/assets/images/category/cate1.png'
       },
       original: {
        type: String,
        default: '/assets/images/category/collection_1.jpg'
       },
        // required: [true, "Please Enter Image"],

    },
    seoDetails: {
        title: {
            type: String,
        },
        metaDescription: {
            type: String,
        },
    },
    publishStatus: {
        type: Boolean,
    },
    parentCategory: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: false,  // Making parentCategory optiona
            default: null
        },
        name: {
            type: String
        }
    },
    children: [
        {
            id: Number,
            name: String,
            slug: String,
        }
    ],
    // attributes: [
    //     {type: String}
    // ]

}, { timestamps: true });



module.exports = mongoose.model("Category", categorySchema);
