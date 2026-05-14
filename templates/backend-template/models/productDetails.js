const mongoose = require("mongoose");

// const prductSchema = new mongoose.Schema(
//   {
//     id:{
//         type: String,
//     },
//     name: {
//         type: String,
//         required: [true, "Please Enter Product Name"],
//     },
//     slug: {
//         type: String,
//         required: [true, "Please Enter Slug Info"],
//     },
//     description: {
//         type: String,
//     },
//     image: {
//         id: {
//             type: Number,
//         },
//         thumbnail: {
//             type: String,
//           },
//           original: {
//             type: String,
//           },
//     },
//     gallery: [
//       {
//         id: {
//           type: Number,
//         },
//         thumbnail: {
//           type: String,
//         },
//         original: {
//           type: String,
//         },
//       },
//     ],
//     quantity: {
//         type: Number,
//     },
//     price: {
//         type: Number,
//     },
//     sale_price: {
//         type: Number,
//         default: null,
//     },
//     unit: {
//         type: String,
//     },
//     tag: [
//       {
//         id: {
//           type: Number,
//         },
//         name: { 
//             type: String 
//         },
//         slug: { 
//             type: String 
//         },
//       },
//     ],
//     product_type : {
//         type: String,
//     },
//     max_price : {
//         type: Number,
//     },
//     min_price: {
//         type: Number,
//     },
//     variations : [
//         {
//             id: {
//                 type: Number,
//             },
//             attribute_id: {
//                 type: Number,
//             },
//             value: {
//                 type: String,
//             },
//             attribute: {
//                 id: Number,
//                 slug: String,
//                 name: String,
//                 values: [
//                     {
//                         id: Number,
//                         attribute_id: Number,
//                         value: String,
//                     }
//                 ]
//             }
//         }
//     ],
//     variation_options: [
//         {
//             id: Number,
//             title: String,
//             price: Number,
//             sale_price: Number,
//             quantity: String,
//             is_disable: Number,
//             sku : String,
//             options: [
//                 {
//                     name: String,
//                     value: String,
//                 }
//             ]
//         }
//     ],
//     // category:[
//     //     {
//     //         type: String,
//     //     }
//     // ]
//       category: [
//         {
//           categoryID: {
//             // type: String,
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Category",
//           },
//           categoryName: {
//             type: String,
//           },
//           slug:{
//             type: String,
//           }
//         },
//       ],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Product", prductSchema);



// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     id: {
//       type: String,
//     },
//     name: {
//       type: String,
//       required: [true, "Please enter the product name"],
//     },
//     slug: {
//       type: String,
//       required: [true, "Please enter the slug info"],
//     },
//     description: {
//       type: String,
//     },
//     image: {
//       id: {
//         type: Number,
//       },
//       thumbnail: {
//         type: String,
//       },
//       original: {
//         type: String,
//       },
//     },
//     gallery: [
//       {
//         id: {
//           type: Number,
//         },
//         thumbnail: {
//           type: String,
//         },
//         original: {
//           type: String,
//         },
//       },
//     ],
//     quantity: {
//       type: Number,
//     },
//     price: {
//       type: Number,
//     },
//     sale_price: {
//       type: Number,
//       default: null,
//     },
//     unit: {
//       type: String,
//     },
//     tag: [
//       {
//         id: {
//           type: Number,
//         },
//         name: {
//           type: String,
//         },
//         slug: {
//           type: String,
//         },
//       },
//     ],
//     product_type: {
//       type: String,
//     },
//     max_price: {
//       type: Number,
//     },
//     min_price: {
//       type: Number,
//     },
//     variations: [
//       {
//         id: {
//           type: Number,
//         },
//         attribute_id: {
//           type: Number,
//         },
//         value: {
//           type: String,
//         },
//         attribute: {
//           id: Number,
//           slug: String,
//           name: String,
//           values: [
//             {
//               id: Number,
//               attribute_id: Number,
//               value: String,
//             },
//           ],
//         },
//       },
//     ],
//     variation_options: [
//       {
//         id: Number,
//         title: String,
//         price: Number,
//         sale_price: Number,
//         quantity: String,
//         is_disable: Number,
//         sku: String,
//         options: [
//           {
//             name: String,
//             value: String,
//           },
//         ],
//       },
//     ],
//     category: [
//       {
//         categoryID: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Category",
//         },
//         categoryName: {
//           type: String,
//         },
//         slug: {
//           type: String,
//         },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Product", productSchema);

// const mongoose = require("mongoose");


