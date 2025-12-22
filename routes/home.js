const express = require("express");
const { addHome, allHome, getBanner } = require("../controllers/homeController");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router
    .route("/admin/home")
    .post(isAuthenticatedUser, authorizeRoles('admin'), addHome)
    .get(allHome);

router
    .route("/user/homebanner")
    .get(getBanner);




module.exports = router;
