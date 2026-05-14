const User = require("../models/user");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utilis/jwtToken");
const sendTokenGuest = require("../utilis/guestjwtgenerate");
const sendEmail = require("../utilis/sendResetEmail");
const crypto = require("crypto");
const APIFeatures = require("../utilis/APIFeatures");
const cloudinary = require("../utilis/cloudinary");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { checkVerification, sendVerification } = require("../middleware/twilio");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Login User  =>  /api/v1/login

require('dotenv').config()

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  // const { email, password, fcm, isPhone } = req.body;
  const { email, password, fcm, } = req.body;
  console.log(req.body)
  //Check if email and password entered by user
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        message: `Please enter email and password`,
      },
    });
  }

  let user;

  user = await User.findOne(
    { $or: [{ email: email }, { phoneNo: email }] },
    {
      role: true,
      name: true,
      email: true,
      // phoneNo: true,
      _id: true,
      profilePic: true,
      isVerified: true,
      isVerifiedPhone: true,
    }
  ).select("+password");

  //Finding user in Database

  if (!user) {
    return res.status(402).json({
      success: false,
      error: {
        message: `Invalid Email and Password`,
      },
    });
  }

  // if (!user.isVerified && user.role != "seller" && !isPhone) {
  //   return res.status(500).json({
  //     success: false,
  //     error: {
  //       message: `Please verify your account email first`,
  //     },
  //   });
  if (!user.isVerified && user.role != "seller") {
    return res.status(500).json({
      success: false,
      error: {
        message: `Please verify your account email first`,
      },
    });
  } 
  // else if (!user.isVerifiedPhone && user.role != "seller" && isPhone) {
  //   return res.status(500).json({
  //     success: false,
  //     error: {
  //       type: "phone",
  //       message: `Please verify your account phone number first`,
  //     },
  //   });
  // }

  //Check if entered password is correct or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return res.status(402).json({
      success: false,
      error: {
        message: `Entered Password is wrong!`,
      },
    });
  }

  if (fcm) {
    const updateUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { fcm: fcm } },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  }

  sendToken(user, 200, res);
});


exports.googleLogin = catchAsyncErrors(async (req, res, next) => {
  console.log("google Login", req.body)
  const { token } = req.body;

  // Verify the token with Google
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { name, email, picture } = ticket.getPayload();

  // Check if the user already exists
  let user = await User.findOne({ email });

  if (!user) {
    // If user does not exist, create a new user
    user = await User.create({
      name,
      email,
      profilePic: picture,
      isVerified: true, // Since Google verifies the email
    });
  }

  // Generate a JWT token for the user
  sendToken(user, 200, res);
});



// Login User guest  =>  /api/v1/guestlogin

exports.guestUser = catchAsyncErrors(async (req, res, next) => {
  sendTokenGuest(200, res);
});

// Load User guest  =>  /api/v1/loadguestlogin

