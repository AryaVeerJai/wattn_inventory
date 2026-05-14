const express = require("express");
const router = express.Router();
const controller = require("../controllers/itemController");
const { upload } = require("../middleware/fileupload");
const uploadCsv = require("../middleware/uploadCsv");

// Create item
// router.post("/", controller.createItem);

router.post(
  "/",
  upload.single("image"),
  controller.createItem
);

// Get all items
router.get("/", controller.getAllItems);

router.get("/last-number/:type", controller.getLastNumber);

// Get single item
router.get("/:id", controller.getItemById);

// Update item
router.put(
    "/:id",
    upload.single("image"),
    controller.updateItem
);
// router.put("/:id", controller.updateItem);

// Delete item
router.delete("/:id", controller.deleteItem);

router.post(
  "/bulk-upload",
  uploadCsv.single("file"),
  controller.bulkUploadItems
);

module.exports = router;


// Net version of dynamicPartRoutes