const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({

    guestAccount: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    addressDetails: {
        firstName: {
            type: String,
            required: [true, "Please Enter Name"],
        },
        lastName: {
            type: String,
            required: [true, "Please Enter Name"],
        },
        Address: {
            type: String,
            required: [true, "Please Enter Address"],
        },
        city: {
            type: String,
            required: [true, "Please Enter city"],
        },
        pincode: {
            type: String,
            required: [true, "Please Enter pincode"],
        },
        country: {
            type: String,
            required: [true, "Please Enter country"],
        },
        state: {
            type: String,
            required: [true, "Please Enter state"],
        }
    },
    productDetails: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            itemCount: {
                type: Number,
                default: 1
            },
            attribute: {
                type: Array,
                default: []
            }
        }
    ],
    shippingDetails: {
        delivery: {
            type: String,
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        isDelivered: {
            type: Boolean,
            default: false
        },
        deliveryInstruction: {
            type: String,
        },
        deliveredAt: {
            type: Date,
        }
    },
    paymentDetails: {
        paymentMethod: {
            type: String,
            required: [true, "Please Do The Payment"],
        },
        subtotal: {
            type: Number
        },
        paidAt: {
            type: Date,
        },
        isCoupanApplied: {
            type: Boolean,
            default: false
        },
        couponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon",
        },
        couponDiscount: {
            type: Number
        }
    },
    transactionDetails: {
        body: {
            type: String
        },
        success: {
            type: Boolean
        }
    },

    cancelDetails: {
        isCancelled: {
            type: Boolean,
            default: false
        },
        cancelReason: {
            type: String,
            default: "",
        },
    },

    returnDetails: {
        returnRequestValidity:{
            type: Number,
            default: 7
        },
        isReturnRequest: {
            type: Boolean,
            default: false
        },
        isReturned: {
            type: Boolean,
            default: false
        },
        returnReason: {
            type: String,
            default: "",
        },
        returnStatus: {
            type: String,
            default: "",
        },
        returnRejectionReason: {
            type: String,
            default: "",
        },
        isRefund: {
            type: Boolean,
            default: false
        },
        refundStatus: {
            type: String,
            default: "",
        },
    },
    replaceDetails: {
        replaceRequestValidity:{
            type: Number,
            default: 7
        },
        isReplaceRequest: {
            type: Boolean,
            default: false
        },
        isReplaced: {
            type: Boolean,
            default: false
        },
        replaceReason: {
            type: String,
            default: "",
        },
        replaceStatus: {
            type: String,
            default: "",
        },
        replaceRejectionReason: {
            type: String,
            default: "",
        },
    }

}, { timestamps: true });

// Middleware to update returnRequestValidity based on current date and createdAt
orderSchema.pre('findOneAndUpdate', function (next) {
    const currentDate = new Date();
    const createdAt = this._update.createdAt || this._conditions.createdAt;
    const validityPeriod = this._update['$set']['returnDetails.returnRequestValidity'] || this._conditions['returnDetails.returnRequestValidity'];
    
    if (createdAt && validityPeriod) {
        const timeDifference = currentDate - new Date(createdAt);
        const remainingValidity = Math.max(0, validityPeriod - Math.floor(timeDifference / (1000 * 3600 * 24)));
        this.update({}, { $set: { 'returnDetails.returnRequestValidity': remainingValidity } });
        this.update({}, { $set: { 'replaceDetails.replaceRequestValidity': remainingValidity } });
    }
    next();
});



module.exports = mongoose.model("Order", orderSchema);
