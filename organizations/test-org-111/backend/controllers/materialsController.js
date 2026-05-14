const Product = require("../models/productDetails");
const Material = require("../models/materialsSchema");
const Category = require("../models/category");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");
const mongoose = require("mongoose");

const csv = require("csv-parser"); // To parse CSV files
const fs = require("fs"); // For file system operations
const path = require("path");


exports.addMaterial = catchAsyncErrors(async (req, res) => {
  console.log(req.body);

  const {
    win,
    part_number,
    manufacturer_name,
    part_name,
    value,
    package_case,
    image,
    description,
    price_1_inr,
    price_10_inr,
    price_100_inr,
    footprint_details,
    height,
    distributor_part_sku,
    distributor,
    generic_accepted,
    generic_manufacturing_part_number,
    part_url,
    datasheet,
    notes
  } = req.body;


  const material = await Material.create({
    win,
    part_number,
    manufacturer_name,
    part_name,
    value,
    package_case,
    image,
    description,
    price_1_inr,
    price_10_inr,
    price_100_inr,
    footprint_details,
    height,
    distributor_part_sku,
    distributor,
    generic_accepted,
    generic_manufacturing_part_number,
    part_url,
    datasheet,
    notes
  });

  res.status(200).json({
    success: true,
    material,
  });
});


// GET All Products => /api/v1/admin/products
exports.adminAllProducts = catchAsyncErrors(async (req, res, next) => {
  console.log("Get Products Request From Admin", req.query)
  // const resPerPage = parseInt(req.query.limit) || 10;
  const resPerPage = parseInt(req.query.limit);
  const apiFeatures = new APIFeatures(Product.find({}), req.query)
    .search()
    .filter()
    .sort()
    .pagination(resPerPage);
  const products = await apiFeatures.query;
  const productCount = await Product.countDocuments(); // Adjusted to count all products

  res.status(200).json({
    success: true,
    count: products.length,
    productCount,
    products,
  });
  // res.status(200).json(products);
});


exports.allMaterials = catchAsyncErrors(async (req, res, next) => {
  // console.log("Get All Materials", req.query);

  // const materials = await Material.find();
  // res.status(200).json({ materials });

  // const resPerPage = parseInt(req.query.limit) || 10;
  const resPerPage = parseInt(req.query.limit);
  // const categoryName = req.query.category;

  let query = Material.find({});

  // If categoryName is provided, modify the query to filter by categoryName
  // if (categoryName) {
  //   // query = Product.find({ 'category.categoryName': categoryName });
  //   query = Product.find({ 'category.slug': categoryName });
  // }

  const apiFeatures = new APIFeatures(query, req.query)
    .search()
    .filter()
    .sort()
    .pagination(resPerPage);

  const material = await apiFeatures.query;
  const materialCount = await Material.countDocuments();

  res.status(200).json({ material, materialCount});
  // res.status(200).json(material);
});



