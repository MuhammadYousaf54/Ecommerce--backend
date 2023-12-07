const ErrorHandler = require('../utils/errorHandler.js');
const catchAsyncErrors = require("./catchAsyncErrors.js");
const JWT = require('jsonwebtoken')
const User = require('../models/userModel.js')


//  for allow user to login or create any admin  when we need to allow admin only then we user its
exports.isAuthenticationRequest = catchAsyncErrors(async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler("token not found",401))
    }
const decodedData = JWT.verify(token,process.env.JWT_SECRET);
const user = await User.findById(decodedData.id);
    next();
})
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(
            `Role: ${req.user.role} is not allowed to access this resouce `,
            403
          )
        );
      }
  
      next();
    };
  };