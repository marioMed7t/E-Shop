const { check } = require("express-validator");
const Product = require("../../models/productModel");
const validatorMiddleware = require("../../middlewares/validatorMidlleware");

exports.addProductToWishlistValidator = [
  check("productId")
    .isMongoId()
    .withMessage("invalid Product id format")
    .custom((productId, { req }) =>
      Product.findById(productId).then((product) => {
        if (!product) {
          return Promise.reject(
            new Error(`No product for this ID: ${productId}`)
          );
        }
      })
    ),
  validatorMiddleware,
];
exports.removeProductFromWishlistValidator = [
  check("productId")
    .isMongoId()
    .withMessage("invalid Product id format")
    .custom((productId, { req }) =>
      Product.findById(productId).then((product) => {
        if (!product) {
          return Promise.reject(
            new Error(`No product for this ID: ${productId}`)
          );
        }
      })
    ),
  validatorMiddleware,
];
