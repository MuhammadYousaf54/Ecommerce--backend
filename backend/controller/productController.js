 const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const ApiFeatures = require('../utils/apiFeatures');
const cloudinary = require("cloudinary");

//create product  -- only admin can create
exports.createProduct = catchAsyncErrors(async(req,res,next)=>{
  
  let images = [];

  if(typeof req.body.images==="string"){
     images.push(req.body.images);
  }else{
    images = req.body.images
  }

  const imagesLink = [];

   for (let i = 0; i < images.length; i++) {
const result = await cloudinary.v2.uploader.upload(images[i].public_id,{
  folder:"products"
})    

imagesLink.push({
  public_id:result.public_id,
  url:result.secure_url
});

   }

req.body.images = req.body.imagesLink;
req.body.user = req.user.id;
    const product = await Product.create(req.body);
    if(!product) {
      return next(new ErrorHandler("product not create",404));
    }
    res.status(200).json({
      success:true,
      product
    })
})
// get all product 
exports.getAllProducts = catchAsyncErrors(async(req,res,next)=>{
const resultPerPage = 8;
const productsCount = await Product.countDocuments();
const apifeatures = new ApiFeatures(Product.find(),req.query)
.search()
.filter()
.pagination(resultPerPage)
const products = await apifeatures.query;
let filteredProductsCount = products.length;
apifeatures.pagination(resultPerPage);

// products = await apifeatures.query;
res.status(200).json({ success: true, products, productsCount ,resultPerPage,filteredProductsCount});
})

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});
  // get products details --admin only
  exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
  
    if(!product) {
      return next(new ErrorHandler("product not found",404));
    }
    
    res.status(200).json({
      success: true,
      product,
    });
  });
//   // update product with routes

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// //delete product
exports.deleteProduct =catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findByIdAndDelete(req.params.id);
if(!product){
    return next(new ErrorHandler(500,"product not found"))
   };
   
   // deleting images from cloudinary
  for (let i = 0; i < product.images.length; i++) {
await cloudinary.v2.uploader.destroy(product.images[i].public_id)    
  }


    res.status(200).json({
        success: true,
        product,
        message: "Product deleted successfully"
    })});
    // create Product reviews or updaate review
   exports.createProductReview = catchAsyncErrors(async(req,res,next)=>{
    const { rating, comment, productId } = req.body;
    const review = {
        name: req.body.name,
        email: req.body.email,
        rating: Number(rating),
        comment, }
    const product = await Product.findById(productId);
    console.log("Product", product)
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString() );
    if(isReviewed){
        product.reviews.forEach((rev)=>{
            if(rev.user.toString()===req.user._id.toString()){
                rev.rating = req.body.rating
                rev.comment = req.body.comment }})
    }else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length }
       let avg = 0;
       product.reviews.forEach((rev)=>{
       avg += rev.rating
    })

    product.ratings = avg/product.reviews.length;
    await product.save({validateBeforeSave: false});
    res.status(200).json({
        success: true,
        
    })
   })
   // get all reviews of product

exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.query.id);
    if (!product) {
      return next(new ErrorHandler(400, "product not found"));
    }
  
    res.status(400).json({
      success: true,
      reviews: product.reviews,
    });
  });
  // Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});