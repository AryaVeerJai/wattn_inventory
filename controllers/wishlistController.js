const Wishlist = require("../models/wishlistModal");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");
const mongoose = require("mongoose");


// Add Wishlist => /api/v1/user/wishlist

// exports.addWishlist = catchAsyncErrors(async (req, res) => {
//     console.log("addWishlist", req.body)
//     const { productId, name, image, slug, price } = req.body;


//     // let wishlist = await Wishlist.findOne({ userId: req.user.id });
//     let wishlist = await Wishlist.findById(req.body.id);
   

//     if (wishlist) {

//         let itemIndex = wishlist?.wishlistItem.findIndex((p) => p.item == productId);


//         if (itemIndex > -1) {
//             return res.status(200).json({
//                 success: true,
//                 message: "Item already exist in wishlist"
//             });
//         }

//         else {
//             wishlist.wishlistItem.push({
//                 item: productId,
//                 attribute: attribute
//             })
//         }
//         wishlist = await wishlist.save();

//     }

//     else {
//         wishlist = await Wishlist.create({
//             userId: req.user.id,
//             items: [
//                 {
//                     productId: productId,
//                     name: name,
//                     image: image,
//                     slug: slug,
//                     price: price,
//                 }
//             ]
//         })
//     }



//     res.status(200).json({
//         success: true,
//         wishlist,
//     });
// });

// exports.addWishlist = catchAsyncErrors(async (req, res) => {
//     console.log("addWishlist", req.body);
//     const { productId, name, image, slug, price } = req.body;

//     // Find the wishlist by user ID
//     let wishlist = await Wishlist.findOne({ userId: req.user.id});

//     if (wishlist) {
//         // Check if the product already exists in the wishlist
//         let itemIndex = wishlist.wishlistItems.findIndex((p) => p.productId.toString() === productId);

//         if (itemIndex > -1) {
//             return res.status(200).json({
//                 success: true,
//                 message: "Item already exists in wishlist"
//             });
//         } else {
//             // Add the new item to the wishlist
//             wishlist.wishlistItems.push({
//                 productId,
//                 name,
//                 image,
//                 slug,
//                 price
//             });
//         }
//         wishlist = await wishlist.save();
//     } else {
//         // Create a new wishlist for the user
//         wishlist = await Wishlist.create({
//             userId: req.user.id,
//             userName: req.user.name,
//             wishlistItems: [
//                 {
//                     productId,
//                     name,
//                     image,
//                     slug,
//                     price
//                 }
//             ]
//         });
//     }

//     res.status(200).json({
//         success: true,
//         wishlist,
//     });
// });

