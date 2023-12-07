const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updateUserPassword,
  updateUserProfile,
  getAllUser,
   getSingleUser,
  updateUserRole,
  deleteUser,
} = require("../controller/userController");
const { isAuthenticationRequest,authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logoutUser);

router.route("/me").get(isAuthenticationRequest, getUserDetails);

router.route("/password/update").put(isAuthenticationRequest, updateUserPassword);

router.route("/me/update").put(isAuthenticationRequest, updateUserProfile);

router
  .route("/admin/users")
  .get(isAuthenticationRequest, authorizeRoles("admin"), getAllUser);

  router
  .route("/admin/user/:id")
  .get(isAuthenticationRequest, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticationRequest, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticationRequest, authorizeRoles("admin"), deleteUser);

module.exports = router;