const SubCategory = require("../models/subCategoryModel");
const factory = require("./handlerFactory");

exports.setCategoryIdToBody = (req, res, next) => {
  //Nested route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

// @desc     get list of subcategories
// @route    Get /api/v1/subcategories
// @access   Public
exports.getSubCategories = factory.getAll(SubCategory);
// @desc     create subCategory
// @route    Post /api/v1/subCategories
// @access   Private
exports.createSubCategory = factory.createOne(SubCategory);

// @desc     get Specific subcategory by ID
// @route    Get /api/v1/subcategories/:ID
// @access   Public
exports.getSubCategory = factory.getOne(SubCategory);

// @desc     update specific subcategory
// @route    Put /api/v1/subcategories/:id
// @access   Private
exports.updateSubCategory = factory.updateOne(SubCategory);

// @desc     delete specific subcategory
// @route    Delete /api/v1/subcategories/:id
// @access   Private
exports.deleteSubCategory = factory.deleteOne(SubCategory);
