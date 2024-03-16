import { catchAsync } from "../util/Helpers.js";
import ErrorHandler from "../util/ErrorHandler.js";
import APIFeatures from "../util/ApiFeatures.js";
import { HttpStatus } from "../util/Constants.js";

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new ErrorHandler("No document found with that ID", HttpStatus.NOT_FOUND)
      );
    }

    res.status(HttpStatus.NO_CONTENT).json({
      status: "success",
      data: null,
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new ErrorHandler("No document found with that ID", HttpStatus.NOT_FOUND)
      );
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      data: doc,
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: doc,
    });
  });

export const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(
        new ErrorHandler("No document found with that ID", HttpStatus.NOT_FOUND)
      );
    }

    res.status(HttpStatus.OK).json({
      status: "success",
      data: doc,
    });
  });

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const filter = {};

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(HttpStatus.OK).json({
      status: "success",
      results: doc.length,
      data: doc,
    });
  });
