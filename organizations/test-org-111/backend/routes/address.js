const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { addAddress, userAddress, removeAddressFromAddresslist } = require("../controllers/addressController");

// Route to get and add items to the wishlist
router
    .route("/user/address")
    .get(isAuthenticatedUser, authorizeRoles("seller", "user", "admin"), userAddress)
    .post(isAuthenticatedUser, authorizeRoles("seller", "user", "admin"), addAddress)
    // .delete(isAuthenticatedUser, authorizeRoles("seller", "user"), deleteWishlistItem);

router
    .route("/user/updateaddress/:addressId")
//     .get(isAuthenticatedUser, authorizeRoles("seller", "user", "admin"), isProductInWishlist)
    .delete(isAuthenticatedUser, authorizeRoles("seller", "user", "admin"), removeAddressFromAddresslist);

// // Route to clear the entire wishlist
// router
//     .route("/user/clearwishlist")
//     .delete(isAuthenticatedUser, authorizeRoles("seller", "user"), clearWishlist);

module.exports = router;
