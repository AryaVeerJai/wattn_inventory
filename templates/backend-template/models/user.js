const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


//verifiedByAdmin 0->pending 1->approved 2->declined


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Name"],
    maxlength: [30, "Your name cannot be exceed more than 30 Character"],
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Please Enter Email"],
    unique: [true, "User already exist"],
    validate: [validator.isEmail, "Please Enter Valid Email"],
  },
  profilePic: {
    type: String,
    default: ""
  },
  phoneNo: {
    type: String,
    // required: [false, "Please Enter Phone Number"],
    required: false,
    // unique: [true, "User already exist"],
    // unique: true,
  },
  fcm: {
    type: Array,
    default: [],
  },
  role: {
    type: String,
    default: "user",
  },
  password: {
    type: String,
    // required: [true, "Please Enter Password"],
    minlength: [6, "Password must be longer than 6 Character"],
    select: false, //For hiding the text in input field
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "email",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isVerifiedPhone: {
    type: Boolean,
    default: false,
  },

  verifiedByAdmin: {
    type: Number,
    default: 0,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

//Encrypting Password before saving the user

userSchema.pre("save", async function (next) {
  //Checking if password is modified or not
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//Compare User Password

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Return JWT Token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME
  })
};

//Generate Reset Password token

userSchema.methods.getResetPasswordToken = function () {
  //Generate Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Encrypt the token
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //Set the token expire
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};
// module.exports = mongoose.model("User", userSchema);

const User = mongoose.model('User', userSchema);

module.exports = User;

