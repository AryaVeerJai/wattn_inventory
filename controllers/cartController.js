const Cart = require("../models/cartModal");
const Order = require("../models/orderModal");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");
const mongoose = require("mongoose");

// Add Cart => /api/v1/user/cart

exports.addCart = catchAsyncErrors(async (req, res) => {
  const { productId, count, attribute, isUpdate } = req.body;

  let cart = await Cart.findOne({ userId: req.user.id });

  if (cart) {
    if (isUpdate) {
      let itemIndex = cart?.cartItem.findIndex(
        (p) =>
          p.item == productId && p.attribute.toString() == attribute.toString()
      );

      if (itemIndex > -1) {
        return res.status(400).json({
          success: false,
          error: {
            message: `You can't add two same items in cart`,
          },
        });
      } else {
        cart.cartItem.find((item) => item.item == productId).itemCount = count;
        cart.cartItem.find(
          (item) => item.item == productId
        ).attribute = attribute;
      }
    } else {
      let itemIndex = cart?.cartItem.findIndex(
        (p) =>
          p.item == productId && p.attribute.toString() == attribute.toString()
      );

      if (itemIndex > -1) {
        cart.cartItem[itemIndex].itemCount = count;
      } else {
        cart.cartItem.push({
          item: productId,
          itemCount: count,
          attribute: attribute,
        });
      }
    }
    cart = await cart.save();
  } else {
    cart = Cart.create({
      userId: req.user.id,
      cartItem: [
        {
          item: productId,
          itemCount: count,
          attribute: attribute,
        },
      ],
    });
  }

  res.status(200).json({
    success: true,
    cart,
  });
});

// transfercart and order => /api/v1/user/transfer/cartnorder

exports.transferCartOrder = catchAsyncErrors(async (req, res) => {
  const { userId } = req.body;

  console.log(userId);

  let cart = await Cart.findOne({ userId: req.user.id });
  let order = await Order.findOne({ userId: userId });
  let cartGuest = await Cart.findOne({ userId: userId });

  if (cart) {
    for (let i = 0; i < cartGuest?.cartItem?.length; i++) {
      let itemIndex = cart?.cartItem.findIndex(
        (p) =>
          p.item.toString() == cartGuest.cartItem[i].item.toString() &&
          p.attribute.toString() == cartGuest?.cartItem[i].attribute.toString()
      );

      if (itemIndex > -1) {
        cart.cartItem[itemIndex].itemCount = cartGuest?.cartItem[i].itemCount;
      } else {
        cart.cartItem.push({
          item: cartGuest?.cartItem[i].item,
          itemCount: cartGuest?.cartItem[i].itemCount,
          attribute: cartGuest?.cartItem[i].attribute,
        });
      }
      cart = await cart.save();
    }

    const deletecart = await Cart.deleteOne({ userId: userId });
  } else {
    cartGuest.userId = req.user.id;
    cart = await cartGuest.save();
  }

  console.log(order);

  if (order) {
    order.userId = req.user.id;
    order.guestAccount = false;
    order = await order.save();
  }

  res.status(200).json({
    success: true,
  });
});

// GET User Cart => /api/v1/user/cart

exports.userCart = catchAsyncErrors(async (req, res, next) => {
  let userId = mongoose.Types.ObjectId(req.user.id);

  const cart = await Cart.aggregate([
    {
      $match: {
        userId: userId,
      },
    },
    { $unwind: "$cartItem" },
    {
      $lookup: {
        from: "products",
        localField: "cartItem.item",
        foreignField: "_id",
        as: "cartItem.productDetails",
      },
    },
    { $unwind: "$cartItem.productDetails" },
    {
      $group: {
        _id: "$_id",
        userId: { $first: "$userId" },
        cartItem: { $push: "$cartItem" },
      },
    },
  ]);

  let subtotal = 0;
  if (cart?.length > 0) {
    for (let i = 0; i < cart[0]?.cartItem?.length; i++) {
      subtotal +=
        cart[0]?.cartItem[i]?.productDetails?.pricing?.find(
          (inven) =>
            inven.attribute.toString() ==
            cart[0]?.cartItem[i]?.attribute?.toString()
        )?.price * cart[0]?.cartItem[i]?.itemCount;
    }
  }
  res.status(200).json({
    success: true,
    cart,
    subtotal,
  });
});

//Delete cart item ===> /api/v1/user/cart
exports.deleteCartItem = catchAsyncErrors(async (req, res, next) => {
  let cart = await Cart.findOne({ userId: req.user.id });

  let itemIndex = cart?.cartItem.findIndex(
    (p) =>
      p.item == req.body.productId &&
      p.attribute.toString() == req.body.attribute.toString()
  );

  if (itemIndex > -1) {
    cart?.cartItem?.splice(itemIndex, 1);
  }

  cart = await cart.save();

  res.status(200).json({
    success: true,
    cart,
    message: "Cart Item Deleted Successfully",
  });
});

//Clear cart ===> /api/v1/user/clearCart
exports.clearCart = catchAsyncErrors(async (req, res, next) => {
  const cart = await Cart.findOneAndDelete({ userId: req.user.id });
});
