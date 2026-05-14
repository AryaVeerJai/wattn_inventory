const Home = require("../models/homeModal");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


// Add Home => /api/v1/admin/home

exports.addHome = catchAsyncErrors(async (req, res) => {

    console.log(req.body)

    const {
        field,
        value
    } = req.body;


    let homeFiels = await Home.findOne({});

    if (homeFiels) {
        homeFiels[field] = value;
        homeFiels = await homeFiels.save();
    }
    else {
        homeFiels = await Home.create({
            [field]: value
        });
    }



    res.status(200).json({
        success: true,
        homeFiels
    });
});



exports.allHome = catchAsyncErrors(async (req, res, next) => {

    const home = await Home.findOne({});

    res.status(200).json({
        success: true,
        home
    });
});

exports.getBanner = catchAsyncErrors(async (req, res, next) => {

    const home = await Home.findOne({});
    // Assuming `home` object has a `banner` property containing the banner data
    const banner = home.banner;

    res.status(200).json(
        // {
        // success: true,
        banner
    // }
);
});