exports.loadGuestUser = catchAsyncErrors(async (req, res, next) => {
  console.log(req.user);
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Forgot Password => /api/v1/password/forgot

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  console.log(req)
  let user = await User.findOne({
    $or: [{ email: email }, { phoneNo: email }],
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: `User not found with ${email}` },
    });
  }

  //Get Reset Token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // //Create Reset Password URL
  // const resetUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/password/reset/${resetToken}`;
  // const resetUrl = `http://localhost:3001/admin/password/reset/${resetToken}`;
  const resetUrl = `https://khado.webshark.tech/en/forgot-password/${resetToken}`;
  const message = `Dear ${user.name},\n\nYou recently requested for a password reset from your Tanziva account.You can find your link below and reset your password easily.\n\n${resetUrl}\n\nIf it wasn't you who requested for a password reset, or accidentally made a request, ignore this email.Worry not, your password won't be changed unless initiated by you.\n\nStay Happy!\nTeam Tanziva.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Account Reset Password",
      message,
    });

    res.status(200).json({
      success: true,
      message: `token sent to ${email}`,
      user: {
        resetToken: resetToken,
      },
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      success: false,
      error: {
        message: error.message,
      },
    });
  }
});

// Reset Password => /api/v1/password/reset

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    //Hash URL Token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.body.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (req.body.password !== req.body.confirmPassword) {
      return next(
        res.status(400).json({
          success: false,
          error: {
            message: "Password does not match",
          },
        })
      );
    }

    if (!user) {
      return next(
        res.status(500).json({
          success: false,
          error: {
            message: "Password reset token is invalid or expired",
          },
        })
      );
    }

    //Setup for New Password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return res.status(200).json({
      success: true,
      message: `Password reset successfully`,
    });
  } catch (error) {
    next(error);
  }
});

//Get currently logged in user data  /api/v1/currentUser

exports.currentUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req?.user?.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//Update User Profile /api/v1/user_profile/edit_profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  console.log("Update Prodile", req.body)
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      phoneNo: req.body.phoneNo,
      lastName: req.body.lastName,
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: newUserData },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

//Update User Password  /api/v1/password/update_password

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  console.log("Request to Update Password:", req.body)
  try {
    const user = await User.findById(req.user.id).select("+password");

    //Check User Previous Password
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
      return next(new ErrorHandler("Old Password is incorrect", 400));
    }
    user.password = req.body.password;
    await user.save();
    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// Logout User  =>  /api/v1/logout

exports.logout = catchAsyncErrors(async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      user: {
        message: "Logged Out Successfully",
      },
    });
  } catch (error) {
    next(error);
  }
});

// Admin Route

// Register a user => /api/v1/admin/register

// old working code 26/06/2024
// exports.registerUser = catchAsyncErrors(async (req, res) => {
//   // const { name, email, password, phoneNo, role } = req.body;
//   const { name, email, password } = req.body;
//   console.log("registerUser", req.body)
//   const user = await User.create({
//     name,
//     email,
//     password,
//     // phoneNo,
//     // role,
//   });

//   sendEmail({
//     email: email,
//     subject: "Email verification link",
//     message: `Hello ${name},\n\nPlease verify your account by clicking the link:
//       http://localhost:4000/api/v1/confirmation/${user.getJwtToken()}\n\nThank You!\n`,
//       // http://api.tanziva.com/api/v1/confirmation/${user.getJwtToken()}\n\nThank You!\n`,
//   });

//   // res.status(200).json({
//   //   success: true,
//   //   user,
//   // });
//   sendToken(user, 200, res);
// });

// exports.registerUser = catchAsyncErrors(async (req, res) => {
//   const { name, email, password } = req.body;

//   // Check if the email already exists in the database
//   const existingUser = await User.findOne({ email });

//   if (existingUser) {
//     return res.status(400).json({
//       success: false,
//       message: 'Email address already exists. Please use a different email.',
//     });
//   }

//   // If the email is not found, proceed with creating the new user
//   const user = await User.create({
//     name,
//     email,
//     password,
//   });

//   sendEmail({
//     email: email,
//     subject: "Email verification link",
//     message: `Hello ${name},\n\nPlease verify your account by clicking the link:
//       http://localhost:4000/api/v1/confirmation/${user.getJwtToken()}\n\nThank You!\n`,
//   });

//   // Send response with user details and token
//   sendToken(user, 200, res);
// });

