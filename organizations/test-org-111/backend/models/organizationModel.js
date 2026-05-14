const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


//verifiedByAdmin 0->pending 1->approved 2->declined


const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Name"],
    maxlength: [30, "Your name cannot be exceed more than 30 Character"],
  },
  logo: {
    type: String,
    default: ""
  },
  gst: {
    type: String,
  },
  category: {
    type: String,
  },
  address: {
    type: String,
  },
  noOfUsers:{
    type: Number,
  },
  email: {
    type: String,
    // required: [true, "Please Enter Email"],
    // unique: [true, "Organization already exist"],
    // validate: [validator.isEmail, "Please Enter Valid Email"],
  },
  role: {
    type: String,
    default : "org-admin"
  },
  phoneNo: {
    type: String,
    // required: [false, "Please Enter Phone Number"],
    required: false,
    // unique: [true, "Organization already exist"],
    // unique: true,
  },
  password: {
    type: String,
    default: "wattn@Org",
    required: [true, "Please Enter Password"],
    minlength: [6, "Password must be longer than 6 Character"],
    select: false, //For hiding the text in input field
  },
  isVerified: {
    type: Boolean,
    default: false,
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
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

//Encrypting Password before saving the Organization

// organizationSchema.pre("save", async function (next) {
//   //Checking if password is modified or not
//   if (!this.isModified("password")) {
//     next();
//   }
//   this.password = await bcrypt.hash(this.password, 10);
// });

organizationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//Compare Organization Password

organizationSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Return JWT Token
organizationSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME
  })
};

//Generate Reset Password token

organizationSchema.methods.getResetPasswordToken = function () {
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
// module.exports = mongoose.model("Organization", organizationSchema);

// Model creation
const OrganizationModel = mongoose.model('Organization', organizationSchema);

module.exports = OrganizationModel;
