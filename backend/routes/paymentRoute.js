const express = require("express");
const {
  processPayment,
  sendStripeApiKey,
} = require("../controller/paymentControrller");
const router = express.Router();
const { isAuthenticationRequest } = require("../middleware/auth");

router.route("/payment/process").post(isAuthenticationRequest, processPayment);

router.route("/stripeapikey").get( sendStripeApiKey);

module.exports = router;