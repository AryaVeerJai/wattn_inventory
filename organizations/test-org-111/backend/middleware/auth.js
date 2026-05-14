const jwt = require("jsonwebtoken");
const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require("../utilis/errorHandler");
const User = require("../models/user");

//Check if user is authenticate or not

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.cookies;
  const token =
    !req.headers.token ||
    req.headers.token == "null" ||
    req.headers.token == "undefined"
      ? req.cookies.token
      : req.headers.token;
  console.log("token",token);

  if (!token || token == "null" || token == "undefined") {
    return res.status(401).json({
      success: false,
      error: {
        message: `Please login into your account`,
      },
    });
  }

  //If token exists verify the user

  if (type == "guest" && token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    req.user = {
      id: decoded.id,
      name: "Guest Account",
      role: "guest",
    };
    next();
  } else if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  }
});

// Handling User Roles

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `${req.user.role} is not allowed to access this resource`,
        },
      });
    }
    next();
  };
};