// const productSchema = new mongoose.Schema(
//   {
//     id: String,
//     name: {
//       type: String,
//       required: [true, "Please enter the product name"],
//     },
//     slug: {
//       type: String,
//       required: [true, "Please enter the slug info"],
//     },
//     description: String,
//     image: {
//       id: Number,
//       thumbnail: String,
//       original: String,
//     },
//     gallery: [
//       {
//         id: Number,
//         thumbnail: String,
//         original: String,
//       },
//     ],
//     quantity: Number,
//     price: Number,
//     sale_price: {
//       type: Number,
//       default: null,
//     },
//     unit: String,
//     tag: [
//       {
//         id: Number,
//         name: String,
//         slug: String,
//       },
//     ],
//     product_type: {
//       type: String,
//       default: "variable",
//     },
//     max_price: Number,
//     min_price: Number,
//     attributes: [
//       {
//         id: Number,
//         name: String,
//         values: [String],
//       },
//     ],
//     variations: [
//       {
//         id: Number,
//         // Dynamic attributes will be stored here
//         attributeValues: Map,
//       },
//     ],
//     variation_options: [
//       {
//         id: Number,
//         sku: String,
//         price: Number,
//         sale_price: Number,
//         quantity: Number,
//         is_disable: Number,
//         // Dynamic options will be stored here
//         optionValues: Map,
//       },
//     ],
//     category: [
//       {
//         categoryID: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Category",
//         },
//         categoryName: String,
//         slug: String,
//       },
//     ],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Product", productSchema);



// const mongoose = require("mongoose");
// Define a sub-schema for attribute values
// Define a sub-schema for attribute values
const AttributeValueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
}); // Disable _id for sub-documents

const attributeSchema = new mongoose.Schema({
  id: Number,
  name: String,
  values: [String],
});

const variationSchema = new mongoose.Schema({
  id: Number,
  attributes: Map,  // Store attributes with dynamic keys
});

const variationOptionSchema = new mongoose.Schema({
  sku: String,
  price: Number,
  salePrice: Number,
  quantity: Number,
  is_disable: Number,
  options: Map,  // Store options with dynamic keys
});

// const productSchema = new mongoose.Schema(
//   {
//     id: String,
//     name: {
//       type: String,
//       required: [true, "Please enter the product name"],
//     },
//     slug: {
//       type: String,
//       required: [true, "Please enter the slug info"],
//     },
//     description: String,
//     image: {
//       id: Number,
//       thumbnail: String,
//       original: String,
//     },
//     gallery: [
//       {
//         id: Number,
//         thumbnail: String,
//         original: String,
//       },
//     ],
//     quantity: Number,
//     price: Number,
//     sale_price: {
//       type: Number,
//       default: null,
//     },
//     unit: String,
//     tag: String,
//     // tag: [
//     //   {
//     //     id: Number,
//     //     name: String,
//     //     slug: String,
//     //   },
//     // ],
//     product_type: {
//       type: String,
//       default: "variable",
//     },
//     max_price: Number,
//     min_price: Number,
//     attributes: [attributeSchema],
//     variations: [variationSchema],
//     variation_options: [variationOptionSchema],
//     // category: String,
//     category: [
//       {
//         categoryID: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Category",
//         },
//         categoryName: String,
//         slug: String,
//       },
//     ],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Product", productSchema);


// const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Please enter the product name"],
  },
  slug: {
    type: String,
    require: [true, "Please enter the product slug"],
    unique: true,
  },
  description: {
    type: String,
    require: [true, "Please enter the product description"]
  },
  image:{
    type: String,
  },
  imageGallery: [
    {
      imageUrl: String,
      imageStatus: {
        type: String,
        enum: ["Hide", "Show"],
        default: "Show",
      }
    }
  ],
  videoGallery: [
    {
      videoUrl: String,
      videoStatus: {
        type: String,
        enum: ["Hide", "Show"],
        default: "Show",
      },

    }
  ],
  price: {
    type: Number,
    require: [true, "Please enter the product price"]
  },
  salePrice: Number,
  sku: String,
  productType: {
    type: String,
    enum: {
      values: ["Simple", "Variable"],
      message: "Please select From Above Options",
    },
  },
  featuredProduct: {
    type: Boolean,
    default: false,
  },
  productStatus: {
    type: String,
    enum: ["Published", "UnPublished"],
    default: "Published"
  },
  quantity: {
    type: Number,
    default: 1,
  },
  category: 
  // [
      {
        categoryID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        categoryName: String,
        slug: String,
      },
  // ],
  attributes: [attributeSchema],
  defaultAttributes: [
    {
      type: { type: String, },  // Attribute type: 'size', 'color', etc.
      terms: [AttributeValueSchema]         // Array of AttributeValueSchema
    }
  ],
  variations: [variationSchema],
  variationOptions: [variationOptionSchema],
  tag: [
      // {
      //   tagName: { 
      //       type: String 
      //   },
      // },
    ],
  rating: [],
  brand: String,
  trackStock: Boolean,


}, {timestamps: true})

module.exports = mongoose.model("Product", productSchema);