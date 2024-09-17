const factory = require("./handlerFactory");
const Review = require("../models/reviewModel");

//Nested route
//Get /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};

// @desc     get list of reviews
// @route    Get /api/v1/reviews
// @access   Public
exports.getReviews = factory.getAll(Review);
// @desc     get Specific review by ID
// @route    Get /api/v1/reviews/:ID
// @access   Public
exports.getReview = factory.getOne(Review);

exports.setProductIdAndUserIdToBody = (req, res, next) => {
  //Nested route
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc     create review
// @route    Post /api/v1/reviews
// @access   Private/protect/user
exports.createReview = factory.createOne(Review);

// @desc     update specific review
// @route    Put /api/v1/reviews/:id
// @access   Private/protect/user
exports.updateReview = factory.updateOne(Review);
// @desc     delete specific review
// @route    Delete /api/v1/reviews/:id
// @access   Private/protect/user-admin-manager
exports.deleteReview = factory.deleteOne(Review);
