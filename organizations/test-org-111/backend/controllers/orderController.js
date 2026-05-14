const Orders = require("../models/orderModal");
const orderHistoryModal = require("../models/orderHistoryModal");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeaturesAggregate = require("../utilis/ApiFeaturesAggregate");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const reques = require("request");
const Product = require("../models/productDetails");
const { clearCart } = require("./cartController");
const sendEmail = require("../utilis/sendResetEmail");


//Razorpay instance

const instance = new Razorpay({
    key_id: "rzp_test_V9McTPCQ0fi6X7",
    key_secret: "R3n6qAABuX0cJn0vLOyZo8XX",
});




// Add Order => /api/v1/user/order

exports.addOrder = catchAsyncErrors(async (req, res, next) => {
    console.log(req.body)
    // console.log(req.user)
    // const { guestAccount,
    //     addressDetails,
    //     productDetails,
    //     shippingDetails,
    //     paymentDetails,
    //     transactionDetails
    // } = req.body;
    const {
        // tracking_number,
        total,
        couponApplied,
        couponDetails,
        shipping_fee,
        payment_fee,
        payment_gateway,
        products,
        note,
        address,
    } = req.body;

    const orderCount = await Orders.countDocuments({});
    let paddedNumber = String(orderCount).padStart(4, '0');
    const tracking_number = `KS${paddedNumber}`
    // let isStoped = false;

    // productDetails?.forEach((item) => {
    //     if (item?.productDetails?.inventory?.inventory?.find((inven) => inven.attribute.toString() == item?.attribute?.toString())?.stoke == 0 || item?.productDetails?.inventory?.inventory?.find((inven) => inven.attribute.toString() == item?.attribute?.toString())?.stoke < item?.itemCount) {
    //         isStoped = true;
    //         return res.status(500).json({
    //             success: false,
    //             error: {
    //                 message: `${item?.productDetails?.productDetails?.name} is out of stock, please try to add another item`,
    //             },
    //         });
    //     }
    // });

    // if (!isStoped) {

    // const order = await Orders.create({
    //     guestAccount,
    //     addressDetails,
    //     productDetails,
    //     shippingDetails,
    //     paymentDetails,
    //     userId: req.user.id,
    //     transactionDetails,
    //     // returnDetails,
    // });
    const order = await Orders.create({
        tracking_number,
        customer: {
            userId: req.user.id,
            email: req.user.email
        },
        total,
        couponApplied,
        couponDetails,
        shipping_fee,
        payment_fee,
        payment_gateway,
        products,
        note,
        address,
        // paymentDetails,
        // userId: req.user.id,
        // transactionDetails,
        // returnDetails,
    });


    // productDetails?.forEach(async (item) => {
    //     let product = await Product.findOne({ _id: item?.item });
    //     let proIndex = product?.inventory?.inventory?.findIndex((inven) => inven.attribute.toString() == item?.attribute?.toString());
    //     product.inventory.inventory[proIndex].stoke -= item.itemCount;
    //     product = await product.save();
    // });


    // await clearCart(req, res, next);
    // Generate product rows dynamically
    // const productRows = order.products.map(product => `
    //     <tr>
    //         <td class="row">${product.id}</td>
    //         <td class="row">${product.name}</td>
    //         <td class="row">${product.price}</td>
    //         <td class="row">${product.quantity}</td>
    //     </tr>
    // `).join('');
    const productRows = order.products.map(product => `
        <tr>
            <td style="display: flex; align-items: center; width: 100%; align-items: center;">
                <img width="20%" src="${product.image}" alt="">
                <span style="margin: auto; font-weight: 600; padding-left: 15px;">${product.name}</span>
            </td>
            <td style="text-align: center; width: 15%; ">
                <h4>${product.quantity}</h4>
            </td>
             <td style="text-align: end; width: 15%;">
                <h4>${product.price}</h4>
            </td>
         </tr>
    `).join('');


    const message = `
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
            font-size: 13px;
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
            margin-top: 5px; font-size: 14px;
        }
        .track-button{
            border: none; background-color: #2E638C; color: #fff; padding: 12px 30px; border-radius: 5px; font-size: 18px; font-weight: 600;
        }
        .summ-and-addrs{
            display: flex; margin-top: 20px; background-color: #FAFAFA;
        }
        .summeryinfo,.addressinfo{
            width: 50%; border: 1px solid rgb(204, 204, 204); padding: 10px; font-size: 12px;
        }
        .summeryinfo table{
            width: 100%;
        }
        .summeryinfo table td p{
            font-weight: 600;
        }
        .addressinfo p{
            font-weight: 600; line-height: 22px;
        }
        h4,p{
            margin: auto;
        }
        .productinfo{
            margin-top: 30px;
        }
        .productinfo table{
            width: 100%;
        }
        .productinfo .product-info-table{
            padding-inline: 10px; border-bottom: 1px solid rgb(193, 193, 193);
        }
        .productinfo table th{
            border-bottom: 1px solid rgb(193, 193, 193); padding-block: 10px;
        }
        .productinfo table td{
            padding-block: 10px;
        }
        table { border-collapse: collapse; }
        .totalinfo{
            display: flex; margin-top: 20px;
            justify-content: end;
        }
        /* .totalinfo .totalinner{
            width: 50%;
        } */
        .totalinfo .totalinner table td{
            text-align: end; font-weight: 600; padding: 5px;
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
    <div style="justify-content: center;">
    <div style="max-width: 600px; margin: auto;" class="main-box">
        <div style="padding: 20px;" class="emailsecone">
            <div style="text-align: center;" class="emailtitle">
                <img width="50%" src="../Frontend/public/assets/images/logo.png" alt="" srcset="">
                <h2 style="font-size: 30px; font-weight: 600;">Your order is on its way</h2>
                <img width="30%" src="./assets/shipping.gif" alt="" srcset="">
            </div>
            <div style="text-align: center;" class="track-button-sec">
                <button class="track-button">TRACK YOUR ORDER</button><br>
                <p>Please Allow 24 hours to track Your Order</p>
            </div>
            <div class="summ-and-addrs">
                <div class="summeryinfo">
                    <h4>SUMMARY :</h4>
                    <table>
                        <tr>
                            <td>
                                <p>Order # :</p>
                            </td>
                            <td>
                                <p>1245678</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p>Order Date :</p>
                            </td>
                            <td>
                                <p>March 30 2024</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p>Order Total :</p>
                            </td>
                            <td>
                                <p>R 14.07</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="addressinfo">
                    <h4>SHIPPING ADDRESS :</h4>
                    <p>Miss Bean Official</p>
                    <p>123, Street Address</p>
                    <p>Boston, MA 02110</p>
                </div>
            </div>
            <div class="productinfo">
                <table class="product-info-table">
                    <tr>
                        <th style="text-align: start;">
                            <h4>ITEMS SHIPPED</h4>
                        </th>
                        <th>
                            <h4>QTY</h4>
                        </th>
                        <th style="text-align: end;">
                            <h4>PRICE</h4>
                        </th>
                    </tr>
                    ${productRows}
                </table>
                <div style="justify-content: end; display: block" class="totalinfo">
                    <div class="totalinner">
                        
                    </div>
                    <div class="totalinner">
                        <table>
                            <tr>
                                <td>Subtotal(2 items):</td>
                                <td>R 8.58</td>
                            </tr>
                            <tr>
                                <td>Flat Rate Shipping:</td>
                                <td>R 4.95</td>
                            </tr>
                            <tr>
                                <td>Estimated Tax:</td>
                                <td>R 0.54</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 800;">Order Total:</td>
                                <td style="font-weight: 800;">${order.total}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="mail-info-sec">
            <div class="callusingo">
                <p>Call Us at <a href="tel:1-800-200-4599" style="font-weight: 600; color: inherit; text-decoration: inherit;">1-800-200-4599</a> or reply to this email</p>
            </div>
            <div style="justify-content: space-around;" class="iconssec">
                <div style="text-align: center; width: 25%"  class="iconsec-comm">
                    <img width="60%" src="./assets/24-hours-support.png" alt="">
                    <p  style="font-size: 13px;">CUSTOMER <br> SERVICE</p>
                </div>
                <div style="text-align: center; width: 25%" class="iconsec-comm">
                    <img width="60%" src="./assets/fast-delivery.png" alt="">
                    <p style="font-size: 13px;">FREE SHIPPING <br> ORDERS R49+</p>
                </div>
                <div style="text-align: center; width: 25%" class="iconsec-comm">
                    <img width="60%" src="./assets/100-percent.png" alt="">
                    <p style="font-size: 13px;">SATISFACTION <br> GUARANTEED</p>
                </div>
                <div style="text-align: center; width: 25%" class="iconsec-comm">
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
    //     <html lang="en">
    //     <head>
    //     <link rel="preconnect" href="https://fonts.googleapis.com">
    //     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    //     <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
    //             <meta charset="UTF-8">
    //             <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //             <style>
    //         body {font-family: "Rubik", sans-serif;font-size:13px;}
    //         .container{max-width: 680px; margin:0 auto;}
    //         .logotype{background:#2f638d;color:#fff;width:180px;height:75px;  line-height: 75px; text-align: center; font-size:20px;}
    //         .column-title{background:#2f638d;text-transform:uppercase;padding:15px 5px 15px 15px;font-size:11px; color: #fff;border-bottom: 1px solid #fff}
    //         .column-detail{border-top:1px solid #2f638d;border-bottom:1px solid #2f638d; border-right: 1px solid #2f638d;}
    //         .column-header{background:#2f638d;text-transform:uppercase;padding:15px;font-size:11px; color: #fff;}
    //         .row{padding:7px 14px;border-left:1px solid #2f638d;border-right:1px solid #2f638d;}
    //         .alert{background: #2f638d;padding:20px;margin:20px 0;line-height:22px;color:#fff}
    //         .socialmedia{background:#2f638d;padding:20px; display:inline-block}
    //     </style>
    //         </head>
    //         <body style="padding: 20px;">
    //             <div class="container">
    //                 <div style="display: flex; margin-bottom: 20px;">
    //                     <img style="width: 200px" src="https://khado.webshark.tech/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.75c97033.png&w=384&q=75" alt="" srcset="">
    //                 </div>
    //                 <table width="100%">
    //                     <tr>
    //                         <td width="100%" style="background: #2f638d; color: #fff; solid #fff; padding-left: 30px; padding-block: 10px; font-size: 25px; letter-spacing: 1px;">
    //                             Order Confirmation
    //                         </td>
    //                         <td></td>
    //                     </tr>
    //                 </table>
    //                 <h4 style="margin-top: 20px;">Contact details</h4>
    //                 <table width="100%" style="border-collapse: collapse;">
    //                     <tr>
    //                         <td width="180px" class="column-title">Email</td>
    //                         <td class="column-detail">&nbsp;&nbsp;${req.user.email}</td>
    //                     </tr>
    //                     <tr>
    //                         <td class="column-title">First & Last name</td>
    //                         <td class="column-detail">&nbsp;&nbsp;${req.user.name}</td>
    //                     </tr>
    //                     <tr>
    //                         <td class="column-title">Order Id</td>
    //                         <td class="column-detail">&nbsp;&nbsp;${order.tracking_number}</td>
    //                     </tr>
    //                     <tr>
    //                         <td class="column-title">Phone</td>
    //                         <td class="column-detail">&nbsp;&nbsp;${order.address.phoneNumber}</td>
    //                     </tr>
    //                 </table>
    //                 <h4  style="margin-top: 20px;">Product Details</h4>
    //                 <table width="100%" style="border-collapse: collapse; border: 1px solid #2f638d;">
    //                     <tr>
    //                         <td width="20%" style="border-right: 1px solid #fff; " class="column-header">Product Id</td>
    //                         <td width="40%" style="border-right: 1px solid #fff; border-left: 1px solid #fff" class="column-header">Name</td>
    //                         <td width="30%" style="border-right: 1px solid #fff; border-left: 1px solid #fff" class="column-header">Price</td>
    //                         <td width="10%" style="border-left: 1px solid #fff" class="column-header">Quantity</td>
    //                     </tr>
    //                     ${productRows}
    //                 </table>
    //                 <div class="alert">
    //                     Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    //                 </div>
    //             </div>
    //         </body>
    //     </html>
    // `;
    sendEmail({
        email: req.user.email,
        subject: "Your Order Successfully Placed",
        // message: `Hello ${req.user.name},\n\nNew Order Created: orderDetails: OrderId: ${order.tracking_number}`,
        //   http://localhost:4000/api/v1/confirmation/${user.getJwtToken()}\n\nThank You!\n`,
        message,
    });

    // Update product quantities
    const updateProductPromises = order.products.map(async product => {
        const currentProduct = await Product.findById(product.id);

        if (!currentProduct) {
            throw new Error(`Product with id ${product.id} not found`);
        }

        const newQuantity = currentProduct.quantity - product.quantity;

        if (newQuantity < 0) {
            throw new Error(`Not enough quantity available for product ${currentProduct.name}`);
        }

        // Update the product with the new quantity
        const updatedProduct = await Product.findByIdAndUpdate(
            product.id,
            { $set: { quantity: newQuantity } },
            { new: true } // To return the updated document
        );

        return updatedProduct;
    });

    // Execute all update operations concurrently
    const updatedProducts = await Promise.all(updateProductPromises);

    res.status(200).json({
        success: true,
        order,
    });
    // }
});



