const express = require("express");
const { 
  getOrder, 
  addOrder, 
  allOrder, 
  allOrderSeller, 
  payAmount, 
  capturePayment, 
  paymentSuccess, 
  allCustomerSeller, 
  cancelOrder, 
  returnOrder,
  returnRequestReject,
  replaceOrder,
  getAllOrders,
  getAllOrdersInAdmin,
  getOrderDetails,
  userOrderList,
  updateOrderStatus,
  exchangeOrder,
} = require("../controllers/orderController");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


router
    .route("/user/order")
    .get(isAuthenticatedUser, getOrder)
    .post(isAuthenticatedUser, addOrder)

router
    .route("/user/userorders")
    .get(isAuthenticatedUser, userOrderList)

router
    .route("/user/orderdetails/:id")
    .get(getOrderDetails)
    // .post(isAuthenticatedUser, addOrder)


router
    .route("/user/orderhistory")
    .get(getAllOrders)



router
    .route("/admin/order")
    // .get(allOrder)
    .get(getAllOrdersInAdmin)
router
    .route("/admin/orderdetails/:id")
    // .get(allOrder)
    .get(getOrderDetails)
    
// New route for order cancellation
router
  .route('/admin/order/:id/cancel')
  .put(isAuthenticatedUser, cancelOrder);

router
    .route("/seller/order")
    .get(isAuthenticatedUser, authorizeRoles("seller"), allOrderSeller);
  
router
  .route('/seller/order/:id/rejectreturn')
  .put(isAuthenticatedUser, returnRequestReject);

 router
    .route("/seller/customer")
    .get(isAuthenticatedUser, authorizeRoles("seller"), allCustomerSeller);


// New route for order cancellation
router
  .route('/user/order/:id/cancel')
  .put(isAuthenticatedUser, cancelOrder);

router
  .route('/admin/updatestatus/:id')
  .put(isAuthenticatedUser, updateOrderStatus);

router
  .route('/user/order/:id/return')
  .put(isAuthenticatedUser, returnOrder);

router
  .route('/user/order/:id/exchange')
  .put(isAuthenticatedUser, exchangeOrder);
  
router
  .route('/user/order/:id/replace')
  .put(isAuthenticatedUser, replaceOrder);

//payment
router.route("/payment/:curr/:amt").get(isAuthenticatedUser, payAmount);
router.route("/capture/:paymentId").post(isAuthenticatedUser, capturePayment);


module.exports = router;
