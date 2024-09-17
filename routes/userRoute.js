const express = require("express");

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  changeMyPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getLoggedUserData,
  UpdateLoggedUserPassword,
  UpdateLoggedUserData,
  deleteLoggedUserData,
} = require("../services/userService");

const router = express.Router();

const authService = require("../services/authService");

router.use(authService.protect);

router.get("/getMe", getLoggedUserData, getUser);
router.put(
  "/changeMyPassword",

  changeMyPasswordValidator,
  UpdateLoggedUserPassword
);
router.put(
  "/updateMe",

  updateLoggedUserValidator,
  UpdateLoggedUserData
);
router.delete(
  "/deleteMe",

  deleteLoggedUserData
);

//Admin
router.use(authService.allowedTo("manager", "admin"));

router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