// exports.userOrderList = catchAsyncErrors(async (req, res) => {
//     console.log(req.user._id)
//     // Extract the user ID from the request (assuming req.user.id is populated by some middleware)
//     const userId = req.user._id;

//     // Find all orders that match the user ID
//     // const orders = await Orders.find({'customer.userId': mongoose.Types.ObjectId(userId) });
//     const orders = await Orders.find({ 'customer.userId': mongoose.Types.ObjectId(userId) });

//     if (!orders || orders.length === 0) {
//         return res.status(404).json({
//             success: false,
//             message: "Orders not found for this user"
//         });
//     }

//     res.status(200).json({
//         success: true,
//         orders,
//     });
// });

exports.userOrderList = catchAsyncErrors(async (req, res) => {
    // Ensure req.user is populated by middleware
    if (!req.user || !req.user._id) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated"
        });
    }

    console.log(req.user._id);

    // Extract the user ID from the request
    const userId = req.user._id;

    try {
        // Find all orders that match the user ID
        const orders = await Orders.find({ 'customer.userId': new mongoose.Types.ObjectId(userId) });

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Orders not found for this user"
            });
        }

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
});


// GET Order => /api/v1/admin/order


exports.allOrder = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = parseInt(req.query.limit) || 10;
    const orderCount = await Orders.countDocuments({}); //Passing the data into frontend
    const apiFeatures = new APIFeaturesAggregate(Orders.aggregate([
        { $unwind: "$productDetails" },
        {

            $lookup: {
                from: "products",
                localField: "productDetails.item",
                foreignField: "_id",
                as: "productDetails.productDetails",
            },
        },
        { "$unwind": "$productDetails.productDetails" },
        {

            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "customerDetail",
            },
        },
        {
            "$group": {
                "_id": "$_id",
                "userId": { "$first": "$userId" },
                "productDetails": { "$push": "$productDetails" },
                "guestAccount": { "$first": "$guestAccount" },
                "addressDetails": { "$first": "$addressDetails" },
                "shippingDetails": { "$first": "$shippingDetails" },
                "paymentDetails": { "$first": "$paymentDetails" },
                "cancelDetails": { "$first": "$cancelDetails" },
                "createdAt": { "$first": "$createdAt" },
                "updatedAt": { "$first": "$updatedAt" },
                "transactionDetails": { "$first": "$transactionDetails" },
                "customerDetail": {
                    "$first": "$customerDetail"
                },
                "returnDetails": { "$first": "$returnDetails" },
                "replaceDetails": { "$first": "$replaceDetails" },
            }
        }
    ]), req.query)
        .search()
        .filter()
        .sort()
        .pagination(resPerPage);
    const order = await apiFeatures.query;

    res.status(200).json({
        success: true,
        count: order.length,
        orderCount,
        order,
    });
});



