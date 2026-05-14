const express = require("express");
const router = express.Router();

const {
  saveBOM,
  getBOMTree,
  getBOMByItem,
  deleteBOM,
} = require("../controllers/bomController");

// Create / Update BOM
router.post("/save", saveBOM);

// Get full tree
router.get("/tree/:itemId", getBOMTree);

// Get BOM (flat, for editing)
router.get("/:itemId", getBOMByItem);

// Delete BOM
router.delete("/:itemId", deleteBOM);

module.exports = router;