exports.addWishlist = catchAsyncErrors(async (req, res) => {
    console.log("addWishlist", req.body);
    const { productId, name, image, slug, price } = req.body;

    // Find the wishlist by user ID
    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    if (wishlist) {
        // Check if the product already exists in the wishlist
        let itemIndex = wishlist.wishlistItems.findIndex((p) => p.productId.toString() === productId);

        if (itemIndex > -1) {
            // Remove the product from the wishlist
            wishlist.wishlistItems.splice(itemIndex, 1);
            wishlist = await wishlist.save();

            return res.status(200).json({
                success: true,
                status: "removed",
                message: "Item removed from wishlist",
                wishlist
            });
        } else {
            // Add the new item to the wishlist
            wishlist.wishlistItems.push({
                productId,
                name,
                image,
                slug,
                price
            });
            wishlist = await wishlist.save();

            return res.status(200).json({
                status: "added",
                success: true,
                message: "Item added to wishlist",
                wishlist
            });
        }
    } else {
        // Create a new wishlist for the user
        wishlist = await Wishlist.create({
            userId: req.user.id,
            wishlistItems: [
                {
                    productId,
                    name,
                    image,
                    slug,
                    price
                }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Wishlist created and item added",
            wishlist
        });
    }
});


// GET User Wishlist => /api/v1/user/wishlist


// exports.userWishlist = catchAsyncErrors(async (req, res, next) => {

//     let userId = mongoose.Types.ObjectId(req.user.id);

//     // const bprice = await Wishlist.find({});
//     //     res.status(201).json(bprice);

//     const wishlist = await Wishlist.aggregate([
//         {
//             $match: {
//                 userId: userId
//             },
//         },
//         { $unwind: "$wishlistItem" },
//         {

//             $lookup: {
//                 from: "products",
//                 localField: "wishlistItem.item",
//                 foreignField: "_id",
//                 as: "wishlistItem.productDetails",
//             },
//         },
//         { "$unwind": "$wishlistItem.productDetails" },
//         {
//             "$group": {
//                 "_id": "$_id",
//                 "userId": { "$first": "$userId" },
//                 "wishlistItem": { "$push": "$wishlistItem" }
//             }
//         }
//     ])

//     let subtotal = 0;
//     if (wishlist?.length > 0) {
//         for (let i = 0; i < wishlist[0]?.wishlistItem?.length; i++) {
//             subtotal += wishlist[0]?.wishlistItem[i]?.productDetails?.pricing?.price * wishlist[0]?.wishlistItem[i]?.itemCount
//         }
//     }
//     res.status(200).json({
//         success: true,
//         wishlist,
//         subtotal
//     });
// });

exports.userWishlist = catchAsyncErrors(async (req, res) => {
    // Extract the user ID from the request (assuming req.user.id is populated by some middleware)
    const userId = req.user.id;

    // Find the wishlist by user ID
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
        return res.status(404).json({
            success: false,
            message: "Wishlist not found"
        });
    }

    res.status(200).json({
        success: true,
        wishlist,
    });
});


// const Wishlist = require('../models/Wishlist'); // Adjust the path as needed

exports.isProductInWishlist = catchAsyncErrors(async (req, res) => {
    console.log(req.params)
    const userId = req.user.id;
    const { productId } = req.params;

    // Find the wishlist by user ID
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
        return res.status(404).json({
            success: false,
            message: "Wishlist not found"
        });
    }

    // Check if the product is in the wishlist
    const itemIndex = wishlist.wishlistItems.findIndex((p) => p.productId.toString() === productId);

    if (itemIndex > -1) {
        return res.status(200).json({
            success: true,
            message: "Product is in the wishlist",
            inWishlist: true
        });
    } else {
        return res.status(200).json({
            success: true,
            message: "Product is not in the wishlist",
            inWishlist: false
        });
    }
});


exports.removeProductFromWishlist = catchAsyncErrors(async (req, res) => {
    console.log("Request to Delete Product From Wishlist", req.params)
    const userId = req.user.id;
    const { productId } = req.params;

    // Find the wishlist by user ID
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
        return res.status(404).json({
            success: false,
            message: "Wishlist not found"
        });
    }

    // Find the index of the product to be removed
    const itemIndex = wishlist.wishlistItems.findIndex((p) => p.productId.toString() === productId);

    if (itemIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Product not found in wishlist"
        });
    }

    // Remove the product from the wishlist
    wishlist.wishlistItems.splice(itemIndex, 1);
    wishlist = await wishlist.save();

    res.status(200).json({
        success: true,
        message: "Product removed from wishlist",
        wishlist,
    });
});



//Delete wishlist item ===> /api/v1/user/wishlist
exports.deleteWishlistItem = catchAsyncErrors(async (req, res, next) => {

    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    let itemIndex = wishlist?.wishlistItem.findIndex((p) => p.item == req.body.productId);

    if (itemIndex > -1) {
        wishlist?.wishlistItem?.splice(itemIndex, 1);
    }

    wishlist = await wishlist.save();

   

    res.status(200).json({
        success: true,
        wishlist,
        message: "Wishlist Item Deleted Successfully"

    });
});



//Clear wishlist ===> /api/v1/user/clearWishlist
exports.clearWishlist = catchAsyncErrors(async (req, res, next) => {



    const wishlist = Wishlist.remove({ userId: req.user.id });

    res.status(200).json({
        success: true,
        message: "Wishlist clear successfully"
    });
});

