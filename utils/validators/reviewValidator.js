const { check } = require("express-validator");
const Review = require("../../models/reviewModel");
const validatorMiddleware = require("../../middlewares/validatorMidlleware");

//Rules

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("Ratings value required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Ratings value must be between 1 to 5"),
  check("user").isMongoId().withMessage("invalid Review id format"),
  check("product")
    .isMongoId()
    .withMessage("invalid Review id format")
    .custom(
      (val, { req }) =>
        Review.findOne({ user: req.user._id, product: req.body.product }).then(
          (review) => {
            if (review) {
              return Promise.reject(
                new Error("You already created a review before")
              );
            }
          }
        )
      //check if logged user create review before
    ),
  validatorMiddleware,
];
exports.getReviewValidator = [
  check("id").isMongoId().withMessage("invalid Review id format"),
  validatorMiddleware,
];
exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid Review id format")
    .custom((val, { req }) =>
      //check review ownership before update
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error(`There is no review with id ${val}`));
        }

        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error(`you are not allowed to perform this action`)
          );
        }
      })
    ),

  validatorMiddleware,
];
exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("invalid Review id format")
    .custom((val, { req }) => {
      if (req.user.role === "user") {
        //check review ownership before update
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`There is no review with id ${val}`)
            );
          }

          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error(`you are not allowed to perform this action`)
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];
