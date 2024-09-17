const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const factory = require("./handlerFactory");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");

exports.uploadProductImages = uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  //1-image processing for image cover
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    //save image into our db
    req.body.imageCover = imageCoverFileName;
  }

  //2-image processing for images
  if (req.files.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/${imageName}`);

        //save image into our db
        req.body.images.push(imageName);
      })
    );
  }
  next();
});
// @desc     get list of products
// @route    Get /api/v1/products
// @access   Public
exports.getProducts = factory.getAll(Product, "Products");

// @desc     get Specific product by ID
// @route    Get /api/v1/products/:ID
// @access   Public
exports.getProduct = factory.getOne(Product, "reviews");
// @desc     create product
// @route    Post /api/v1/products
// @access   Private
exports.createProduct = factory.createOne(Product);

// @desc     update specific product
// @route    Put /api/v1/products/:id
// @access   Private
exports.updateProduct = factory.updateOne(Product);

// @desc     delete specific product
// @route    Delete /api/v1/products/:id
// @access   Private
exports.deleteProduct = factory.deleteOne(Product);
