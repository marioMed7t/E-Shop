const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const factory = require("./handlerFactory");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/createToken");

//upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

//image proccessing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${filename}`);

    //save image into our db
    req.body.profileImg = filename;
  }

  next();
});

// @desc     get list of users
// @route    Get /api/v1/users
// @access   private
exports.getUsers = factory.getAll(User);
// @desc     get Specific user by ID
// @route    Get /api/v1/users/:ID
// @access   private
exports.getUser = factory.getOne(User);

// @desc     create user
// @route    Post /api/v1/users
// @access   Private
exports.createUser = factory.createOne(User);

// @desc     update specific user
// @route    Put /api/v1/users/:id
// @access   Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      role: req.body.role,
      profileImg: req.body.profileImg,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangeAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc     delete specific user
// @route    Delete /api/v1/users/:id
// @access   Private
exports.deleteUser = factory.deleteOne(User);

// @desc     get logged user data
// @route    get /api/v1/users/getMe
// @access   private/protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc     Update logged user password
// @route    Put /api/v1/users/updateMyPassword
// @access   private/protect

exports.UpdateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  //1)update user password based user bayload (req.user.i_d)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangeAt: Date.now(),
    },
    {
      new: true,
    }
  );
  //2)Generate token
  const token = generateToken(user._id);
  res.status(200).json({ Data: user, token });
});

// @desc     Update logged user data (without pass and role)
// @route    Put /api/v1/users/updateMe
// @access   private/protect

exports.UpdateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );
  res.status(200).json({ Data: updateUser });
});

// @desc     Deactivate logged user
// @route    Delete /api/v1/users/deleteMe
// @access   private/protect

exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      active: false,
    },
    { new: true }
  );
  res.status(204).json({ Status: "Success" });
});

exports.activeMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      active: true,
    },
    { new: true }
  );
  res.status(204).json({ Status: "Success" });
});
