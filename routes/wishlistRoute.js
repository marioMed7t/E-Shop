const express = require("express");
const authService = require("../services/authService");
const {
  addProductToWishlistValidator,
  removeProductFromWishlistValidator,
} = require("../utils/validators/wishlistValidator");
const {
  addProductToWishlist,
  deleteProductFromWishlist,
  getLoggedUserWishlist,
} = require("../services/wishlistService");

const router = express.Router();
router.use(authService.protect, authService.allowedTo("user"));

router
  .route("/")
  .post(addProductToWishlistValidator, addProductToWishlist)
  .get(getLoggedUserWishlist);

router.delete(
  "/:productId",

  removeProductFromWishlistValidator,
  deleteProductFromWishlist
);
module.exports = router;