exports.registerUser = catchAsyncErrors(async (req, res) => {
  console.log("Register User ", req.b)
  const { name, email, password } = req.body;

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });


    if (existingUser) {
      const message = `
      <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=\, initial-scale=1.0">
    <title>Order Placed</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>
        body{
            font-family: "Poppins", sans-serif;font-style: normal;padding: 0px;
        }
        .main-box{
            background-color: #EEEEEE;
            padding: 20px;
        }
        .emailsecone{
            background-color: #fff;
            border-radius: 5px;
            padding-inline: 20px;
            padding-block: 40px;
        }
        .track-button-sec{
            margin-top: 20px;
        }
        .track-button-sec p{
            margin-top: 15px; font-size: 14px;
        }
        .track-button{
            border: none; background-color: #2E638C; color: #fff; padding: 12px 30px; border-radius: 5px; font-size: 18px; font-weight: 600;
        }
        .summ-and-addrs{
            display: flex; margin-top: 20px; background-color: #FAFAFA;
        }
        h4,p{
            margin: auto;
        }
        .productinfo{
            margin-top: 30px;
        }
        .callusingo{background-color: #2E638C; text-align: center; color: white; padding: 20px; border-radius: 5px 5px 0px 0px;}
  
        .mail-info-sec{
            margin-top: 20px;
            background-color: #fff;
        }
        .mail-info-sec .iconssec{
            display: flex;
            margin-top: 30px;
            justify-content: space-around;
            padding-block: 20px;
        }
        .iconsec-comm p{
            line-height: 20px;
        }
    </style>
  </head>
  <body>
    <div style="display: flex; justify-content: center;">
        <div style="max-width: 600px;" class="main-box">
            <div class="emailsecone">
                <div style="text-align: center;" class="emailtitle">
                    <img width="30%" src="../Frontend/public/assets/images/logo.png" alt="" srcset="">
                    <h2 style="font-size: 40px; font-weight: 600; margin-bottom: 0;">Welcome to Khado Store</h2>
                    <img width="20%" src="./assets/thankyou.gif" alt="" srcset="">
                </div>
                <div style="text-align: center;" class="track-button-sec">
                    <a href="http://localhost:4000/api/v1/confirmation/${existingUser.getJwtToken()}" style="text-decoration: inherit; margin-bottom: 10px;" class="track-button">VERIFY YOUR ACCOUNT</a>
                    <p>Verify to complete the registration process</p>
                </div>
                <div class="summ-and-addrs">
                </div>
                <div class="productinfo">
                    <p style="text-align: center;">Thank you for registering with Khado Store. To complete the registration process and ensure the security of your account, please click the Above Verify button to verify your email address.</p><br>
                    <p style="font-size: 12px; text-align: start;">Thank you for choosing Khado Store. If you have any questions or need further assistance, please don't hesitate to contact our support team.</p>
                </div>
            </div>
            <div class="mail-info-sec">
                <div class="callusingo">
                    <p style="color: white;">Call Us at <a href="tel:1-800-200-4599" style="font-weight: 600; color: inherit; text-decoration: inherit;">1-800-200-4599</a> or reply to this email</p>
                </div>
                <div class="iconssec">
                    <div style="text-align: center;"  class="iconsec-comm">
                        <img width="60%" src="./assets/24-hours-support.png" alt="">
                        <p  style="font-size: 13px;">CUSTOMER <br> SERVICE</p>
                    </div>
                    <div style="text-align: center;" class="iconsec-comm">
                        <img width="60%" src="./assets/fast-delivery.png" alt="">
                        <p style="font-size: 13px;">FREE SHIPPING <br> ORDERS R49+</p>
                    </div>
                    <div style="text-align: center;" class="iconsec-comm">
                        <img width="60%" src="./assets/100-percent.png" alt="">
                        <p style="font-size: 13px;">SATISFACTION <br> GUARANTEED</p>
                    </div>
                    <div style="text-align: center;" class="iconsec-comm">
                        <img width="60%" src="./assets/returns.png" alt="">
                        <p style="font-size: 13px;">HASSLE-FREE <br> RETURN</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </body>
  </html>
      `;
      sendEmail({
        email: email,
        subject: "Email verification link",
        // message: `Hello ${existingUser.name},\n\nPlease verify your account by clicking the link:
        //   http://localhost:4000/api/v1/confirmation/${existingUser.getJwtToken()}\n\nThank You!\n`,
        message: message,
      });
      return res.status(400).json({
        success: false,
        message: 'Email address already exists. Please use a different email.',
      });
    }

    // If the email is not found, proceed with creating the new user
    const user = await User.create({
      name,
      email,
      password,
    });

    sendEmail({
      email: email,
      subject: "Email verification link",
      // message: message,
      message: `Hello ${name},\n\nPlease verify your account by clicking the link:
      //   http://localhost:4000/api/v1/confirmation/${user.getJwtToken()}\n\nThank You!\n`,
    });

    // Send response with user details and token
    sendToken(user, 200, res);
  } catch (err) {
    // Handle any unexpected errors
    console.error('Error registering user:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
});



