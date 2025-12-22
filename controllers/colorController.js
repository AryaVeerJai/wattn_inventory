const Color = require("../models/colorModal");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");


// Add Color => /api/v1/admin/color

exports.addColor = catchAsyncErrors(async (req, res) => {
    const {
        color
    } = req.body;


    const colors = await Color.create({
        color
    });



    res.status(200).json({
        success: true,
        colors,
    });
});

// GET Color => /api/v1/admin/color


exports.allColor = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = parseInt(req.query.limit) || 10;
    const colorCount = await Color.countDocuments({}); //Passing the data into frontend
    // console.log(req.query);
    const apiFeatures = new APIFeatures(Color.find({}), req.query)
        .search()
        .filter()
        .sort()
        .pagination(resPerPage);
    const color = await apiFeatures.query;

    res.status(200).json({
        success: true,
        count: color.length,
        colorCount,
        data: color,
    });
});



//Get All Color details ===> /api/v1/admin/color/:id
exports.getColorDetails = catchAsyncErrors(async (req, res, next) => {
    const color = await Color.findById(req.params.id);
    if (!color) {
        return next(
            ErrorHandler(`Color does not found with this id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        color,
    });
});



//Update Color ===> /api/v1/admin/color/:id
exports.updateColor = catchAsyncErrors(async (req, res, next) => {

    const { color } = req.body;







    const colors = await Color.findByIdAndUpdate(req.params.id, { $set: { color: color } });

    if (!colors) {
        return res.status(200).json({
            success: false,
        });
    }

    res.status(200).json({
        success: true,
    });
});



//Delete Color ===> /api/v1/admin/color/:id
exports.deleteColor = catchAsyncErrors(async (req, res, next) => {

    const colors = await Color.findById(req.params.id);

    if (!colors) {
        return res.status(200).json({
            success: false,
        });
    }

    const color = await Color.findByIdAndRemove(req.params.id);




    res.status(200).json({
        success: true,
    });
});