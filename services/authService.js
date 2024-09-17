const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/createToken");

// @desc     signup
// @route    Get /api/v1/auth/signup
// @access   Public
exports.signup = asyncHandler(async (req, res, next) => {
  //1)create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 12),
  });
  //2)generate token
  const token = generateToken(user._id);

  res.status(201).json({ Data: user, token });
});

// @desc     login
// @route    Get /api/v1/auth/login
// @access   Public
exports.login = asyncHandler(async (req, res, next) => {
  //1)check if password and email in the body (validation)

  //2)check if user exist & check if password correct
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  if (user.active === false) {
    await User.findByIdAndUpdate(user._id, {
      active: true,
    });
  }

  //3)generate token
  const token = generateToken(user._id);

  //4) send response
  res.status(200).json({ Data: user, token });
});

// @desc     make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  //1)Check if token exist & if exist get it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }

  if (!token) {
    next(
      new ApiError(
        "you are not login, please login to get access this route",
        401
      )
    );
  }
  //2)Verfy token (no change happens, expired token)

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded);
  //3)check if user exist
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    next(
      new ApiError(
        "the user that belong to this token does no longer exist",
        401
      )
    );
  }

  //check if active
  if (!currentUser.active) {
    next(
      new ApiError(
        "your Account is not active. Active your account and try again",
        401
      )
    );
  }
  //4)check if user change his password after token created
  if (currentUser.passwordChangeAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangeAt.getTime() / 1000,
      10
    );

    //password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently change his password. please login again..",
          401
        )
      );
    }
  }
  req.user = currentUser;
  next();
});

// @desc     Authorization (user permition)
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    //1)access roles
    //2access registerd user {req.user.role}
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("you are not allowed to access this route", 403)
      );
    }
    next();
  });

// @desc     forgot password
// @route    Post /api/v1/auth/forgotPassword
// @access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  //1)get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(
      new ApiError(`there is no user with that email ${req.body.email}`, 404)
    );
  }
  //2)if user exist, Generate hash random reset 6 digit and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // const hashedResetCode = await bcrypt.hash(resetCode, 12);

  //save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;

  //add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  user.passwordResetVerified = false;

  await user.save();
  console.log(resetCode);
  //3)send the reset code via email

  const message = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure. \n The E-shop team`;
  try {
    await sendEmail({
      email: user.email,
      subject: "your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("there is an error in sending email", 500));
  }
  console.log(hashedResetCode);
  res
    .status(200)
    .json({ status: "success", message: "Reset code sent to email" });
});

// @desc     verify password reset code
// @route    Post /api/v1/auth/verifyResetCode
// @access   Public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  //1)Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  console.log(hashedResetCode);

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  //2)Reset code valid
  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({ status: "success" });
});

// @desc     Reset password
// @route    Post /api/v1/auth/resetPassword
// @access   Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //1)Get user based on Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with email ${req.body.email}`, 404)
    );
  }

  //2)check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  user.passwordChangeAt = Date.now();

  if (user.active === false) {
    user.active = true;
  }
  await user.save();

  //3)if every thing is OK. generate token
  const token = generateToken(user.id);
  res.status(200).json({ token });
});