//Get All user ===> /api/v1/admin/all_user

exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = parseInt(req.query.limit) || 10;
  const apiFeatures = new APIFeatures(User.find(), req.query)
    .search()
    .filter()
    .sort()
    .pagination(resPerPage);
  const users = await apiFeatures.query;

  const usersCount = await new APIFeatures(User.find(), req.query)
    .search()
    .filter()
    .sort()
    .query.countDocuments({});

  res.status(200).json({
    success: true,
    count: users.length,
    usersCount,
    users,
  });
});

//Get All user ===> /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      ErrorHandler(`User does not found with this id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//Update User ===> /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const password = await bcrypt.hash(req.body.password, 10);

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phoneNo: req.body.phoneNo,
    password: password,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(
      ErrorHandler(`User does not found with this id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
  });
});

exports.registerManager = catchAsyncErrors(async (req, res) => {
  console.log("Register Manager")
  const { name, email, password, phoneNo, role } = req.body;
  const manager = await User.create({
    name,
    email,
    password,
    phoneNo,
    role,
    isVerified: true,
  });

  res.status(200).json({
    success: true,
    manager,
  });
});

//Delete User ===> /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      ErrorHandler(`User does not found with this id: ${req.params.id}`)
    );
  }

  //Remove Profile Pic from Cloudinary - TODO
  await user.remove();

  res.status(200).json({
    success: true,
  });
});

//Update User ===> /api/v1/user
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  // let { url } = await cloudinary(req.body.Profilepic);
  const newUserData = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return res.status(500).json({
      success: false,
      error: {
        message: `User does not found with this id: ${req.user.id}`,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: "profile updated successfully",
    user,
  });
});

exports.updateUserProfilePic = catchAsyncErrors(async (req, res, next) => {
  let { url } = await cloudinary(req.file);
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profilePic: url },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  if (!user) {
    return res.status(500).json({
      success: false,
      error: {
        message: `User does not found with this id: ${req.user.id}`,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: "profile pic updated successfully",
    user,
  });
});

exports.VerifyUser = catchAsyncErrors(async (req, res, next) => {
  const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
  req.user = await User.findByIdAndUpdate(decoded.id, { isVerified: true });

  res.status(200).send("<b>Verified successfully</b>");
});

exports.VerifyPhone = catchAsyncErrors(async (req, res, next) => {
  const { phone, code } = req.body;

  console.log(phone, code);
  const verification = await checkVerification(req, res, "+91" + phone, code);

  console.log(verification);

  if (verification == "approved") {
    let user = await User.updateOne(
      { phoneNo: phone },
      {
        $set: {
          isVerifiedPhone: true,
        },
      }
    );

    user = await User.findOne(
      { phoneNo: phone },
      {
        role: true,
        name: true,
        email: true,
        phoneNo: true,
        _id: true,
        profilePic: true,
        isVerified: true,
      }
    ).select("+password");

    sendToken(user, 200, res);
  }
  return res.status(200).json({
    success: false,
  });
});

exports.SendPhoneOtp = catchAsyncErrors(async (req, res, next) => {
  const { phone } = req.body;
  console.log(phone);
  sendVerification(req, res, "+91" + phone);

  return res.status(200).json({
    success: true,
  });
});

//Delete all User ===> /api/v1/admin/user
exports.deleteBulkUser = catchAsyncErrors(async (req, res, next) => {
  console.log("yes");

  const user = await User.deleteMany({
    _id: {
      $in: req.body.id,
    },
  });

  res.status(200).json({
    success: true,
  });
});

exports.verifyEmail = catchAsyncErrors(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findOne({
    email: email,
  });

  sendEmail({
    email: email,
    subject: "Email verification link",
    message: `Hello ${name},\n\nPlease verify your account by clicking the link:
      http://api.tanziva.com/api/v1/confirmation/${user.getJwtToken()}\n\nThank You!\n`,
  });

  res.status(200).json({
    success: true,
    user,
  });
});
