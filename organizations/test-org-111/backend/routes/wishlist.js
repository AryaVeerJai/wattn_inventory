// const express = require("express");
// const router = express.Router();
// const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
// const multer = require("multer");
// const { addWishlist, userWishlist, deleteWishlistItem, clearWishlist } = require("../controllers/wishlistController");
// const upload = multer();

// router
//     .route("/user/wishlist")
//     // .get(isAuthenticatedUser, authorizeRoles("seller", "user"), userWishlist)
//     .get(userWishlist)
//     // .post(isAuthenticatedUser, authorizeRoles("seller", "user", "admin"), addWishlist)
//     .post("/user/wishlist", isAuthenticatedUser, authorizeRoles("seller", "user", "admin"), addWishlist)

//     // .post(addWishlist)
//     .delete(isAuthenticatedUser, authorizeRoles("seller", "user"), deleteWishlistItem);

// router
//     .route("/user/clearwishlist")
//     .delete(isAuthenticatedUser, authorizeRoles("seller", "user"), clearWishlist);

// module.exports = router;



const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { addWishlist, userWishlist, deleteWishlistItem, clearWishlist, isProductInWishlist, removeProductFromWishlist } = require("../controllers/wishlistController");

// Route to get and add items to the wishlist
router
    .route("/user/wishlist")
    .get(isAuthenticatedUser, authorizeRoles("seller", "user", "admin"), userWishlist)
    .post(isAuthenticatedUser, authorizeRoles("seller", "user", "admin"), addWishlist)
    .delete(isAuthenticatedUser, authorizeRoles("seller", "user"), deleteWishlistItem);

router
    .route("/user/productinwishlist/:productId")
    .get(isAuthenticatedUser, authorizeRoles("seller", "user", "admin"), isProductInWishlist)
    .delete(isAuthenticatedUser, authorizeRoles("seller", "user", "admin"), removeProductFromWishlist);

// Route to clear the entire wishlist
router
    .route("/user/clearwishlist")
    .delete(isAuthenticatedUser, authorizeRoles("seller", "user"), clearWishlist);

module.exports = router;
