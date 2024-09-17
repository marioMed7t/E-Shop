const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// @desc     Add product to wishlist
// @route    Post /api/v1/wishlist
// @access   protected/user

exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  //addToSet ==> add productId to wishlist array if productId not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "product added successfully to your wishlist.",
    data: user.wishlist,
  });
});

// @desc     Remove product from wishlist
// @route    DELETE /api/v1/wishlist/:productId
// @access   protected/user

exports.deleteProductFromWishlist = asyncHandler(async (req, res, next) => {
  //pull ==> remove productId from wishlist array if productId exist
  const { productId } = req.params;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "product removed successfully from your wishlist.",
    data: user.wishlist,
  });
});

// @desc     Get logged user wishlist
// @route    Get /api/v1/wishlist
// @access   protected/user
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  res.status(200).json({
    Status: "success",
    result: user.wishlist.length,
    Data: user.wishlist,
  });
});
