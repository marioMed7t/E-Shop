const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const factory = require("./handlerFactory");
const Brand = require("../models/brandModel");

//upload single image
exports.uploadBrandImage = uploadSingleImage("image");

//image proccessing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/brands/${filename}`);

  //save image into our db
  req.body.image = filename;
  console.log(req.hostname);
  next();
});

// @desc     get list of brands
// @route    Get /api/v1/brands
// @access   Public
exports.getBrands = factory.getAll(Brand);
// @desc     get Specific brand by ID
// @route    Get /api/v1/brands/:ID
// @access   Public
exports.getBrand = factory.getOne(Brand);

// @desc     create brand
// @route    Post /api/v1/brands
// @access   Private
exports.createBrand = factory.createOne(Brand);

// @desc     update specific brand
// @route    Put /api/v1/brands/:id
// @access   Private
exports.updateBrand = factory.updateOne(Brand);
// @desc     delete specific brand
// @route    Delete /api/v1/brands/:id
// @access   Private
exports.deleteBrand = factory.deleteOne(Brand);
