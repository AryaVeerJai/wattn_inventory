const mongoose = require("mongoose");
const validator = require("validator");


const sellerSchema = new mongoose.Schema({
    gstDetails: {
        gstNumber: {
            type: String,
            unique: [true, "GSTIN already exist with this number"],

        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        onlyBooks: {
            type: Boolean,
            default: false
        }
    },
    addressDetails: {
        fullName: {
            type: String,
            maxlength: [30, "Your name cannot be exceed more than 30 Character"],
        },
        displayName: {
            type: String,
            maxlength: [30, "Your name cannot be exceed more than 30 Character"],
        },
        storeDescription: {
            type: String,
        },
        pincode: {
            type: Number,

        },
        pickupAddress: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String

        }
        ,
        isCompleted: {
            type: Boolean,
            default: false
        }
    },
    category: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            }
        }
    ],
    sellerDetails: {
        anualTurnover: {
            type: Number
        },
        productSellingRate: {
            type: Number
        },
        otherWebSell: {
            type: Boolean
        }
        ,
        isCompleted: {
            type: Boolean,
            default: false
        }
    },
    kycDetails: {
        panCard: {
            type: String,
        },
        addressProof: {
            type: String,
        }
        ,
        isCompleted: {
            type: Boolean,
            default: false
        }
    },
    kycDetailsFiles:{
        type:Array
    },
    companyDetails: {
        companyName: {
            type: String,
        }
        ,
        isCompleted: {
            type: Boolean,
            default: false
        }
    }

}, { timestamps: true });



module.exports = mongoose.model("Seller", sellerSchema);
