exports.addOrder = catchAsyncErrors(async (req, res,next) => {
    console.log(req.user)
    const {
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
        });
    const productRows = order.products.map(product => `
        <tr>
            <td class="row">${product.id}</td>
            <td class="row">${product.name}</td>
            <td class="row">${product.price}</td>
            <td class="row">${product.quantity}</td>
        </tr>
    `).join('');

    const message = `
        <html lang="en">
        <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
            body {font-family: "Rubik", sans-serif;font-size:13px;}
            .container{max-width: 680px; margin:0 auto;}
            .logotype{background:#2f638d;color:#fff;width:180px;height:75px;  line-height: 75px; text-align: center; font-size:20px;}
            .column-title{background:#2f638d;text-transform:uppercase;padding:15px 5px 15px 15px;font-size:11px; color: #fff;border-bottom: 1px solid #fff}
            .column-detail{border-top:1px solid #2f638d;border-bottom:1px solid #2f638d; border-right: 1px solid #2f638d;}
            .column-header{background:#2f638d;text-transform:uppercase;padding:15px;font-size:11px; color: #fff;}
            .row{padding:7px 14px;border-left:1px solid #2f638d;border-right:1px solid #2f638d;}
            .alert{background: #2f638d;padding:20px;margin:20px 0;line-height:22px;color:#fff}
            .socialmedia{background:#2f638d;padding:20px; display:inline-block}
        </style>
            </head>
            <body style="padding: 20px;">
                <div class="container">
                    <div style="display: flex; margin-bottom: 20px;">
                        <img style="width: 200px" src="https://khado.webshark.tech/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.75c97033.png&w=384&q=75" alt="" srcset="">
                    </div>
                    <table width="100%">
                        <tr>
                            <td width="100%" style="background: #2f638d; color: #fff; solid #fff; padding-left: 30px; padding-block: 10px; font-size: 25px; letter-spacing: 1px;">
                                Order Confirmation
                            </td>
                            <td></td>
                        </tr>
                    </table>
                    <h4 style="margin-top: 20px;">Contact details</h4>
                    <table width="100%" style="border-collapse: collapse;">
                        <tr>
                            <td width="180px" class="column-title">Email</td>
                            <td class="column-detail">&nbsp;&nbsp;${req.user.email}</td>
                        </tr>
                        <tr>
                            <td class="column-title">First & Last name</td>
                            <td class="column-detail">&nbsp;&nbsp;${req.user.name}</td>
                        </tr>
                        <tr>
                            <td class="column-title">Order Id</td>
                            <td class="column-detail">&nbsp;&nbsp;${order.tracking_number}</td>
                        </tr>
                        <tr>
                            <td class="column-title">Phone</td>
                            <td class="column-detail">&nbsp;&nbsp;${order.address.phoneNumber}</td>
                        </tr>
                    </table>
                    <h4  style="margin-top: 20px;">Product Details</h4>
                    <table width="100%" style="border-collapse: collapse; border: 1px solid #2f638d;">
                        <tr>
                            <td width="20%" style="border-right: 1px solid #fff; " class="column-header">Product Id</td>
                            <td width="40%" style="border-right: 1px solid #fff; border-left: 1px solid #fff" class="column-header">Name</td>
                            <td width="30%" style="border-right: 1px solid #fff; border-left: 1px solid #fff" class="column-header">Price</td>
                            <td width="10%" style="border-left: 1px solid #fff" class="column-header">Quantity</td>
                        </tr>
                        ${productRows}
                    </table>
                    <div class="alert">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </div>
                </div>
            </body>
        </html>
    `;
        sendEmail({
            email: req.user.email,
            subject: "Your Order Successfully Placed",
            message,
          });

          const updateProduct = order.products.map(product =>

          {const productsforquantity =  Product.findByIdAndUpdate(
            product.id,
            { $set: { quantity: productsforquantity - product.quantity } },
            { new: true } // To return the updated document
          );}
        )

        res.status(200).json({
            success: true,
            order,
        });
});