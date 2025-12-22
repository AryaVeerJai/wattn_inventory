const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");
const { getCategoryDetails, updateCategory, deleteCategory, addCategory, allCategory, deleteBulkCategory, userAllCategory, } = require("../controllers/categoryController");
const upload = multer();

router
    .route("/admin/allcategory")
    .post(isAuthenticatedUser, authorizeRoles("admin"), upload.single("img"), addCategory)
    .get(allCategory)

router
    .route("/admin/category/:id")
    // .get(isAuthenticatedUser, getCategoryDetails)
    .get(getCategoryDetails)
    // .post(isAuthenticatedUser, authorizeRoles("admin"), upload.single("img"), updateCategory)
    .post(isAuthenticatedUser, authorizeRoles("admin"), updateCategory)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCategory);


router
    .route("/user/category")
    // .post(isAuthenticatedUser, authorizeRoles("admin"), upload.single("img"), addCategory)
    .post(addCategory)
    .get(userAllCategory)





router
    .route("/admin/bulk")
    .post(isAuthenticatedUser, authorizeRoles("admin"), deleteBulkCategory)

module.exports = router;