// GET Order => /api/v1/seller/order


exports.allOrderSeller = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = parseInt(req.query.limit) || 10;


    let userId = mongoose.Types.ObjectId(req.user.id);


    const apiFeatures = new APIFeaturesAggregate(Orders.aggregate([

        { $unwind: "$productDetails" },
        {

            $lookup: {
                from: "products",
                localField: "productDetails.item",
                foreignField: "_id",
                as: "productDetails.productDetails",
            },
        },
        { "$unwind": "$productDetails.productDetails" },
        {
            $match: {
                "productDetails.productDetails.seller": userId
            }
        },
        {

            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "customerDetail",
            },
        },
        {
            "$group": {
                "_id": "$_id",
                "userId": { "$first": "$userId" },
                "productDetails": { "$push": "$productDetails" },
                "guestAccount": { "$first": "$guestAccount" },
                "addressDetails": { "$first": "$addressDetails" },
                "shippingDetails": { "$first": "$shippingDetails" },
                "paymentDetails": { "$first": "$paymentDetails" },
                "cancelDetails": { "$first": "$cancelDetails" },
                "createdAt": { "$first": "$createdAt" },
                "updatedAt": { "$first": "$updatedAt" },
                "transactionDetails": { "$first": "$transactionDetails" },
                "customerDetail": {
                    "$first": "$customerDetail"
                },
                "returnDetails": { "$first": "$returnDetails" },
                "replaceDetails": { "$first": "$replaceDetails" },
            }
        }
    ]), req.query)
        .search()
        .filter()
        .sort()
        .pagination(resPerPage);
    const order = await apiFeatures.query;


    const countApiFeatures = new APIFeaturesAggregate(Orders.aggregate([

        { $unwind: "$productDetails" },
        {

            $lookup: {
                from: "products",
                localField: "productDetails.item",
                foreignField: "_id",
                as: "productDetails.productDetails",
            },
        },
        { "$unwind": "$productDetails.productDetails" },
        {
            $match: {
                "productDetails.productDetails.seller": userId
            }
        },
        {

            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "customerDetail",
            },
        },
        {
            "$group": {
                "_id": "$_id",
                "userId": { "$first": "$userId" },
                "productDetails": { "$push": "$productDetails" },
                "guestAccount": { "$first": "$guestAccount" },
                "addressDetails": { "$first": "$addressDetails" },
                "shippingDetails": { "$first": "$shippingDetails" },
                "paymentDetails": { "$first": "$paymentDetails" },
                "cancelDetails": { "$first": "$cancelDetails" },
                "createdAt": { "$first": "$createdAt" },
                "transactionDetails": { "$first": "$transactionDetails" },
                "updatedAt": { "$first": "$updatedAt" },
                "customerDetail": {
                    "$first": "$customerDetail"
                },
                "returnDetails": { "$first": "$returnDetails" },
                "replaceDetails": { "$first": "$replaceDetails" },
            }
        }
    ]), req.query)
        .search()
        .filter()
        .sort();


    const orderCount = await countApiFeatures.query; //Passing the data into frontend



    res.status(200).json({
        success: true,
        count: order.length,
        orderCount: orderCount.length,
        order,
    });
});


