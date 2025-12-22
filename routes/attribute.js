const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");
const { getAttributeDetails, updateAttribute, deleteAttribute, addAttribute, allAttribute, deleteBulkAttribute, userAllAttribute, } = require("../controllers/attributeControllers");
const upload = multer();

router
    .route("/admin/allattribute")
    .post(isAuthenticatedUser, authorizeRoles("admin"), upload.single("img"), addAttribute)
    .get(allAttribute)

router
    .route("/admin/attribute/:id")
    // .get(isAuthenticatedUser, getAttributeDetails)
    .get(getAttributeDetails)
    // .post(isAuthenticatedUser, authorizeRoles("admin"), upload.single("img"), updateattribute)
    .post(isAuthenticatedUser, authorizeRoles("admin"), updateAttribute)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteAttribute);


router
    .route("/user/attribute")
    // .post(isAuthenticatedUser, authorizeRoles("admin"), upload.single("img"), addattribute)
    .post(addAttribute)
    .get(userAllAttribute)





router
    .route("/admin/bulk")
    .post(isAuthenticatedUser, authorizeRoles("admin"), deleteBulkAttribute)

module.exports = router;
