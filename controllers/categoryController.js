const Category = require("../models/category");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");
const awsBucket = require("../utilis/uploadfile");


// Add Category => /api/v1/admin/category

// exports.addCategory = catchAsyncErrors(async (req, res) => {
//     const { name, slug, description, title, metaDescription, visibility, publishDate, type, parentCategory, adminPercentage, attributes } = req.body;
//     const url = await awsBucket(req.file);

//     const category = await Category.create({
//         name,
//         slug,
//         description,
//         seoDetails: {
//             title: title,
//             metaDescription: metaDescription
//         },
//         visibility: {
//             visibility: visibility,
//             publishDate: publishDate
//         },
//         type,
//         parentCategory,
//         image: url,
//         adminPercentage,
//         attributes: attributes.split(',')
//     });



//     res.status(200).json({
//         success: true,
//         category,
//     });
// });


exports.addCategory = catchAsyncErrors(async (req, res) => {
    // const { name, slug, description, title, metaDescription, visibility, publishDate, type, parentCategory, adminPercentage, attributes } = req.body;
    const {name, slug, type, title, metaDescription, image, publishStatus, parentCategoryId, parentCategoryName } = req.body;
    console.log(req.body)

    // let url;
    // if (req.file) {
    //     url = await awsBucket(req.file);
    // }

    const categoryData = {
        name,
        slug,
        type,
        image: {
            thumbnail: image,
            original: image
        },
        seoDetails: {
            title: title,
            metaDescription: metaDescription
        },
        parentCategory: {
            id: parentCategoryId,
            name: parentCategoryName,
        },
        publishStatus,
    };

    // if (url) {
    //     categoryData.image = url;
    // }

    const category = await Category.create(categoryData);

    res.status(200).json({
        success: true,
        category,
    });
});


// GET Category => /api/v1/admin/category


// exports.allCategory = catchAsyncErrors(async (req, res, next) => {
//     const resPerPage = parseInt(req.query.limit) || 10;
//     const categoryCount = await Category.countDocuments({}); //Passing the data into frontend
//     // console.log(req.query);
//     const apiFeatures = new APIFeatures(Category.find({}), req.query)
//         .search()
//         .filter()
//         .sort()
//         .pagination(resPerPage);
//     const category = await apiFeatures.query;

//     res.status(200).json({
//         success: true,
//         count: category.length,
//         categoryCount,
//         category,
//     });
// });


// const APIFeatures = require('../utils/APIFeatures');

// GET Category => /api/v1/admin/allcategory

exports.allCategory = catchAsyncErrors(async (req, res, next) => {
    console.log(req.query)
  const resPerPage = parseInt(req.query.limit) || 10;
  const categoryCount = await Category.countDocuments({});

  const apiFeatures = new APIFeatures(Category.find(), req.query)
    .search()
    .filter()
    .sort()
    .pagination(resPerPage);

  const category = await apiFeatures.query;

  res.status(200).json({
    success: true,
    count: category.length,
    categoryCount,
    category,
  });
});

// GET All Category => /api/v1/user/category


exports.userAllCategory = catchAsyncErrors(async (req, res, next) => {
    console.log("userAllCategory", req.query)
    const resPerPage = parseInt(req.query.limit) || 10;
    const categoryCount = await Category.countDocuments({});
  
    const apiFeatures = new APIFeatures(Category.find(), req.query)
      .search()
      .filter()
      .sort()
      .pagination(resPerPage);
  
    const category = await apiFeatures.query;
  
    res.status(200).json({
      success: true,
      count: category.length,
      categoryCount,
      data: category,
    });
  });


//Get All Category details ===> /api/v1/admin/category/:id
exports.getCategoryDetails = catchAsyncErrors(async (req, res, next) => {
    console.log(req.params)
    const categoryDetails = await Category.findById(req.params.id);
    if (!categoryDetails) {
        return next(
            new ErrorHandler(`Category does not found with this id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        categoryDetails,
    });
});



//Update Category ===> /api/v1/admin/category/:id
exports.updateCategory = catchAsyncErrors(async (req, res, next) => {

    const newUserData = req.body;
    console.log(newUserData)

    // if (typeof newUserData.img != 'string') {
    //     newUserData.image = await awsBucket(req.file);
    // }

    // newUserData.attributes = newUserData.attributes.split(',');

    newUserData.seoDetails = {
        title: newUserData.title,
        metaDescription: newUserData.metaDescription
    };
    newUserData.parentCategory = {
        id: newUserData.parentCategoryId,
        name: newUserData.parentCategoryName
    }
    // newUserData.visibility = {
    //     visibility: newUserData.visibility,
    //     publishDate: newUserData.publishDate
    // };






    const category = await Category.findByIdAndUpdate(req.params.id, { $set: newUserData });

    if (!category) {
        return next(
            ErrorHandler(`Category does not found with this id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
    });
});



//Delete Category ===> /api/v1/admin/category/:id
exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {

    const categorys = await Category.findById(req.params.id);

    if (!categorys) {
        return next(
            ErrorHandler(`Category does not found with this id: ${req.params.id}`)
        );
    }

    // const category = await Category.findByIdAndRemove(req.params.id);
    const attribute = await Category.findOneAndDelete({ _id: req.params.id });




    res.status(200).json({
        success: true,
    });
});


//Delete all Category ===> /api/v1/admin/category
exports.deleteBulkCategory = catchAsyncErrors(async (req, res, next) => {

    console.log("yes")

    const category = await Category.deleteMany({
        _id: {
            $in: req.body.id
        }
    });




    res.status(200).json({
        success: true,
    });
});