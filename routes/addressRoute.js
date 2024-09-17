const express = require("express");
const authService = require("../services/authService");

const {
  addAddress,
  deleteAddress,
  getLoggedUserAddresses,
} = require("../services/addressService");

const router = express.Router();
router.use(authService.protect, authService.allowedTo("user"));

router.route("/").post(addAddress).get(getLoggedUserAddresses);

router.delete(
  "/:addressId",

  deleteAddress
);
module.exports = router;
