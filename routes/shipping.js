const express = require("express");
const { updateshipping, deleteshipping, addshipping, allshipping } = require("../controllers/shippingController");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router
    .route("/user/shipping/:id")
    .post(isAuthenticatedUser, updateshipping)
    .delete(isAuthenticatedUser, deleteshipping)



router
    .route("/user/shipping")
    .post(isAuthenticatedUser, addshipping)
    .get(isAuthenticatedUser, allshipping)


module.exports = router;
