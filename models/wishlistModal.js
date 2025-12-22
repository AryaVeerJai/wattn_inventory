// const mongoose = require("mongoose");


// const wishlistSchema = new mongoose.Schema({

//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//     },
//     wishlistItem: [
//         {
//             item: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: "Product",
//             },
//             attribute: {
//                 type: Array,
//                 default: ""
//             }
//         }
//     ]

// }, { timestamps: true });



// module.exports = mongoose.model("Wishlist", wishlistSchema);



// const mongoose = require('mongoose');

// // Define the schema for the wishlist item
// const wishlistItemSchema = new mongoose.Schema({
//   id: String,
//   name: String,
//   slug: String,
//   description: String,
//   image: {
//     id: Number,
//     thumbnail: String,
//     original: String
//   },
//   gallery: [{
//     id: Number,
//     thumbnail: String,
//     original: String
//   }],
//   quantity: Number,
//   price: Number,
//   sale_price: Number,
//   unit: String,
//   tag: [{
//     id: Number,
//     name: String,
//     slug: String
//   }],
//   variations: [{
//     id: Number,
//     value: String,
//     attribute: {
//       id: Number,
//       name: String,
//       slug: String
//     }
//   }]
// });

// // Create the Mongoose model
// // const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema);

// // module.exports = WishlistItem;
// module.exports = mongoose.model("Wishlist", wishlistItemSchema);

// const mongoose = require('mongoose');
// // const Schema = mongoose.Schema;

// // Define the schema for a Wishlist Item
// const WishlistItemSchema = new mongoose.Schema({
//     itemId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product"
//     },
//     name: {
//         type: String,
//         required: true
//     },
//     image: {
//         type: String,
//     },
//     slug: {
//         type: String,
//         default: ''
//     },
//     price: {
//         type: Number,
//         default: 0
//     }
// });

// // Define the schema for the Wishlist
// const WishlistSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     items: [WishlistItemSchema],
//     // title: {
//     //     type: String,
//     // },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// },{timestamps:true});

// // Create models based on the schemas
// // const WishlistItem = mongoose.model('WishlistItem', WishlistItemSchema);
// // const Wishlist = mongoose.model('Wishlist', WishlistSchema);
// module.exports = mongoose.model("Wishlist", WishlistSchema);

// // module.exports = { Wishlist };



// models/Wishlist.js

// const mongoose = require('mongoose');

// const wishlistSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // Reference to User model assuming you have one
//     required: true,
//     unique: true // Ensures each user has only one wishlist
//   },
//   wishlistItems: [{
//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Product',
//       required: true
//     },
//     name: {
//       type: String,
//       required: true
//     },
//     image: {
//       type: String
//     },
//     slug: {
//       type: String,
//       default: ''
//     },
//     price: {
//       type: Number,
//       default: 0
//     }
//   }]
// });

// const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// module.exports = Wishlist;



const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model assuming you have one
    required: true,
    unique: true // Ensures each user has only one wishlist
  },
  userName: {
    type: String
  },
  wishlistItems: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    slug: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      default: 0
    }
  }]
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;