// GET Order => /api/v1/user/order


exports.getOrder = catchAsyncErrors(async (req, res, next) => {

    //userid cast to mongoose id
    let userId = mongoose.Types.ObjectId(req.user.id);


    const resPerPage = parseInt(req.query.limit) || 10;
    const orderCount = await Orders.countDocuments({ userId: req.user.id }); //Passing the data into frontend

    const apiFeatures = new APIFeaturesAggregate(Orders.aggregate([
        {
            $match: {
                userId: userId
            }
        },
        { $unwind: "$productDetails" },
        {

            $lookup: {
                from: "products",
                localField: "productDetails.item",
                foreignField: "_id",
                as: "productDetails.productDetails",
            },
        },
        { "$unwind": "$productDetails.productDetails" },
        {
            "$group": {
                "_id": "$_id",
                "userId": { "$first": "$userId" },
                "productDetails": { "$push": "$productDetails" },
                "guestAccount": { "$first": "$guestAccount" },
                "addressDetails": { "$first": "$addressDetails" },
                "shippingDetails": { "$first": "$shippingDetails" },
                "paymentDetails": { "$first": "$paymentDetails" },
                "cancelDetails": { "$first": "$cancelDetails" },
                "transactionDetails": { "$first": "$transactionDetails" },
                "returnDetails": { "$first": "$returnDetails" },
                "replaceDetails": { "$first": "$replaceDetails" },
                "createdAt": { "$first": "$createdAt" },
                "updatedAt": { "$first": "$updatedAt" },
            }
        }
    ]), req.query)
        .search()
        .filter()
        .sort()
        .pagination(resPerPage);
    const order = await apiFeatures.query;

    res.status(200).json({
        success: true,
        count: order.length,
        orderCount,
        order,
    });
});


