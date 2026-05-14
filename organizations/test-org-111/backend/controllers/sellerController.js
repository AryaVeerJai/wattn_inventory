const User = require("../models/user");
const Seller = require("../models/sellerDetails");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendEmail = require("../utilis/sendResetEmail");
const sendToken = require("../utilis/jwtToken");
const mongoose = require("mongoose");
const APIFeaturesAggregate = require("../utilis/ApiFeaturesAggregate");

// Register a seller => /api/v1/seller/register

exports.registerSeller = catchAsyncErrors(async (req, res) => {
  const {
    gstDetails,
    addressDetails,
    category,
    kycDetailsFiles,
    sellerDetails,
    kycDetails,
    companyDetails,
    name,
    email,
    password,
    phoneNo,
  } = req.body;

  const seller = await Seller.create({
    gstDetails,
    addressDetails,
    category,
    sellerDetails,
    kycDetailsFiles,
    kycDetails,
    companyDetails,
  });

  let user = await User.create({
    name,
    email,
    password,
    phoneNo,
    role: "seller",
    seller: seller?._id,
  });

  sendEmail({
    email: email,
    subject: "Email verification link",
    message: `Hello ${name},\n\n
        Please verify your account by clicking the link:
        http://143.244.137.105:4000/api/v1/confirmation/${user.getJwtToken()}\n\nThank You!\n`,
  });

  sendToken(user, 200, res);
});

// Check phone exist => /api/v1/seller/checkphone

exports.checkPhoneNo = catchAsyncErrors(async (req, res) => {
  const { phoneNo } = req.body;
  const userExistPhone = await User.findOne({ phoneNo: phoneNo });
  const userExistEmail = await User.findOne({ email: phoneNo });

  if (userExistPhone) {
    return res.status(201).json({
      success: false,
      message: "Phone number already exist",
      isPhone: true,
    });
  } else if (userExistEmail) {
    return res.status(201).json({
      success: false,
      message: "Email already exist",
      isEmail: true,
    });
  }

  return res.status(200).json({
    success: true,
  });
});

//Seller Details /api/v1/seller/details
exports.sellerDetails = catchAsyncErrors(async (req, res) => {
  const {
    gstDetails,
    addressDetails,
    category,
    sellerDetails,
    kycDetails,
    companyDetails,
    kycDetailsFiles,
  } = req.body;

  let seller;
  const userExist = await User.findOne({ _id: req.user.id });
  if (userExist && userExist.role == "seller") {
    const existSeller = await Seller.findOne({ _id: userExist.seller });

    seller = await Seller.updateOne(
      { _id: userExist.seller },
      {
        $set: {
          gstDetails: gstDetails ? gstDetails : existSeller.gstDetails,
          addressDetails: addressDetails
            ? addressDetails
            : existSeller.addressDetails,
          category: category ? category : existSeller.category,
          sellerDetails: sellerDetails
            ? sellerDetails
            : existSeller.sellerDetails,
          kycDetails: kycDetails ? kycDetails : existSeller.kycDetails,
          companyDetails: companyDetails
            ? companyDetails
            : existSeller.companyDetails,
          kycDetailsFiles: kycDetailsFiles
            ? kycDetailsFiles
            : existSeller?.kycDetailsFiles,
        },
      }
    );
  }

  return res.status(200).json({
    success: true,
    seller,
  });
});

//Get Seller details ===> /api/v1/seller/details
exports.getSellerDetails = catchAsyncErrors(async (req, res, next) => {
  let sellerId = mongoose.Types.ObjectId(req.user.id);

  const seller = await User.aggregate([
    {
      $match: {
        _id: sellerId,
      },
    },
    {
      $lookup: {
        from: "sellers",
        localField: "seller",
        foreignField: "_id",
        as: "sellerDetails",
      },
    },
  ]);

  if (!seller) {
    return res.status(200).json({
      success: false,
      error: {
        message: `Seller does not found with this id: ${req.params.id}`,
      },
    });
  }

  return res.status(200).json({
    success: true,
    seller,
  });
});

//get seller list admin
// GET Seller => /api/v1/admin/seller

exports.allSeller = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = parseInt(req.query.limit) || 10;
  const sellerCount = await User.countDocuments({ role: "seller" }); //Passing the data into frontend
  const apiFeatures = new APIFeaturesAggregate(
    User.aggregate([
      {
        $match: {
          role: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $lookup: {
          from: "sellers",
          localField: "seller",
          foreignField: "_id",
          as: "sellerDetails",
        },
      },
      { $unwind: "$sellerDetails" },
      {
        $lookup: {
          from: "categories",
          localField: "sellerDetails.category._id",
          foreignField: "_id",
          as: "sellerDetails.category",
        },
      },
    ]),
    req.query
  )
    .search()
    .filter()
    .sort()
    .pagination(resPerPage);
  const seller = await apiFeatures.query;

  res.status(200).json({
    success: true,
    count: seller.length,
    sellerCount,
    seller,
  });
});

// GET Seller Products => /api/v1/user/seller/product

exports.allSellerProduct = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = parseInt(req.query.limit) || 10;
  const sellerCount = await User.countDocuments({ role: "seller" }); //Passing the data into frontend
  const apiFeatures = new APIFeaturesAggregate(
    User.aggregate([
      {
        $match: {
          role: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $lookup: {
          from: "sellers",
          localField: "seller",
          foreignField: "_id",
          as: "sellerDetails",
        },
      },
      { $unwind: "$sellerDetails" },
      {
        $lookup: {
          from: "categories",
          localField: "sellerDetails.category._id",
          foreignField: "_id",
          as: "sellerDetails.category",
        },
      },
      { $unwind: "$_id" },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "seller",
          as: "productsDetails",
        },
      },
    ]),
    req.query
  )
    .search()
    .filter()
    .sort()
    .pagination(resPerPage);
  const seller = await apiFeatures.query;

  res.status(200).json({
    success: true,
    count: seller.length,
    sellerCount,
    seller,
  });
});

//update admin verification
// update admin verification => /api/v1/seller/verify

exports.verifySeller = catchAsyncErrors(async (req, res) => {
  const { id, value } = req.body;
  const sellerExist = await User.findOne({ _id: id });

  if (sellerExist) {
    const user = await User.findByIdAndUpdate(id, {
      $set: {
        verifiedByAdmin: value,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Seller updated",
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      message: "Seller does not exist",
    },
  });
});
