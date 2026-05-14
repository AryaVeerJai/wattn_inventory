const express = require("express");
const router = express.Router();
const controller = require("../controllers/customFieldController");

// Create field
router.post("/", controller.createField);

// Get all fields
router.get("/", controller.getAllFields);

// Get single field
router.get("/:id", controller.getFieldById);

// Update field
router.put("/:id", controller.updateField);

// Delete field
router.delete("/:id", controller.deleteField);

module.exports = router;


// New version of dynamicRoutes