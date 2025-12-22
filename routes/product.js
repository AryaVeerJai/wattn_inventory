const express = require("express");
const router = express.Router();
const {
  getProductDetails,
  updateProduct,
  deleteProduct,
  addProduct,
  allProducts,
  adminAllProducts,
  searchProduct,
  updateProductSingle,
  uploadBulkProduct,
  getProductDetailsForAdmin,
} = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory where you want to store the images
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage });

router
  .route("/admin/product/:id")
  // .get(getProductDetails)
  .get(getProductDetailsForAdmin)
  .put(
    isAuthenticatedUser,
    authorizeRoles("seller", "admin"),
    upload.single("img"),
    updateProduct
  )
  .delete(isAuthenticatedUser, authorizeRoles("seller", "admin"), deleteProduct);

router
  // .route("/admin/product/:id")
  .route("/user/product/:slug")
  .get(getProductDetails)



router
  .route("/admin/product")
  .get(adminAllProducts)
  .post(isAuthenticatedUser, authorizeRoles("seller", "admin"), addProduct);

router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("seller", "admin"), allProducts);
  // .get(allProducts)

router
  .route("/products")
  // .get(isAuthenticatedUser, authorizeRoles("seller", "admin"), allProducts);
  .get(allProducts)

router
  .route("/admin/product/search")
  .post(isAuthenticatedUser, authorizeRoles("seller", "admin"), searchProduct);

router
  .route("/admin/product/:id/single")
  .put(isAuthenticatedUser, authorizeRoles("seller", "admin"), updateProductSingle);

router
  .route("/admin/product/bulk")
  .post(isAuthenticatedUser, authorizeRoles("seller", "admin"), uploadBulkProduct);

router
  .route("/user/product")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    upload.single("img"),
    addProduct
  )
  .get(allProducts);

module.exports = router;
