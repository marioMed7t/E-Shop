const factory = require("./handlerFactory");
const Coupon = require("../models/couponModel");

// @desc     get list of coupons
// @route    Get /api/v1/coupons
// @access   private Admin-manager
exports.getCoupons = factory.getAll(Coupon);

// @desc     get Specific coupon by ID
// @route    Get /api/v1/coupons/:ID
// @access   private Admin-manager
exports.getCoupon = factory.getOne(Coupon);

// @desc     create Coupon
// @route    Post /api/v1/coupons
// @access   private Admin-manager
exports.createCoupon = factory.createOne(Coupon);

// @desc     update specific Coupon
// @route    Put /api/v1/coupons/:id
// @access   private Admin-manager
exports.updateCoupon = factory.updateOne(Coupon);

// @desc     delete specific Coupon
// @route    Delete /api/v1/coupons/:id
// @access   private Admin-manager
exports.deleteCoupon = factory.deleteOne(Coupon);
