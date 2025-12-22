const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");
const {
  getProductDetails,
  updateProduct,
  deleteProduct,
  addProduct,
  allProduct,
  searchProduct,
  updateProductSingle,
  uploadBulkProduct,
  allProductForAdmin,
} = require("../controllers/productController");
const upload = multer();

router
  .route("/admin/product")
  .get(allProductForAdmin)

router
  .route("/admin/product/:id")
  .get(getProductDetails)
  .put(
    isAuthenticatedUser,
    authorizeRoles("seller", "admin"),
    upload.single("img"),
    updateProduct
  )
  .delete(isAuthenticatedUser, authorizeRoles("seller", "admin"), deleteProduct);

router
  .route("/user/product")
  .post(
    isAuthenticatedUser,
    authorizeRoles("seller"),
    upload.single("img"),
    addProduct
  )
  .get(allProduct);

router.route("/user/search/product").post(searchProduct);

router
  .route("/product/bulk/upload")
  .post(isAuthenticatedUser, uploadBulkProduct);
router
  .route("/product/update/:id")
  .put(isAuthenticatedUser, updateProductSingle);

module.exports = router;
