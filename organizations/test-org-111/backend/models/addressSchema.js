const mongoose = require('mongoose');

// const addressSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // Reference to User model assuming you have one
//     required: true,
//     unique: true // Ensures each user has only one wishlist
//   },
//   userName: {
//     type: String,
//   },
//   addressItems: [{
//     title: {
//       type: String,
//       required: true
//     },
//     isDefaultAddress: {
//       type: Boolean,
//       default: false,
//     },
//     address: {
//         lat: String,
//         lng: String,
//         formatted_address: String,
//     }
//   }]
// });



const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model assuming you have one
    required: true,
    unique: true // Ensures each user has only one wishlist
  },
  userName: {
    type: String,
  },
  addressItems: [{
    country: {
      type: String,
    },
    fullName:{
      type: String,
    },
    streetAddress: {
      streetOne: String,
      streetTwo: String,
    },
    city: {
      type: String
    },
    stateReason:{
      type: String
    },
    pinCode:{
      type: Number
    },
    phoneNumber: {
      type: Number
    },
    isDefaultAddress: {
      type: Boolean,
      default: false,
    },
  }]
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;

