const Review = require("../models/reviewModal");
const ProductDetails = require("../models/productDetails");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");


// Add Review => /api/v1/admin/review

exports.addReview = catchAsyncErrors(async (req, res) => {
    console.log(req.body)
    const {
        review,
        product,
        rating,
        title,
        message,
        stars,
        images
    } = req.body;



    const reviews = await Review.create({
        review,
        product,
        rating,
        title,
        description: message,
        stars,
        images,
        userId: req.user.id,
        author: req.user.name,
        username: req.user.name
    });



    const productDetails = await ProductDetails.findByIdAndUpdate(
        req.body.product,
        { $push: { rating: rating } },
        { new: true } // To return the updated document
      );
    
      if (!productDetails) {
        return res.status(404).json({ error: 'Product details not found' });
      }




    res.status(200).json({
        success: true,
        reviews,
    });
});



//Get All Review details ===> /api/v1/review/:id
exports.allReview = catchAsyncErrors(async (req, res, next) => {
    console.log("rev 40", req.params)
    const resPerPage = parseInt(req.query.limit) || 10;
    const reviewCount = await Review.countDocuments({ product: req.params.id }); //Passing the data into frontend
    // console.log(req.query);
    const apiFeatures = new APIFeatures(Review.find({ product: req.params.id }), req.query)
        .search()
        .filter()
        .sort()
        .pagination(resPerPage);
    const review = await apiFeatures.query;
    // console.log(review)
    res.status(200).json({
        success: true,
        count: review.length,
        reviewCount,
        review,
    });
});


//Get All Review details ===> /api/v1/admin/reviews
exports.allReviewForAdmin = catchAsyncErrors(async (req, res, next) => {
    console.log("rev 40", req.body)
    const resPerPage = parseInt(req.query.limit) || 10;
    const reviewCount = await Review.countDocuments({ }); //Passing the data into frontend
    // console.log(req.query);
    const apiFeatures = new APIFeatures(Review.find({ }), req.query)
        .search()
        .filter()
        .sort()
        .pagination(resPerPage);
    const review = await apiFeatures.query;

    res.status(200).json({
        success: true,
        count: review.length,
        reviewCount,
        review,
    });
});


//Update Review ===> /api/v1/admin/review/:id
exports.updateReview = catchAsyncErrors(async (req, res, next) => {

    const newUserData = req.body;

    const review = await Review.findByIdAndUpdate(req.params.id, { $set: newUserData });
    

    if (!review) {
        return next(
            ErrorHandler(`Review does not found with this id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
    });
});



//Delete Review ===> /api/v1/admin/review/:id
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {

    const reviews = await Review.findById(req.params.id);

    if (!reviews) {
        return next(
            ErrorHandler(`Review does not found with this id: ${req.params.id}`)
        );
    }
  
    // await product.remove();
    await reviews.deleteOne();




    res.status(200).json({
        success: true,
    });
});