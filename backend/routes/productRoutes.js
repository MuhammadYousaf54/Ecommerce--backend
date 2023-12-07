 const express = require("express");

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReview,
  getAdminProducts
} = require("../controller/productController.js");

const { isAuthenticationRequest, authorizeRoles } = require("../middleware/auth.js");
const router = express.Router()

router
  .route("/admin/products")
  .get(isAuthenticationRequest, authorizeRoles("admin"), getAdminProducts);

router.route("/admin/product/new").post(createProduct);
router.route("/products").get(getAllProducts);

router
  .route("/admin/product/:id")
  .put(isAuthenticationRequest, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticationRequest, authorizeRoles("admin"), deleteProduct)
  router.route('/product/:id').get(getProductDetails);

router.route("/review").put(isAuthenticationRequest, createProductReview);

router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticationRequest, deleteReview);

module.exports = router;