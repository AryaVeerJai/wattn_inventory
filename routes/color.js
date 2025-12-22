const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const multer = require("multer");
const { getColorDetails, updateColor, deleteColor, addColor, allColor } = require("../controllers/colorController");

router
    .route("/admin/color/:id")
    .get(isAuthenticatedUser, getColorDetails)
    .post(isAuthenticatedUser, updateColor)
    .delete(isAuthenticatedUser, deleteColor);


router
    .route("/user/color")
    .post(isAuthenticatedUser, addColor)
    .get(allColor)


module.exports = router;
