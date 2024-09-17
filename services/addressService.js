const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// @desc     Add addresse to user addresses list
// @route    Post /api/v1/adresses
// @access   protected/user

exports.addAddress = asyncHandler(async (req, res, next) => {
  //addToSet ==> add address object to user addresses array if address not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address added successfully. ",
    data: user.addresses,
  });
});

// @desc     Remove addresse from user addresses list
// @route    DELETE /api/v1/wishlist/:addressId
// @access   protected/user

exports.deleteAddress = asyncHandler(async (req, res, next) => {
  //pull ==> remove address object from user addresses array if addressId  exist
  const { addressId } = req.params;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: addressId } },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address removed successfully.",
    data: user.addresses,
  });
});

// @desc     Get logged user addresses
// @route    Get /api/v1/addresses
// @access   protected/user
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");

  res.status(200).json({
    Status: "success",
    result: user.addresses.length,
    Data: user.addresses,
  });
});
