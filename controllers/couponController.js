const Coupon = require("../models/couponModal");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


// Add Coupon => /api/v1/admin/coupon

exports.addCoupon = catchAsyncErrors(async (req, res) => {
    console.log(req.body)
    const {
        code,
        couponDescription,
        type,
        discountValue,
        usageLimit,
        // forRegisteredCustomer,
        minSpent,
        maxSpent,
        // status,
        // startDate,
        category,
        endDate,
        // couponBy,
    } = req.body;



    const coupon = await Coupon.create({
        code,
        couponDescription,
        type,
        discountValue,
        usageLimit,
        // forRegisteredCustomer,
        minSpent,
        maxSpent,
        // status,
        // startDate,
        category,
        endDate,
        // couponBy,
        // userId: req.user.id
    });



    res.status(200).json({
        success: true,
        coupon,
    });
});

// GET Coupon => /api/v1/admin/coupon


exports.allCoupon = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = parseInt(req.query.limit) || 10;
    const couponCount = await Coupon.countDocuments({}); //Passing the data into frontend
    // console.log(req.query);
    const apiFeatures = new APIFeatures(Coupon.find({}), req.query)
        .search()
        .filter()
        .sort()
        .pagination(resPerPage);
    const coupon = await apiFeatures.query;

    res.status(200).json({
        success: true,
        count: coupon.length,
        couponCount,
        coupon,
    });
});



//Get All Coupon details ===> /api/v1/admin/coupon/:id
exports.getCouponDetails = catchAsyncErrors(async (req, res, next) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        return next(
            ErrorHandler(`Coupon does not found with this id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        coupon,
    });
});


//Get Coupon details ===> /api/v1/user/coupon/:id
exports.getCouponByName = catchAsyncErrors(async (req, res, next) => {

    const startOfDay = new Date().toISOString();


    const coupon = await Coupon.findOne({
        code: req.params.id,
        endDate: {
            $gte: startOfDay
        },
        startDate: {
            $lte: startOfDay
        },
        usageLimit: {
            $gte: 1
        }
    });


    if (!coupon) {
        return res.status(500).json({
            success: false,
            error: {
                message: "Coupon does not exist " + req.params.id
            },
        })
    }



    if (coupon.forRegisteredCustomer && !isAuthenticatedUser) {
        return res.status(500).json({
            success: false,
            error: {
                message: "This coupon is for registered customers please register the site first"
            },
        })
    }

    res.status(200).json({
        success: true,
        coupon,
    });
});


//Update Coupon ===> /api/v1/admin/coupon/:id
exports.updateCoupon = catchAsyncErrors(async (req, res, next) => {
    console.log(req.body);
    const newUserData = req.body;







    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { $set: newUserData });

    if (!coupon) {
        return next(
            ErrorHandler(`Coupon does not found with this id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
    });
});



//Delete Coupon ===> /api/v1/admin/coupon/:id
exports.deleteCoupon = catchAsyncErrors(async (req, res, next) => {

    const coupons = await Coupon.findById(req.params.id);

    if (!coupons) {
        return next(
            ErrorHandler(`Coupon does not found with this id: ${req.params.id}`)
        );
    }

    const coupon = await Coupon.findByIdAndRemove(req.params.id);




    res.status(200).json({
        success: true,
    });
});



//Delete all Coupon ===> /api/v1/admin/coupon
exports.deleteBulkCoupon = catchAsyncErrors(async (req, res, next) => {

    console.log(req.body.id)

    const coupon = await Coupon.deleteMany({
        _id: {
            $in: req.body.id
        }
    });




    res.status(200).json({
        success: true,
    });
});