// Get Product Details => /api/v1/admin/product/:id
exports.getMaterialDetails = catchAsyncErrors(async (req, res, next) => {
  // const product = await Product.findById(req.params.id)
  const material = await Material.findOne({slug: req.params.slug})
  console.log(req.params.slug)
  // .populate("categoryDetails")
  //   .populate({
  //     path: "category",
  //     select: "name slug", // Add the fields you need from the category
  //   })
    // .populate("sellerDetails");

  if (!material) {
    return next(new ErrorHandler(`Product not found with slug: ${req.params.slug}`));
  }

  res.status(200).json({
    success: true,
    material,
  });
  // res.status(200).json(material);
});
exports.getMaterialDetails = catchAsyncErrors(async (req, res, next) => {
  // const product = await Product.findById(req.params.id)
  const material = await Material.findOne({_id: req.params.id})
  // console.log(req.params.id)
  // .populate("categoryDetails")
  //   .populate({
  //     path: "category",
  //     select: "name slug", // Add the fields you need from the category
  //   })
    // .populate("sellerDetails");

  if (!material) {
    return next(new ErrorHandler(`Product not found with Id: ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    material,
  });
  // res.status(200).json(product);
});

exports.updateProductQuantity = catchAsyncErrors(async (req, res, next) => {
  // Find the product by its ID
  const product = await Product.findOne({ id: req.params.id });

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Assuming product.quantity is the field where quantity is stored
  const { removeProductCount } = req.body;

  // Check if removeProductCount is provided and is a positive number
  if (removeProductCount && Number.isInteger(removeProductCount) && removeProductCount > 0) {
    // Update the quantity
    product.quantity -= removeProductCount;

    // Save the updated product
    await product.save();

    // Respond with success message or updated product information
    return res.status(200).json({
      success: true,
      message: 'Product quantity updated successfully',
      // data: product
    });
  } else {
    // If removeProductCount is not provided or is invalid, return a bad request status
    return res.status(400).json({
      success: false,
      message: 'Invalid or missing removeProductCount value'
    });
  }
});



// Update Product => /api/v1/admin/product/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    slug,
    description,
    image,
    imageGallery,
    videoGallery,
    price,
    salePrice,
    sku,
    productType,
    featuredProduct,
    productStatus,
    quantity,
    tag,
    trackStock,
    attributes,
    category,
    variations,
    defaultAttributes,
    variationOptions,
  } = req.body;
  console.log(req.body)

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      slug,
      description,
      image,
      imageGallery,
      videoGallery,
      price,
      salePrice,
      sku,
      productType,
      featuredProduct,
      productStatus,
      quantity,
      tag,
      trackStock,
      attributes,
      defaultAttributes,
      category,
      variations,
      variationOptions,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  console.log("updateProduct", req.params)
  if (!product) {
    return next(new ErrorHandler(`Product not found with id: ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product => /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler(`Product not found with id: ${req.params.id}`));
  }

  // await product.remove();
  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

exports.deleteMultipleMaterials = catchAsyncErrors(async (req, res, next) => {
  const { materialIds } = req.body;

  if (!materialIds || materialIds.length === 0) {
    return next(new ErrorHandler("No material IDs provided", 400));
  }

  // Check if all IDs exist
  const materials = await Material.find({ _id: { $in: materialIds } });

  if (materials.length !== materialIds.length) {
    return next(new ErrorHandler("One or more materials not found", 404));
  }

  // Delete all materials
  await Material.deleteMany({ _id: { $in: materialIds } });

  res.status(200).json({
    success: true,
    message: `${materialIds.length} materials deleted successfully`,
  });
});


// Search Product => /api/v1/admin/product/search
exports.searchProduct = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = parseInt(req.query.limit) || 10;
  const apiFeatures = new APIFeatures(
    Product.find({
      name: {
        $regex: req.body.name,
        $options: "i",
      },
    }),
    req.query
  )
    .search()
    .filter()
    .sort()
    .pagination(resPerPage);
  const products = await apiFeatures.query;

  const apiFeaturesCategory = new APIFeatures(
    Category.find({
      name: {
        $regex: req.body.name,
        $options: "i",
      },
    }),
    req.query
  )
    .search()
    .filter()
    .sort()
    .pagination(resPerPage);
  const categories = await apiFeaturesCategory.query;

  const searches = [...products, ...categories];
  const shuffledSearch = searches
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  res.status(200).json({
    success: true,
    searches: shuffledSearch,
  });
});

// Update Single Field of Product => /api/v1/admin/product/:id
exports.updateProductSingle = catchAsyncErrors(async (req, res, next) => {
  console.log("updateProductsingle :", req.params)
  const { data } = req.body;

  const product = await Product.findByIdAndUpdate(req.params.id, {
    $set: data,
  });

  if (!product) {
    return next(new ErrorHandler(`Product not found with id: ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// // Upload Bulk Products (stub) => /api/v1/admin/product/bulk
// exports.uploadBulkProduct = catchAsyncErrors(async (req, res, next) => {
//   // Placeholder for bulk upload functionality
//   res.status(200).json({
//     success: true,
//     message: "Bulk upload endpoint",
//   });
// });


// Upload Bulk Materials => /api/v1/admin/materials/bulk
exports.uploadBulkMaterials = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload a CSV file",
    });
  }

  const filePath = path.join(__dirname, "../uploads", req.file.filename);
  const materials = [];

  try {
    // Parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // Map CSV rows to materials schema fields
        materials.push({
          win: row.win,
          part_number: row.part_number,
          manufacturer_name: row.manufacturer_name,
          part_name: row.part_name,
          value: row.value,
          package_case: row.package_case,
          image: row.image,
          description: row.description,
          price_1_inr: parseFloat(row.price_1_inr),
          price_10_inr: parseFloat(row.price_10_inr),
          price_100_inr: parseFloat(row.price_100_inr),
          footprint_details: row.footprint_details,
          // height: parseFloat(row?.height),
          height: parseFloat(row.height) || null,
          distributor_part_sku: row.distributor_part_sku,
          distributor: row.distributor,
          generic_accepted: row.generic_accepted,
          generic_manufacturing_part_number: row.generic_manufacturing_part_number,
          part_url: row.part_url,
          datasheet: row.datasheet,
          notes: row.notes,
        });
      })
      .on("end", async () => {
        try {
          // Insert data into the database
          await Material.insertMany(materials);

          // Remove the file after successful processing
          fs.unlinkSync(filePath);

          res.status(200).json({
            success: true,
            message: `${materials.length} materials uploaded successfully!`,
          });
        } catch (error) {
          console.error("Database Error: ", error.message);
          res.status(500).json({
            success: false,
            message: "An error occurred while saving the materials to the database",
            error: error.message,
          });
        }
      });
  } catch (error) {
    console.error("Processing Error: ", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the CSV file",
      error: error.message,
    });
  }
});




// Upload Images => /api/v1/admin/material/Images
exports.uploadMaterialImages = catchAsyncErrors(async (req, res, next) => {
  console.log(req.file)
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload a Image",
    });
  }

  // const filePath = path.join(__dirname, "../uploads", req.file.filename);
  // const materials = [];

  try {
    res.status(200).json({
      success: true,
      message: `Image uploaded successfully!`,
    });
    console.log("Image Uploaded")
  } catch (error) {
    console.error("Processing Error: ", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the Image file",
      error: error.message,
    });
  }
});