//Get All Category details ===> /api/v1/admin/category/:id
exports.getOrderDetails = catchAsyncErrors(async (req, res, next) => {
    console.log("getOrederDetails", req.params)
    const orderDetails = await Orders.findById(req.params.id);
    if (!orderDetails) {
        return next(
            new ErrorHandler(`Order does not found with this id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        orderDetails,
    });
});




exports.payAmount = catchAsyncErrors(async (req, res, next) => {
    const options = {
        amount: req.params.amt * 100, // amount == Rs 10
        currency: req.params.curr,
        receipt: "MyAds",
        payment_capture: 0,
        // 1 for automatic capture // 0 for manual capture
    };

    const order = await instance.orders.create(options);

    if (!order) {
        return res.status(500).json({
            success: false,
            error: {
                message: `Something went wrong please retry`,
            },
        });
    }


    res.status(200).json({
        success: true,
        order
    });

})


exports.capturePayment = catchAsyncErrors(async (req, res, next) => {
    return reques(
        {
            method: "POST",
            url: `https://rzp_test_V9McTPCQ0fi6X7:R3n6qAABuX0cJn0vLOyZo8XX@api.razorpay.com/v1/payments/${req.params.paymentId}/capture`,
            form: {
                amount: req.body.amt * 100, // amount == Rs 10 // Same As Order amount
                currency: req.body.crr,
            },
        },
        async function (err, response, body) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Please check your bank server",
                });
            }

            return res.status(200).json({ body: body, success: true });
        }
    );


})






// GET Customer => /api/v1/seller/customer


exports.allCustomerSeller = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = parseInt(req.query.limit) || 10;


    let userId = mongoose.Types.ObjectId(req.user.id);


    const apiFeatures = new APIFeaturesAggregate(Orders.aggregate([

        { $unwind: "$productDetails" },
        {

            $lookup: {
                from: "products",
                localField: "productDetails.item",
                foreignField: "_id",
                as: "productDetails.productDetails",
            },
        },
        { "$unwind": "$productDetails.productDetails" },
        {
            $match: {
                "productDetails.productDetails.seller": userId
            }
        },
        {

            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "customerDetail",
            },
        },
        {
            "$group": {
                "_id": "$userId",
                "customerDetail": {
                    "$first": "$customerDetail"
                }
            }
        }
    ]), req.query)
        .search()
        .filter()
        .sort()
        .pagination(resPerPage);
    const customer = await apiFeatures.query;


    const countApiFeatures = new APIFeaturesAggregate(Orders.aggregate([

        { $unwind: "$productDetails" },
        {

            $lookup: {
                from: "products",
                localField: "productDetails.item",
                foreignField: "_id",
                as: "productDetails.productDetails",
            },
        },
        { "$unwind": "$productDetails.productDetails" },
        {
            $match: {
                "productDetails.productDetails.seller": userId
            }
        },
        {

            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "customerDetail",
            },
        },
        {
            "$group": {
                "_id": "$userId",
                "customerDetail": {
                    "$first": "$customerDetail"
                }
            }
        }
    ]), req.query)
        .search()
        .filter()
        .sort();


    const customerCount = await countApiFeatures.query; //Passing the data into frontend



    res.status(200).json({
        success: true,
        count: customer.length,
        customerCount: customerCount.length,
        customer,
    });
});


