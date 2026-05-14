const Attribute = require("../models/attributeSchema");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");


exports.addAttribute = catchAsyncErrors(async (req, res) => {
    const {name, slug, terms} = req.body;
    console.log(req.body)

    const attributeData = {
        name,
        slug,
        terms,
    };

    const attribute = await Attribute.create(attributeData);

    res.status(200).json({
        success: true,
        attribute,
    });
});


exports.allAttribute = catchAsyncErrors(async (req, res, next) => {
  console.log("allAttributereq", req.query)
  const resPerPage = parseInt(req.query.limit) || 10;
  const attributeCount = await Attribute.countDocuments({});

  const apiFeatures = new APIFeatures(Attribute.find(), req.query)
    .search()
    .filter()
    .sort()
    .pagination(resPerPage);

  const attribute = await apiFeatures.query;

  res.status(200).json({
    success: true,
    count: attribute.length,
    attributeCount,
    attribute,
  });
});

// GET All Attribute => /api/v1/user/attribute


exports.userAllAttribute = catchAsyncErrors(async (req, res, next) => {
    console.log("userAllAttribute", req.query)
    const resPerPage = parseInt(req.query.limit) || 10;
    const attributeCount = await Attribute.countDocuments({});
  
    const apiFeatures = new APIFeatures(Attribute.find(), req.query)
      .search()
      .filter()
      .sort()
      .pagination(resPerPage);
  
    const attribute = await apiFeatures.query;
  
    res.status(200).json({
      success: true,
      count: attribute.length,
      attributeCount,
      data: attribute,
    });
  });


//Get All Attribute details ===> /api/v1/admin/attribute/:id
exports.getAttributeDetails = catchAsyncErrors(async (req, res, next) => {
    console.log("getAttributeDetails", req.params)
    const attributeDetails = await Attribute.findById(req.params.id);
    if (!attributeDetails) {
        return next(
            new ErrorHandler(`Attribute does not found with this id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        attributeDetails,
    });
});



//Update Attribute ===> /api/v1/admin/attribute/:id
exports.updateAttribute = catchAsyncErrors(async (req, res, next) => {
    console.log("attributeDetails", req.body)
    const newUserData = req.body;

    const attribute = await Attribute.findByIdAndUpdate(req.params.id, { $set: newUserData });

    if (!attribute) {
        return next(
            ErrorHandler(`Attribute does not found with this id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
    });
});



//Delete Attribute ===> /api/v1/admin/attribute/:id
exports.deleteAttribute = catchAsyncErrors(async (req, res, next) => {
    console.log("deleteAttribute", req.params)
    const attributes = await Attribute.findById(req.params.id);

    if (!attributes) {
        return next(
            ErrorHandler(`Attribute does not found with this id: ${req.params.id}`)
        );
    }

    // const attribute = await Attribute.findByIdAndRemove(req.params.id);
    const attribute = await Attribute.findOneAndDelete({ _id: req.params.id });


    res.status(200).json({
        success: true,
    });
});


//Delete all Attribute ===> /api/v1/admin/attribute
exports.deleteBulkAttribute = catchAsyncErrors(async (req, res, next) => {

    console.log("deleteBulkAttribute", req.body)

    const attribute = await Attribute.deleteMany({
        _id: {
            $in: req.body.id
        }
    });
    res.status(200).json({
        success: true,
    });
});