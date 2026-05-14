const shipping = require("../models/shippingModal");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");


// Add shipping => /api/v1/admin/shipping

exports.addshipping = catchAsyncErrors(async (req, res) => {
    const {
        firstName,
        lastName,
        Address,
        city,
        pincode,
        country,
        state,
        type
    } = req.body;


    const shippings = await shipping.create({
        firstName,
        lastName,
        Address,
        city,
        pincode,
        country,
        state,
        type,
        userId: req.user.id
    });



    res.status(200).json({
        success: true,
        shippings,
    });
});

// GET shipping => /api/v1/admin/shipping


exports.allshipping = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = parseInt(req.query.limit) || 10;
    const shippingCount = await shipping.countDocuments({ userId: req.user.id }); //Passing the data into frontend
    // console.log(req.query);
    const apiFeatures = new APIFeatures(shipping.find({ userId: req.user.id }), req.query)
        .search()
        .filter()
        .sort()
        .pagination(resPerPage);
    const shippingAdd = await apiFeatures.query;

    res.status(200).json({
        success: true,
        count: shippingAdd.length,
        shippingCount,
        shipping:shippingAdd,
    });
});






//Update shipping ===> /api/v1/admin/shipping/:id
exports.updateshipping = catchAsyncErrors(async (req, res, next) => {

    const { shipping } = req.body;

    const shippings = await shipping.findByIdAndUpdate(req.params.id, { $set: newUserData });

    if (!shippings) {
        return res.status(200).json({
            success: false,
        });
    }

    res.status(200).json({
        success: true,
    });
});



//Delete shipping ===> /api/v1/admin/shipping/:id
exports.deleteshipping = catchAsyncErrors(async (req, res, next) => {

    const shippings = await shipping.findById(req.params.id);

    if (!shippings) {
        return res.status(200).json({
            success: false,
        });
    }

    await shipping.findByIdAndRemove(req.params.id);




    res.status(200).json({
        success: true,
    });
});