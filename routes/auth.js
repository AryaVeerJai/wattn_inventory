const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  currentUser,
  updatePassword,
  updateProfile,
  allUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  updateUserProfile,
  updateUserProfilePic,
  VerifyUser,
  registerManager,
  guestUser,
  loadGuestUser,
  deleteBulkUser,
  SendPhoneOtp,
  VerifyPhone,
  verifyEmail,
  googleLogin
} = require("../controllers/authControllers");
const multer = require("multer");
const upload = multer();

router.route("/login").post(loginUser);

router.post('/google-login', googleLogin);

router
  .route("/guestlogin")
  .post(guestUser)
  .get(isAuthenticatedUser, loadGuestUser);

router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset").post(resetPassword);

router.route("/currentUser").get(isAuthenticatedUser, currentUser);
router
  .route("/profile/update_password")
  .put(isAuthenticatedUser, updatePassword);
router.route("/profile/edit_profile").put(isAuthenticatedUser, updateProfile);

router.route("/user/register").post(registerUser);
router
  .route("/admin/register_manager")
  .post(isAuthenticatedUser, authorizeRoles("admin"), registerManager);
router
  .route("/admin/all_users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allUsers);

router
  .route("/admin/users/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetails)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUser)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

router.route("/user").post(isAuthenticatedUser, updateUserProfile);
router
  .route("/userProfilePic")
  .post(isAuthenticatedUser, upload.single("Profilepic"), updateUserProfilePic);
router.route("/confirmation/:token").get(VerifyUser);

router
  .route("/admin/bulk/user")
  .post(isAuthenticatedUser, authorizeRoles("admin"), deleteBulkUser);

router.route("/user/sendotp").post(SendPhoneOtp);

router.route("/user/verifyotp").post(VerifyPhone);
router.route("/user/verifyEmail").post(verifyEmail);

module.exports = router;