// orderController.js

// const Orders = require('../models/orderModal');
// const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Cancel Order => /api/v1/user/order/:id/cancel
exports.cancelOrder = catchAsyncErrors(async (req, res, next) => {
    console.log("CancelOrderRequest", req.body)
    const orderId = req.params.id;
    const cancellationReason = req.body.cancellationReason;

    try {
        const order = await Orders.findByIdAndUpdate(orderId, {
            $set: {
                'status.name': "Cancelled",
                'status.cancelReason': cancellationReason,
            },
            $unset: {
                'status.serial': 1, // Using empty string or 1 both will work
            }
        }, { new: true });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
});

//   Update Order Status
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
    console.log("Update Order Status: ", req.body)
    const orderId = req.params.id;
    const orderStatus = req.body.status;
    const serial = req.body.serial;
    // console.log("Order email: ", order.customer.email)

    try {
        const order = await Orders.findByIdAndUpdate(orderId, {
            $set: {
                'status.name': orderStatus,
                'status.serial': serial,
                //   'status.cancelReason': cancellationReason,
            }, $unset: {
                'status.cancelReason': '', // Using empty string or 1 both will work
            }
        }, { new: true });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found',
            });
        }

        const productRows = order.products.map(product => `
            <tr>
                <td style="display: flex; align-items: center; width: 100%; margin-bottom: 10px; margin-top: 10px;">
                    <img width="20%"
                        src="${product.image}"
                        alt="">
                    <span style="font-weight: 600; padding-left: 15px; margin: auto;">${product.name}</span>
                </td>
                <td style="text-align: center; width: 15%; ">
                     <h4>${product.quantity}</h4>
                            </td>
                 <td style="text-align: end; width: 15%;">
                     <h4>${product.price}</h4>
                </td>
             </tr>
        `).join('');

        const message = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=\, initial-scale=1.0">
    <title>Order Placed</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet">
    <style>
        body {
            font-family: "Poppins", sans-serif;
            font-style: normal;
            padding: 0px;
            font-size: 13px;
        }

        .main-box {
            background-color: #EEEEEE;
            padding: 20px;
        }

        .emailsecone {
            background-color: #fff;
            border-radius: 5px;
            padding-inline: 20px;
            padding-block: 40px;
        }

        .track-button-sec {
            margin-top: 20px;
        }

        .track-button-sec p {
            margin-top: 5px;
            font-size: 14px;
        }

        .track-button {
            border: none;
            background-color: #2E638C;
            color: #fff;
            padding: 12px 30px;
            border-radius: 5px;
            font-size: 18px;
            font-weight: 600;
        }

        .summ-and-addrs {
            display: flex;
            margin-top: 20px;
            background-color: #FAFAFA;
        }

        .summeryinfo,
        .addressinfo {
            width: 50%;
            border: 1px solid rgb(204, 204, 204);
            padding: 10px;
            font-size: 12px;
        }

        .summeryinfo table {
            width: 100%;
        }

        .summeryinfo table td p {
            font-weight: 600;
        }

        .addressinfo p {
            font-weight: 600;
            line-height: 22px;
        }

        h4,
        p {
            margin: auto;
        }

        .productinfo {
            margin-top: 30px;
        }

        .productinfo table {
            width: 100%;
        }

        .productinfo .product-info-table {
            padding-inline: 10px;
            border-bottom: 1px solid rgb(193, 193, 193);
        }

        .productinfo table th {
            border-bottom: 1px solid rgb(193, 193, 193);
            padding-block: 10px;
        }

        .productinfo table td {
            padding-block: 10px;
        }

        table {
            border-collapse: collapse;
        }

        .totalinfo {
            display: flex;
            margin-top: 20px;
            justify-content: end;
        }

        /* .totalinfo .totalinner{
            width: 50%;
        } */
        .totalinfo .totalinner table td {
            text-align: end;
            font-weight: 600;
            padding: 5px;
        }

        .callusingo {
            background-color: #2E638C;
            text-align: center;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0px 0px;
        }

        .mail-info-sec {
            margin-top: 20px;
            background-color: #fff;
        }

        .mail-info-sec .iconssec {
            display: flex;
            margin-top: 30px;
            justify-content: space-around;
            padding-block: 20px;
        }

        .iconsec-comm p {
            line-height: 20px;
        }

        .hh-grayBox {
            background-color: #F8F8F8;
            margin-bottom: 20px;
            padding-block: 30px;
            margin-top: 20px;
        }

        .pt45 {
            padding-top: 45px;
        }

        .order-tracking {
            text-align: center;
            width: 33.33%;
            position: relative;
            display: block;
        }

        .order-tracking .is-complete {
            display: block;
            position: relative;
            border-radius: 50%;
            height: 30px;
            width: 30px;
            border: 0px solid #AFAFAF;
            background-color: #f7be16;
            margin: 0 auto;
            transition: background 0.25s linear;
            -webkit-transition: background 0.25s linear;
            z-index: 2;
        }

        .order-tracking .is-complete:after {
            display: block;
            position: absolute;
            content: '';
            height: 14px;
            width: 7px;
            top: -2px;
            bottom: 0;
            left: 5px;
            margin: auto 0;
            border: 0px solid #AFAFAF;
            border-width: 0px 2px 2px 0;
            transform: rotate(45deg);
            opacity: 0;
        }

        .order-tracking.completed .is-complete {
            /* border-color: #27aa80; */
            border-color: #2E638C;
            border-width: 0px;
            background-color: #2E638C;
            /* background-color: #27aa80; */
        }

        .order-tracking.completed .is-complete:after {
            border-color: #fff;
            border-width: 0px 3px 3px 0;
            width: 7px;
            left: 11px;
            opacity: 1;
        }

        .order-tracking p {
            color: #A4A4A4;
            font-size: 16px;
            margin-top: 8px;
            margin-bottom: 0;
            line-height: 20px;
        }

        .order-tracking p span {
            font-size: 14px;
        }

        .order-tracking.completed p {
            color: #000;
        }

        .order-tracking::before {
            content: '';
            display: block;
            height: 3px;
            width: calc(100% - 40px);
            background-color: #f7be16;
            top: 13px;
            position: absolute;
            left: calc(-50% + 20px);
            z-index: 0;
        }

        .order-tracking:first-child:before {
            display: none;
        }

        .order-tracking.completed:before {
            /* background-color: #27aa80; */
            background-color: #2E638C;
        }
        .line-cls{
        position: absolute;
        }
    </style>
