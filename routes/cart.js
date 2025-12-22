const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");
const { addCart, userCart, deleteCartItem, clearCart, transferCartOrder } = require("../controllers/cartController");
const upload = multer();

router
    .route("/user/cart")
    .get(isAuthenticatedUser, userCart)
    .post(isAuthenticatedUser, addCart)
    .delete(isAuthenticatedUser, deleteCartItem);

    router
    .route("/guest/carttransfer")
    .post(isAuthenticatedUser, transferCartOrder);

router
    .route("/user/clearcart")
    .delete(isAuthenticatedUser, clearCart);

module.exports = router;
