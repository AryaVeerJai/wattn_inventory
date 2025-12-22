const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");
const {getAllBrand} = require("../controllers/brandController");

// router
//     .route("/admin/coupon/:id")
//     .get(isAuthenticatedUser, getCouponDetails)
//     .post(isAuthenticatedUser, updateCoupon)
//     .delete(isAuthenticatedUser, deleteCoupon);


// router
//     .route("/user/coupon/:id")
//     .get(getCouponByName)


router
    .route("/user/brands")
    .get(getAllBrand)
    // .post(isAuthenticatedUser, addCoupon)





// router
//     .route("/admin/bulk/coupon")
//     .post(isAuthenticatedUser, authorizeRoles("admin"), deleteBulkCoupon)


module.exports = router;
