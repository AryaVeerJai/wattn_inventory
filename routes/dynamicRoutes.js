const express = require('express');
const router = express.Router();
const dynamicController = require('../controllers/dynamicController');

// Route to create a new dynamic document
router.post('/create', dynamicController.createDynamicDocument);

// Route to get a dynamic document by ID
router.get('/:id', dynamicController.getDynamicDocumentById);

// Route to update a dynamic field
router.put('/:id/update-field', dynamicController.updateDynamicField);

// Route to delete a dynamic field
router.delete('/:id/delete-field', dynamicController.deleteDynamicField);

// Route to get all dynamic documents
router.get('/', dynamicController.getAllDynamicDocuments);

module.exports = router;
