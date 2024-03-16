import { catchAsync } from "../util/Helpers.js";
import { Market } from "../schema/marketSchema.js";
import { HttpStatus } from "../util/Constants.js";
import ErrorHandler from "../util/ErrorHandler.js";
import { createOne, getAll, getOne } from "./crudFactoryController.js";

const marketController = {
  newMarket: createOne(Market),
  getMarket: getOne(Market),
  getAll: getAll(Market),
  QRCodeImage: catchAsync(async (req, res, next) => {
    const { id, QRCodeImage } = req.body;
    if (!id || !QRCodeImage) {
      return next(
        new ErrorHandler(
          "Market Id and QR Code Image URL is Required",
          HttpStatus.BAD_REQUEST
        )
      );
    }
    try {
      const market = await Market.findById(id);

      market.QRCodeImage = QRCodeImage;
      market.save();

      res.status(HttpStatus.OK).json({
        status: "success",
        data: { market },
      });
    } catch (err) {
      if (err.name === "CastError" && err.kind === "ObjectId") {
        next(
          new ErrorHandler(
            "No market found for this id",
            HttpStatus.BAD_REQUEST
          )
        );
      } else {
        next(new ErrorHandler(err.message, HttpStatus.INTERNAL_SERVER_ERROR));
      }
    }
  }),
};

export default marketController;
