const express = require("express");
const { updateReview, deleteReview, addReview, allReview, allReviewForAdmin} = require("../controllers/reviewController");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router
    .route("/user/review/:id")
    .post(isAuthenticatedUser, authorizeRoles("seller", "user", "admin"), updateReview)
    .delete(isAuthenticatedUser, authorizeRoles("seller", "user", "admin"), deleteReview)
    .get(allReview)



router
    .route("/user/review")
    // .post(isAuthenticatedUser, authorizeRoles("seller", "user"), addReview)
    .post(isAuthenticatedUser, addReview)
    .get(allReview)


router
    .route("/admin/reviews")
    .get(allReviewForAdmin)
module.exports = router;
