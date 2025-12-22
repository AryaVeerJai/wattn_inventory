const multer = require("multer");
const path = require("path");
// const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utilis/errorHandler");
// const Product = require("../models/productModel"); // Update as needed
const Material = require("../models/materialsSchema");

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure 'uploads/' directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage });

// Upload multiple images => /api/v1/admin/product/:id/upload-images
exports.uploadProductImages = (async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No images uploaded", 400));
  }

  res.status(200).json({
    success: true,
    message: "Images uploaded successfully",
  });
});

// Multer middleware to handle multiple file uploads
exports.uploadMiddleware = upload.array("images", 5); // Limit to 5 images
