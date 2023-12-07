const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");

const {STRIPE_API_KEY,STRIPE_SECRET_KEY} = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);


exports.processPayment = catchAsyncErrors(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: {
        company: "Ecommerce",
      },
    });
  
    res
      .status(200)
      .json({ success: true, client_secret: myPayment.STRIPE_SECRET_KEY});
  });


exports.sendStripeApiKey = catchAsyncErrors(async(req,res,next)=>{
    res.status(200).json({stripeApiKey:STRIPE_API_KEY})
})