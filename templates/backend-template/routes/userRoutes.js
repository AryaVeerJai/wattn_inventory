const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
// const upload = multer({ dest: 'uploads/logos/' });

// Route to create a new dynamic document
// router.post('/create', userController.createOrganization);
router.post('/create', userController.upload.single('profilePic'), userController.createUser);

// Route to get a dynamic document by ID
router.get('/:id', userController.getUserById);

// Route to update a dynamic field
// router.put('/:id/update', userController.updateOrganization);
router.put('/:id/update', userController.upload.single('profilePic'), userController.updateUser);

// Route to delete a dynamic field
router.delete('/:id/delete', userController.deleteUser);

router
  .route("/delete")
  // .get(getProductDetails)
  // .get(getProductDetailsForAdmin)
  // .put(
  //   isAuthenticatedUser,
  //   authorizeRoles("seller", "admin"),
  //   upload.single("img"),
  //   updateProduct
  // )
  // .delete(isAuthenticatedUser, authorizeRoles("seller", "admin"), deleteMultipleMaterials);
  .delete(userController.deleteMultipleUser);

// Route to get all dynamic documents
router.get('/', userController.getAllUser);

module.exports = router;
