const express = require("express");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder
} = require("../controller/orderController");
const router = express.Router();

const { isAuthenticationRequest, authorizeRoles } = require("../middleware/auth");

router.route("/order/new").post(isAuthenticationRequest, newOrder);

router.route("/order/:id").get(isAuthenticationRequest,authorizeRoles('admin'), getSingleOrder);

router.route("/orders/me").get(isAuthenticationRequest,authorizeRoles('admin'), myOrders);

router
  .route("/admin/orders")
  .get(isAuthenticationRequest, authorizeRoles("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(isAuthenticationRequest, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticationRequest, authorizeRoles("admin"), deleteOrder);

module.exports = router;