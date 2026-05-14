const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");
const { getCouponDetails, updateCoupon, deleteCoupon, addCoupon, allCoupon, getCouponByName, deleteBulkCoupon } = require("../controllers/couponController");

router
    .route("/admin/coupon/:id")
    .get(isAuthenticatedUser, getCouponDetails)
    .post(isAuthenticatedUser, updateCoupon)
    .delete(isAuthenticatedUser, deleteCoupon);


router
    .route("/user/coupon/:id")
    .get(getCouponByName)


router
    .route("/user/coupon")
    .post(isAuthenticatedUser, addCoupon)
    .get(allCoupon)





router
    .route("/admin/bulk/coupon")
    .post(isAuthenticatedUser, authorizeRoles("admin"), deleteBulkCoupon)


module.exports = router;
