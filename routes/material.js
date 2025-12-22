const express = require("express");
const router = express.Router();
const path = require("path");
const {
  addMaterial,
  allMaterials,
  getMaterialDetails,
  uploadBulkMaterials,
  deleteMultipleMaterials,
  uploadMaterialImages,
} = require("../controllers/materialsController");
const { uploadProductImages, uploadMiddleware } = require("../controllers/uploadController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Directory where you want to store the images
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "-" + Date.now());
//   },
// });

// Multer setup for CSV uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Uploading")
    cb(null, "uploads/"); // Directory to store uploaded files
  },
  filename: function (req, file, cb) {
    // cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    cb(null, file.originalname);
  },
});

// const imageStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     console.log("Uploading");
//     cb(null, "uploads/"); // Directory to store uploaded files
//   },
//   filename: function (req, file, cb) {
//     // Use the original file name
//     cb(null, file.originalname); // This will preserve the original file name
//   },
// });

// const imageStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     console.log("Uploading Image");
//     cb(null, "uploads/"); // Directory to store uploaded files
//   },
//   filename: function (req, file, cb) {
//     const nameWithoutExtension = path.parse(file.originalname).name;
//     const ext = path.extname(file.originalname);
//     const uniqueName = `${nameWithoutExtension}-${Date.now()}${ext}`;
//     cb(null, uniqueName); // Use a unique name to prevent overwriting
//   },
// });


const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv" || file.mimetype === "application/vnd.ms-excel") {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed!"), false);
  }
};

const imageFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only Image files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });
const imageUpload = multer({ storage, imageFilter });
// const upload = multer({ storage: storage });

// router
//   .route("/admin/product/:id")
//   // .get(getProductDetails)
//   .get(getProductDetailsForAdmin)
//   .put(
//     isAuthenticatedUser,
//     authorizeRoles("seller", "admin"),
//     upload.single("img"),
//     updateProduct
//   )
//   .delete(isAuthenticatedUser, authorizeRoles("seller", "admin"), deleteProduct);



router
  .route("/delete-materials")
  // .get(getProductDetails)
  // .get(getProductDetailsForAdmin)
  // .put(
  //   isAuthenticatedUser,
  //   authorizeRoles("seller", "admin"),
  //   upload.single("img"),
  //   updateProduct
  // )
  // .delete(isAuthenticatedUser, authorizeRoles("seller", "admin"), deleteMultipleMaterials);
  .delete(deleteMultipleMaterials);

router
  .route("/material/:id")
  // .route("/user/product/:slug")
  .get(getMaterialDetails)



// router
//   .route("/admin/product")
//   .get(adminAllProducts)
//   .post(isAuthenticatedUser, authorizeRoles("seller", "admin"), addProduct);

router
  .route("/materials/add-single")
  // .get(adminAllProducts)
  // .post(isAuthenticatedUser, authorizeRoles("admin"), addMaterial);
  .post(addMaterial);

// router
//   .route("/admin/products")
//   .get(isAuthenticatedUser, authorizeRoles("seller", "admin"), allProducts);
//   // .get(allProducts)

router
  .route("/materials")
  // .get(isAuthenticatedUser, authorizeRoles("seller", "admin"), allProducts);
  .get(allMaterials)

// router
//   .route("/admin/product/search")
//   .post(isAuthenticatedUser, authorizeRoles("seller", "admin"), searchProduct);

// router
//   .route("/admin/product/:id/single")
//   .put(isAuthenticatedUser, authorizeRoles("seller", "admin"), updateProductSingle);

// router
//   .route("/material/bulk")
//   // .post(isAuthenticatedUser, authorizeRoles("seller", "admin"), uploadBulkProduct);
//   // .post(uploadBulkMaterials);
//   .post(upload.single("file"), uploadBulkMaterials);

router
  .route("/material/bulk")
  .post(upload.single("file"), uploadBulkMaterials);
  // .post(upload.single("file"), (req, res) => {
  //   console.log(req.file); // Log the uploaded file details
  //   res.json({ success: true, message: "File uploaded successfully!" });
  // });

router
  .route("/material/images")
  .post(imageUpload.single("image"), uploadMaterialImages);

// router
//   .route("/user/product")
//   .post(
//     isAuthenticatedUser,
//     authorizeRoles("admin"),
//     upload.single("img"),
//     addProduct
//   )
//   .get(allProducts);

router.put("/material/upload-images", uploadMiddleware, uploadProductImages);

module.exports = router;