</head>

<body>
    <div style="display: flex; justify-content: center;">
        <div style="max-width: 600px; margin: auto;" class="main-box">
            <div style="padding: 20px;" class="emailsecone">
                <div style="text-align: center;" class="emailtitle">
                    <img width="50%" src="https://khado.webshark.tech/api/uploads/main/logo.png" alt="" srcset="">
                    <h2 style="font-size: 30px; font-weight: 600;">Your Order is Shipped</h2>
                    <img width="30%" src="https://khado.webshark.tech/api/uploads/email/shipping.gif" alt="" srcset="">
                </div>
                <div style="text-align: center;" class="track-button-sec">
                <!-- <button class="track-button">TRACK YOUR ORDER</button><br> -->
                <h2>Your Order Status Updated</h2>
            </div>
                <div class="container">
                    <div class="row">
                        <div class="col-12 col-md-10 hh-grayBox">
                        <img width="100%" src="https://khado.webshark.tech/api/uploads/email/${!order.status.serial ? 1 : (order.status.serial < 4 ? order.status.serial : 1)}.png"/>
                        </div>
                    </div>
                </div>
                <div class="summ-and-addrs">
                    <div class="summeryinfo">
                        <h4>SUMMARY :</h4>
                        <table>
                            <tr>
                                <td style="width: 30%">
                                    <p>Order # :</p>
                                </td>
                                <td>
                                    <p>${order.tracking_number}</p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>Order Date :</p>
                                </td>
                                <td>
                                    <p>R ${order.createdAt}</p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>Order Total :</p>
                                </td>
                                <td>
                                    <p>R ${order.total}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div class="addressinfo">
                        <h4>SHIPPING ADDRESS :</h4>
                        <p>${order.address.streetAddress.streetOne}</p>
                        <p>${order.address.streetAddress.streetTwo}</p>
                        <p>${order.address.city}, ${order.address.country} ${order.address.pinCode}</p>
                    </div>
                </div>
                <div class="productinfo">
                    <table class="product-info-table">
                        <tr>
                            <th style="text-align: start;">
                                <h4>ITEMS SHIPPED</h4>
                            </th>
                            <th>
                                <h4>QTY</h4>
                            </th>
                            <th style="text-align: end;">
                                <h4>PRICE</h4>
                            </th>
                        </tr>
                        ${productRows}
                    </table>
                    <div style="display: block;" class="totalinfo">
                        <div class="totalinner">

                        </div>
                        <div class="totalinner">
                            <table>
                                <tr>
                                    <td>Subtotal:</td>
                                    <td>R ${(order.total) - ((20 / 100) * order.total) }</td>
                                </tr>
                                <tr>
                                    <td>Flat Rate Shipping:</td>
                                    <td>R 0</td>
                                </tr>
                                <tr>
                                    <td>Estimated Tax:</td>
                                    <td>R ${(20 / 100) * order.total}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: 800;">Order Total:</td>
                                    <td style="font-weight: 800;">R ${order.total}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mail-info-sec">
                <div class="callusingo">
                    <p>Call Us at <a href="tel:1-800-200-4599"
                            style="font-weight: 600; color: inherit; text-decoration: inherit;">1-800-200-4599</a> or
                        reply to this email</p>
                </div>
                <div style="padding-bottom: 20px;" class="iconssec">
                    <div style="text-align: center; margin: auto;" class="iconsec-comm">
                        <img width="60%" src="https://khado.webshark.tech/api/uploads/email/24-hours-support.png" alt="">
                        <p style="font-size: 13px;">CUSTOMER <br> SERVICE</p>
                    </div>
                    <div style="text-align: center; margin: auto" class="iconsec-comm">
                        <img width="60%" src="https://khado.webshark.tech/api/uploads/email/fast-delivery.png" alt="">
                        <p style="font-size: 13px;">FREE SHIPPING <br> ORDERS R49+</p>
                    </div>
                    <div style="text-align: center; margin: auto;" class="iconsec-comm">
                        <img width="60%" src="https://khado.webshark.tech/api/uploads/email/100-percent.png" alt="">
                        <p style="font-size: 13px;">SATISFACTION <br> GUARANTEED</p>
                    </div>
                    <div style="text-align: center; margin: auto;" class="iconsec-comm">
                        <img width="60%" src="https://khado.webshark.tech/api/uploads/email/returns.png" alt="">
                        <p style="font-size: 13px;">HASSLE-FREE <br> RETURN</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>

