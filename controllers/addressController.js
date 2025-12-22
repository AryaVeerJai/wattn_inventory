const Address = require("../models/addressSchema");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");
const mongoose = require("mongoose");


exports.addAddress = catchAsyncErrors(async (req, res) => {
    console.log("addAddress", req.body);
    // const { title, isDefaultAddress, address} = req.body;
    const { 
        country,
        fullName,
        streetAddress,
        city,
        stateReason,
        pinCode,
        phoneNumber,
        isDefaultAddress,
    } = req.body;

    // Find the address by user ID
    let addressData = await Address.findOne({ userId: req.user.id });

    if (addressData) {
        // Check if the product already exists in the address
        // let itemIndex = addressData.addressItems.findIndex((p) => p.productId.toString() === productId);

        // if (itemIndex > -1) {
        //     // Remove the product from the address
        //     address.addressItems.splice(itemIndex, 1);
        //     address = await address.save();

        //     return res.status(200).json({
        //         success: true,
        //         status: "removed",
        //         message: "Item removed from address",
        //         address
        //     });
        // } else {
            // Add the new item to the address
            addressData.addressItems.push({
                // title,
                // isDefaultAddress,
                // address,
                country,
                fullName,
                streetAddress,
                city,
                stateReason,
                pinCode,
                phoneNumber,
                isDefaultAddress,
            });
            addressData = await addressData.save();

            return res.status(200).json({
                status: "added",
                success: true,
                message: "Item added to address",
                addressData
            });
        // }
    } else {
        // Create a new address for the user
        addressData = await Address.create({
            userId: req.user.id,
            addressItems: [
                {
                    country,
                    fullName,
                    streetAddress,
                    city,
                    stateReason,
                    pinCode,
                    phoneNumber,
                    isDefaultAddress,
                }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "address created and item added",
            addressData
        });
    }
});

exports.userAddress = catchAsyncErrors(async (req, res) => {
    console.log("Request for Address", req.user.id)
    // Extract the user ID from the request (assuming req.user.id is populated by some middleware)
    const userId = req.user.id;

    // Find the Address by user ID
    const address = await Address.findOne({ userId });

    if (!address) {
        return res.status(404).json({
            success: false,
            message: "Address not found"
        });
    }

    res.status(200).json({
        success: true,
        address,
    });
});

exports.removeAddressFromAddresslist = catchAsyncErrors(async (req, res) => {
    console.log("Request to Delete Product From Address", req.params)
    const userId = req.user.id;
    const { productId } = req.params;

    // Find the Address by user ID
    let address = await Address.findOne({ userId });

    if (!address) {
        return res.status(404).json({
            success: false,
            message: "Address not found"
        });
    }

    // Find the index of the product to be removed
    const itemIndex = address.addressItems.findIndex((p) => p.productId.toString() === productId);

    if (itemIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Address not found in Address List"
        });
    }

    // Remove the product from the address
    address.addressItems.splice(itemIndex, 1);
    address = await address.save();

    res.status(200).json({
        success: true,
        message: "Product removed from address",
        address,
    });
});