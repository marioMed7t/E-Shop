const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMidlleware");
const Category = require("../../models/categoryModel");
const subCategory = require("../../models/subCategoryModel");

exports.createProductValidator = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars")
    .notEmpty()
    .withMessage("product required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("product description is required")
    .isLength({ max: 2000 })
    .withMessage("too lond product description"),
  check("quantity")
    .notEmpty()
    .withMessage("product quantity is required")
    .isNumeric()
    .withMessage("product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("product quantity must be a number"),
  check("price")
    .notEmpty()
    .withMessage("product price is required")
    .isNumeric()
    .withMessage("product price must be a number")
    .isLength({ max: 32 })
    .withMessage("to long price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("priceAfterDiscount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("priceAfterDiscount must be lower than price");
      }
      return true;
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("colors should be array of string"),
  check("imageCover").notEmpty().withMessage("product imageCover is required"),
  check("images")
    .optional()
    .isArray()
    .withMessage("images should be array of string"),
  check("category")
    .notEmpty()
    .withMessage("product must be belong to a category")
    .isMongoId()
    .withMessage("invalid ID Format")
    .custom((categoryID) =>
      Category.findById(categoryID).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No category for this ID: ${categoryID}`)
          );
        }
      })
    ),
  check("brand").optional().isMongoId().withMessage("invalid ID Format"),
  check("subcategories")
    .optional()
    .isMongoId()
    .withMessage("invalid ID Format")
    .custom((subategoriesID) =>
      subCategory
        .find({ _id: { $exists: true, $in: subategoriesID } })
        .then((result) => {
          if (result.length < 1 || result.length !== subategoriesID.length) {
            return Promise.reject(new Error(`invalid subcategories IDs`));
          }
        })
    )
    .custom((val, { req }) =>
      subCategory
        .find({ category: req.body.category })
        .then((subcategories) => {
          // console.log(subcategories);
          const subcategoriesIDs = [];
          subcategories.forEach((subcategory) => {
            subcategoriesIDs.push(subcategory._id.toString());
          });

          //check if subcategories ids in db include subcategories in req.body (true / false)
          const checker = (target, arr) => target.every((v) => arr.includes(v));

          if (!checker(val, subcategoriesIDs)) {
            return Promise.reject(
              new Error(`subcategories not belong to category `)
            );
          }
        })
    ),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isLength({ min: 1 })
    .withMessage("rating must be above or equal 1.0")
    .isLength({ max: 5 })
    .withMessage("rating must be below or equal 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),

  validatorMiddleware,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("invalid ID Format"),
  validatorMiddleware,
];
exports.updateProductValidator = [
  check("id").isMongoId().withMessage("invalid ID Format"),
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];
exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("invalid ID Format"),
  validatorMiddleware,
];