</html>`;

        sendEmail({
            email: order.customer.email,
            subject: "Your Order Status Updated",
            message: message,
        });

        

        res.status(200).json({
            success: true,
            message: 'Order status Updated successfully',
            order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
});

// Return Order => /api/v1/user/order/:id/return
exports.returnOrder = catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    const returnReason = req.body.returnReason;

    try {
        const order = await Orders.findByIdAndUpdate(orderId, {
            $set: {
                'status.name': "Return Request",
                'status.returnReason': returnReason,
                'status.isReturnRequest': true,
                //   'returnDetails.returnStatus': "submitted",
                //   'returnDetails.returnReason': returnReason,
                //   'returnDetails.isReturnRequest': true,
            },
        }, { new: true });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Returned Request Submitted',
            order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
});
// Return Order => /api/v1/user/order/:id/return
exports.exchangeOrder = catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    const exchangeReason = req.body.exchangeReason;

    try {
        const order = await Orders.findByIdAndUpdate(orderId, {
            $set: {
                'status.name': "Exchange Request",
                'status.exchangeReason': exchangeReason,
                'status.isExchangeRequest': true,
                //   'returnDetails.returnStatus': "submitted",
                //   'returnDetails.returnReason': returnReason,
                //   'returnDetails.isReturnRequest': true,
            },
        }, { new: true });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Esxhange Request Submitted',
            order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
});

// Return Order => /api/v1/user/order/:id/return
exports.returnRequestReject = catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    const returnRejectionReason = req.body.rejectReason;

    try {
        const order = await Orders.findByIdAndUpdate(orderId, {
            $set: {
                'returnDetails.returnStatus': "Rejected",
                'returnDetails.returnRejectionReason': returnRejectionReason,
            },
        }, { new: true });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Returned Request Submitted',
            order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
});
// Return Order => /api/v1/user/order/:id/return
exports.replaceOrder = catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    const replaceReason = req.body.replaceReason;

    try {
        const order = await Orders.findByIdAndUpdate(orderId, {
            $set: {
                'replaceDetails.replaceStatus': "submitted",
                'replaceDetails.replaceReason': replaceReason,
                'replaceDetails.isReplaceRequest': true,
            },
        }, { new: true });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Returned Request Submitted',
            order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
});
// Return Order => /api/v1/user/order/:id/return
exports.replaceRequestReject = catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.id;
    const replaceRejectionReason = req.body.rejectReason;

    try {
        const order = await Orders.findByIdAndUpdate(orderId, {
            $set: {
                'returnDetails.replaceStatus': "Rejected",
                'returnDetails.replaceRejectionReason': replaceRejectionReason,
            },
        }, { new: true });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Returned Request Submitted',
            order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
});


//   /api/v1/user/orderhistory

// Get all order history entries
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await orderHistoryModal.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.getAllOrdersInAdmin = catchAsyncErrors(async (req, res, next) => {
    console.log("Request from admin For Order List")
    try {
        const resPerPage = parseInt(req.query.limit) || 10;
        const currentPage = parseInt(req.query.page) || 1;
        const sortby = req.query.sortby || 'createdAt';
        const sorted = req.query.sorted === 'desc' ? -1 : 1;
        const keyword = req.query.keyword || '';
        const searchBy = req.query.searchBy || 'tracking_number';

        const query = {};
        if (keyword) {
            query[searchBy] = { $regex: keyword, $options: 'i' };
        }

        const totalOrders = await Orders.countDocuments(query);
        const orders = await Orders.find(query)
            .sort({ [sortby]: sorted })
            .skip(resPerPage * (currentPage - 1))
            .limit(resPerPage);

        res.status(200).json({
            success: true,
            totalOrders,
            count: orders.length,
            orders
        });
        // console.log(orders)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
