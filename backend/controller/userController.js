const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors.js');
const User = require('../models/userModel')
const sendToken = require('../utils/jwtToken');
const bcrypt = require('bcryptjs')
const sendEmail = require('../utils/sendEmail')
const crypto  = require('crypto')
const cloudinary = require('cloudinary');
// // register user
exports.registerUser = catchAsyncErrors(
    async(req,res,next)=>{

    // const myCloud = cloudinary.v2.uploader.upload(req.body.avatar,{
    //   folders:'avatars',
    //   width: 150,
    //   crop: 'scale'
    // })

const {name,email,password} = req.body;
const user = await  User.create({
    name,
    email,
    password ,
    // avatar:{
    //     public_id: myCloud.public_id,
    //     url:  myCloud.secure_url,
    // }
  });
    console.log(user)
  
sendToken(user,201,res);
});

// // login user controller
exports.loginUser = catchAsyncErrors(async(req,res,next)=>{

    const {email,password} = req.body;
    if(!email || !password){
        return next(new ErrorHandler("Invalid email or password",400));
      
    }

    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid email or password",401));
    }
    const isMatch = await  user.comparePassword(password,user.password);
    
  if(!isMatch){
    return next(new ErrorHandler("Invalid email or password",401))
  }
     sendToken(user,200,res)
});

//logOUt user 

exports.logoutUser = catchAsyncErrors(async(req,res,next)=>{
    res.cookie('token',null,{
        expiresIn: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({success: true,
    message:"successFully logged out",})
})

//forgotPassword
exports.forgotPassword = catchAsyncErrors(async(req, res, next) => {
  //get user from the mongodc server
    const user =await  User.findOne(req.body.email);
    if(!user){
        return next(new ErrorHandler('User not found', 404));
    }
    //Genrate remdom reset token
    const resetToken =  user.getResetPasswordToken();
    await user.save({validateBeforeSave: false })
    // const resetPasswordUrl = `${req.protocol}://${req.get(
    //   "host"
    // )}/password/reset/${resetToken}`;

      const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    
    console.log("reset password", resetPasswordUrl);
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
    // send email to the user with reset token
    try {
      await sendEmail({
        email:(user.email),
        subject: `Ecommerce Password Recovery`,
        message:message, },);
      res.status(200).json({
        success: true,
        message: `Email sent to  successfully`,
      },
      )
      console.log("forgot password token is",sendEmail);
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
  
      await user.save({ validateBeforeSave: false });
  
      return next(new ErrorHandler(error.message, 500));
    }
  });
// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // creating token hash
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
  
    const user = await User.findOne({
      passwordResetToken,
      passwordResetTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(
        new ErrorHandler(
          "Reset Password Token is invalid or has been expired",
          400
        )
      );
    }
  
    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password does not match", 400));
    }
  
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordChangedAt= Date.now();
  
    await user.save();
  
    sendToken(user, 200, res);
  });
  
//   // Get User Detail
  exports.getUserDetails =async (req, res, next) => {
    const user = await User.findById(req.user.id);
  
    res.status(200).json({
      success: true,
      user,
    });
  };
  
  // update User password
  exports.updateUserPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
  
    console.log("password matching....",user);
    const isPasswordMatched = await user.comparePassword(req.body.oPassword);
  console.log("password matched successfully",isPasswordMatched);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is incorrect", 400));
    }
  
    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHandler("password does not match", 400));
    }
  
    user.password = req.body.newPassword;
  
    await user.save();
  
    sendToken(user, 200, res);
  });
  
  // update User Profile
  exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };
  
    if (req.body.avatar !== "") {
      const user = await User.findById(req.user.id);
  
      const imageId = user.avatar.public_id;
  
      await cloudinary.v2.uploader.destroy(imageId);
  
      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
  
      newUserData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
  
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    res.status(200).json({
      success: true,
    });
  });
  
  // Get all users(admin)
  exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
  
    res.status(200).json({
      success: true,
      users,
    });
  });
  
  // Get single user (admin)
  exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
  
    if (!user) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
      );
    }
  
    res.status(200).json({
      success: true,
      user,
    });
  });
  
  // update User Role -- Admin
  exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };
  
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    if (!user) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }
  
    res.status(200).json({
      success: true,
    });
  });
  
  // Delete User --Admin
  exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
  
    if (!user) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }
  
    const imageId = user.avatar.public_id;
  
    await cloudinary.v2.uploader.destroy(imageId);
  
    await user.remove();
  
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  });