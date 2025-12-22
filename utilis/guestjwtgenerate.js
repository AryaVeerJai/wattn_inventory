// Create,Send and Save the Token in Cookie
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const sendTokenGuest = (statusCode, res) => {
  //Create JWT Token

  const id = new mongoose.Types.ObjectId();

  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME
  })

  //Option for Cooke

  const options = {

    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000000000
    ),
    httpOnly: true
  }

  console.log(token);

  res
    .status(statusCode)
    .cookie("token", token, options)
    .cookie("type", "guest", options)
    .json({
      success: true,
      message: "Login successfully",
    });
};

module.exports = sendTokenGuest;
