const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const factory = require("./handlerFactory");
const Category = require("../models/categoryModel");

//upload single image
exports.uploadCategoryImage = uploadSingleImage("image");

//image proccessing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);

    //save image into our db
    req.body.image = filename;
  }

  next();
});

// @desc     get list of categories
// @route    Get /api/v1/categories
// @access   Public
exports.getCategories = factory.getAll(Category);

// @desc     get Specific category by ID
// @route    Get /api/v1/categories/:ID
// @access   Public
exports.getCategory = factory.getOne(Category);

// @desc     create category
// @route    Post /api/v1/categories
// @access   Private
exports.createCategory = factory.createOne(Category);

// @desc     update specific category
// @route    Put /api/v1/categories/:id
// @access   Private
exports.updateCategory = factory.updateOne(Category);

// @desc     delete specific category
// @route    Delete /api/v1/categories/:id
// @access   Private
exports.deleteCategory = factory.deleteOne(Category);
