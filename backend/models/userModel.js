const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"name is required"],

        
    },
    email:{
        type: String,
        required: [true,"email is required"],
        unique: true,
        validate: [validator.isEmail,"please enter a valid email"]
    },
    password:{
        type: String,
        required: [true,"password is required"],
        minLength:[8,"password must be at least 8 characters"],
        select:false
    },
    // confirmPassword:{
    //   type: String,
    //   required: [true,"password must be at least 8  "],
    //   validate:{
    //     validator: function(value) {
    //       return value == this.password;
    //   },
      // message:"password and confirm password do not match"
      //     }},

    // avatar:{
    //   public_id:{
    //     type: String,
    //     required: true
    //   },
    //   url:{
    //     type: String,
    //     required: true
    //   }
    // },
    created_at:{
        type: Date,
        default: Date.now
    },
  
    role:{
        type: String,
        default: 'user'
    },
   
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetTokenExpires:Date
});

userSchema.pre('save',async function(next){
 if(!this.isModified('password'))
  return next();
    
    this.password = await bcrypt.hash(this.password,10);
    this.confirmPassword = undefined;
    next();
} );

userSchema.methods.getJWTToken = function(){
return jwt.sign({id:this._id},process.env.JWT_SECRET,{expiresIn:
    process.env.JWT_EXPIRES,
})
 }
 //compare password

 userSchema.methods.comparePassword = async function (newPassword,oldPassword) {
    return await bcrypt.compare(newPassword, oldPassword);
  
  };
// Generate password reset token
userSchema.methods.getResetPasswordToken = function(){
  // 1 Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  //2 Hash and set to resetPasswordToken
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  //3 Set token expire time
  this.passwordResetTokenExpires = Date.now() + 30 * 60 * 1000

  console.log(resetToken,this.passwordResetToken)
  return resetToken
}

const User = mongoose.model("User", userSchema);
module.exports = User;