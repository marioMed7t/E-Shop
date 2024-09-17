const express = require("express");

const {
  getCoupons,
  createCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../services/couponService");

const authService = require("../services/authService");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("manager", "admin"));

router.route("/").get(getCoupons).post(createCoupon);
router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
