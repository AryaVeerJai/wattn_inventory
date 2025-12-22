const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const multer = require('multer');
// const upload = multer({ dest: 'uploads/logos/' });

// Route to create a new dynamic document
// router.post('/create', organizationController.createOrganization);
router.post('/create', organizationController.upload.single('logo'), organizationController.createOrganization);

// Route to get a dynamic document by ID
router.get('/:id', organizationController.getOrganizationById);

// Route to update a dynamic field
// router.put('/:id/update', organizationController.updateOrganization);
router.put('/:id/update', organizationController.upload.single('logo'), organizationController.updateOrganization);

// Route to delete a dynamic field
router.delete('/:id/delete', organizationController.deleteOrganization);

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
  .delete(organizationController.deleteMultipleOrganizations);

// Route to get all dynamic documents
router.get('/', organizationController.getAllOrganizations);

module.exports = router;
