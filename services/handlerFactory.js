const asyncHandler = require("express-async-handler");
const ApiFeature = require("../utils/apiFeature");
const ApiError = require("../utils/apiError");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    // Trigger "remove" event when update document
    document.remove();
    res.status(204).send();
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    // Trigger "save" event when update document
    document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ data: newDoc });
  });

exports.getOne = (Model, populateOption) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    //1)Build query
    let query = Model.findById(id);
    if (populateOption) {
      query = query.populate(populateOption);
    }
    //2)Excute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }

    //Build query
    const documentsCounts = await Model.countDocuments();
    const apiFeature = new ApiFeature(Model.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .sort()
      .limitFields()
      .search(modelName);

    //Excute query
    const { mongooseQuery, paginationResult } = apiFeature;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ result: documents.length, paginationResult, data: documents });
  });
