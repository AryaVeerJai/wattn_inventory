const Product = require("../models/productDetails");
const Category = require("../models/category");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");
const mongoose = require("mongoose");

// // Add Product => /api/v1/admin/product
// exports.addProduct = catchAsyncErrors(async (req, res) => {
//   console.log(req.body)
//   const {
//     name,
//     slug,
//     description,
//     image,
//     gallery,
//     quantity,
//     price,
//     sale_price,
//     unit,
//     tag,
//     product_type,
//     max_price,
//     min_price,
//     variations,
//     variation_options,
//   } = req.body;

//   const product = await Product.create({
//     name,
//     slug,
//     description,
//     image,
//     gallery,
//     quantity,
//     price,
//     sale_price,
//     unit,
//     tag,
//     product_type,
//     max_price,
//     min_price,
//     variations,
//     variation_options,
//   });

//   res.status(200).json({
//     success: true,
//     product,
//   });
// });

exports.addProduct = catchAsyncErrors(async (req, res) => {
  console.log(req.body);

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
    variations,
    variationOptions,
    attributes,
    defaultAttributes,
    category,
  } = req.body;

  // Transform variations to use maps for attributes
  const transformedVariations = variations.map(variation => {
    const { id, ...attributes } = variation;
    return {
      id,
      attributes: new Map(Object.entries(attributes)),
    };
  });

  // Transform variation options to use maps for options
  const transformedVariationOptions = variationOptions.map(option => {
    const { id, sku, price, salePrice, quantity, is_disable, ...options } = option;
    return {
      id,
      sku,
      price,
      salePrice,
      quantity,
      is_disable,
      options: new Map(Object.entries(options)),
    };
  });

  const product = await Product.create({
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
    variations: transformedVariations,
    variationOptions: transformedVariationOptions,
  });

  res.status(200).json({
    success: true,
    product,
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


// exports.allProducts = catchAsyncErrors(async (req, res, next) => {
//   console.log("Get All Products", req.query);

//   const resPerPage = parseInt(req.query.limit) || 10;
//   const categoryId = req.query.categoryId;
//   let query = Product.find({});

//   // If categoryId is provided, modify the query to filter by categoryId
//   if (categoryId) {
//     query = Product.find({ 'category.categoryId': categoryId});
//   }

//   const apiFeatures = new APIFeatures(query, req.query)
//     .search()
//     .filter()
//     .sort()
//     .pagination(resPerPage);

//   const products = await apiFeatures.query;
//   const productCount = await Product.countDocuments();

//   // res.status(200).json({ products, productCount });
//   res.status(200).json(products);
// });


// api/v1/user/product

exports.allProducts = catchAsyncErrors(async (req, res, next) => {
  console.log("Get All Products", req.query);

  const resPerPage = parseInt(req.query.limit) || 10;
  // const resPerPage = parseInt(req.query.limit) || 2;
  const categoryName = req.query.category;

  let query = Product.find({});

  // If categoryName is provided, modify the query to filter by categoryName
  if (categoryName) {
    // query = Product.find({ 'category.categoryName': categoryName });
    query = Product.find({ 'category.slug': categoryName });
  }

  const apiFeatures = new APIFeatures(query, req.query)
    .search()
    .filter()
    .sort()
    .pagination(resPerPage);

  const products = await apiFeatures.query;
  const productCount = await Product.countDocuments();

  // res.status(200).json({ products, productCount });
  res.status(200).json(products);
});



// Get Product Details => /api/v1/admin/product/:id
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  // const product = await Product.findById(req.params.id)
  const product = await Product.findOne({slug: req.params.slug})
  console.log(req.params.slug)
  // .populate("categoryDetails")
  //   .populate({
  //     path: "category",
  //     select: "name slug", // Add the fields you need from the category
  //   })
    // .populate("sellerDetails");

  if (!product) {
    return next(new ErrorHandler(`Product not found with slug: ${req.params.slug}`));
  }

  // res.status(200).json({
  //   success: true,
  //   product,
  // });
  res.status(200).json(product);
});
exports.getProductDetailsForAdmin = catchAsyncErrors(async (req, res, next) => {
  // const product = await Product.findById(req.params.id)
  const product = await Product.findOne({_id: req.params.id})
  console.log(req.params.id)
  // .populate("categoryDetails")
  //   .populate({
  //     path: "category",
  //     select: "name slug", // Add the fields you need from the category
  //   })
    // .populate("sellerDetails");

  if (!product) {
    return next(new ErrorHandler(`Product not found with Id: ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    product,
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

// Upload Bulk Products (stub) => /api/v1/admin/product/bulk
exports.uploadBulkProduct = catchAsyncErrors(async (req, res, next) => {
  // Placeholder for bulk upload functionality
  res.status(200).json({
    success: true,
    message: "Bulk upload endpoint",
  });
});
