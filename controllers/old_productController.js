const Product = require("../models/productDetails");
const Category = require("../models/category");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("fast-csv");
const path = require("path");

// Add Product => /api/v1/admin/product

exports.addProduct = catchAsyncErrors(async (req, res) => {
  const {
    productDetails,
    attributes,
    selectedAttributes,
    pricing,
    inventory,
    images,
    seoDetails,
    visibility,
    category,
    tags,
    seller,
    featured,
    flash,
    specification,
  } = req.body;

  const product = await Product.create({
    productDetails: JSON.parse(productDetails),
    pricing: JSON.parse(pricing),
    inventory: JSON.parse(inventory),
    images: JSON.parse(images),
    seoDetails: JSON.parse(seoDetails),
    visibility: JSON.parse(visibility),
    category: JSON.parse(category),
    tags: JSON.parse(tags),
    seller: req.user._id,
    featured: featured,
    flash: flash,
    specification: JSON.parse(specification),
    attributes: JSON.parse(attributes),
    selectedAttributes: JSON.parse(selectedAttributes),
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// GET Product => /api/v1/admin/product

exports.allProduct = catchAsyncErrors(async (req, res, next) => {
  console.log("log form productcontroller: 57")
  const resPerPage = parseInt(req.query.limit) || 10;
  const apiFeatures = new APIFeatures(Product.find({}), req.query)
    .search()
    .filter()
    .sort()
    .pagination(resPerPage);
  const product = await apiFeatures.query;
  const productCount = await apiFeatures.query.countDocuments({}); //Passing the data into frontend

  res.status(200).json({
    success: true,
    count: product.length,
    productCount,
    product,
  });
});

exports.allProductForAdmin = catchAsyncErrors(async (req, res, next) => {
  console.log("log form productcontroller: 76")
  // const resPerPage = parseInt(req.query.limit) || 10;
  const apiFeatures = new APIFeatures(Product.find({}), req.query)
    .search()
    .filter()
    .sort()
    // .pagination(resPerPage);
  const product = await apiFeatures.query;
  const productCount = await apiFeatures.query.countDocuments({}); //Passing the data into frontend

  res.status(200).json({
    success: true,
    count: product.length,
    productCount,
    product,
  });
});

//Get All Product details ===> /api/v1/admin/product/:id
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  let productId = mongoose.Types.ObjectId(req.params.id);

  const product = await Product.aggregate([
    {
      $match: {
        _id: productId,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category.category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "seller",
        foreignField: "_id",
        as: "sellerDetails",
      },
    },
  ]);

  if (!product) {
    return next(
      ErrorHandler(`Product does not found with this id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    product,
  });
});

//Update Product ===> /api/v1/admin/product/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  const {
    productDetails,
    attributes,
    selectedAttributes,
    pricing,
    inventory,
    images,
    seoDetails,
    visibility,
    category,
    tags,
    featured,
    flash,
    specification,
  } = req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      productDetails: JSON.parse(productDetails),
      pricing: JSON.parse(pricing),
      inventory: JSON.parse(inventory),
      images: JSON.parse(images),
      seoDetails: JSON.parse(seoDetails),
      visibility: JSON.parse(visibility),
      category: JSON.parse(category),
      tags: JSON.parse(tags),
      seller: req.user._id,
      featured: featured,
      flash: flash,
      specification: JSON.parse(specification),
      attributes: JSON.parse(attributes),
      selectedAttributes: JSON.parse(selectedAttributes),
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  if (!product) {
    return next(
      ErrorHandler(`Product does not found with this id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
  });
});

//Delete Product ===> /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.findById(req.params.id);

  if (!products) {
    return next(
      ErrorHandler(`Product does not found with this id: ${req.params.id}`)
    );
  }

  const product = await Product.findByIdAndRemove(req.params.id);

  res.status(200).json({
    success: true,
  });
});

// Search Product => /api/v1/admin/product

exports.searchProduct = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = parseInt(req.query.limit) || 10;
  const apiFeatures = new APIFeatures(
    Product.find({
      "productDetails.name": {
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
  const product = await apiFeatures.query;

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
  const category = await apiFeaturesCategory.query;

  const searches = [...product, ...category];

  let shuffledSearch = searches
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  res.status(200).json({
    success: true,
    searches: shuffledSearch,
  });
});

//Update Product ===> /api/v1/admin/product/:id
exports.updateProductSingle = catchAsyncErrors(async (req, res, next) => {
  const { data } = req.body;

  const product = await Product.findByIdAndUpdate(req.params.id, {
    $set: data,
  });

  if (!product) {
    return next(
      ErrorHandler(`Product does not found with this id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
  });
});

//create Product csv ===> /api/v1/admin/product/:id
exports.uploadBulkProduct = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({});
});
