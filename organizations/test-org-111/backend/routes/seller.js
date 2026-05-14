const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");
const { registerSeller, checkPhoneNo, sellerDetails, getSellerDetails, allSeller, verifySeller, allSellerProduct } = require("../controllers/sellerController");
const upload = multer();

router.route("/seller/register").post(registerSeller);
router.route("/seller/checkphone").post(checkPhoneNo);
router.route("/admin/allseller").get(isAuthenticatedUser, authorizeRoles("admin"), allSeller);
router.route("/admin/verify_seller").put(isAuthenticatedUser, authorizeRoles("admin"), verifySeller);
router.route("/user/allseller/product").get(allSellerProduct);
router
  .route("/seller/details")
  .post(isAuthenticatedUser, authorizeRoles("seller"), sellerDetails)
  .get(isAuthenticatedUser, authorizeRoles("seller"), getSellerDetails);


module.exports = router;
