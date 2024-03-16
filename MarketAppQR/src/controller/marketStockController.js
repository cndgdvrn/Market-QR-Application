import { MarketStock } from "../schema/marketStockSchema.js";
import ErrorHandler from "../util/ErrorHandler.js";
import { HttpStatus } from "../util/Constants.js";
import { catchAsync } from "../util/Helpers.js";
import { Market } from "../schema/marketSchema.js";
import { Product } from "../schema/productSchema.js";

const marketStockController = {
  // can insert muliple stock to a market
  newStock: catchAsync(async (req, res, next) => {
    const { marketid } = req.params;
    const stocks = req.body;

    if (!Array.isArray(stocks) || stocks.length <= 0) {
      return next(
        new ErrorHandler(
          "You must post a valid non-empty array",
          HttpStatus.BAD_REQUEST
        )
      );
    }

    try {
      await Market.findById(marketid);
    } catch (error) {
      return next(
        new ErrorHandler(
          "There is no market with that id",
          HttpStatus.NOT_FOUND
        )
      );
    }

    const newStocks = stocks.map((stock) => ({
      marketid,
      productid: stock.productid,
      quantity: stock.quantity,
      price: stock.price,
    }));

    // insert the new stocks into the MarketStock collection
    const result = await MarketStock.insertMany(newStocks);

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: { stocks: result },
    });
  }),

  //Can update multiple product
  updateStock: catchAsync(async (req, res, next) => {
    const { marketid } = req.params;
    const stocks = req.body;

    if (!Array.isArray(stocks) || stocks.length <= 0) {
      return next(
        new ErrorHandler(
          "You must post a valid non-empty array",
          HttpStatus.BAD_REQUEST
        )
      );
    }

    try {
      await Market.findById(marketid);
    } catch (error) {
      return next(
        new ErrorHandler(
          "There is no market with that id",
          HttpStatus.NOT_FOUND
        )
      );
    }

    const bulkOperations = stocks.map((stock) => ({
      updateOne: {
        filter: { marketid, productid: stock.productid },
        update: { $set: { quantity: stock.quantity, price: stock.price } },
        upsert: false, // dont Create new stock if it doesn't exist
      },
    }));

    // Update the stocks in the MarketStock collection
    await MarketStock.bulkWrite(bulkOperations);

    const allStock = await MarketStock.find({ marketid });

    res.status(HttpStatus.OK).json({
      status: "success",
      data: { stock: allStock },
    });
  }),

  //delete one
  deleteStock: catchAsync(async (req, res, next) => {
    const { marketid, productid } = req.params;

    try {
      await Market.findById(marketid);
    } catch (error) {
      return next(
        new ErrorHandler(
          "There is no market with that id",
          HttpStatus.NOT_FOUND
        )
      );
    }

    try {
      await Product.findById(productid);
    } catch (error) {
      return next(
        new ErrorHandler(
          "There is no productid with that id",
          HttpStatus.NOT_FOUND
        )
      );
    }

    const deletedStock = await MarketStock.findOneAndDelete({
      marketid,
      productid,
    });

    if (!deletedStock) {
      return next(
        new ErrorHandler(
          "Stock not found for the given market and product",
          HttpStatus.NOT_FOUND
        )
      );
    }

    res.status(HttpStatus.NO_CONTENT).json({
      status: "success",
      data: null,
    });
  }),

  getMarketsAllStock: catchAsync(async (req, res, next) => {
    const { marketid } = req.params;

    try {
      await Market.findById(marketid);
    } catch (error) {
      return next(
        new ErrorHandler(
          "There is no market with that id",
          HttpStatus.NOT_FOUND
        )
      );
    }

    const allStock = await MarketStock.find({ marketid });
    res.status(HttpStatus.OK).json({
      status: "success",
      data: allStock,
    });
  }),
};

export default marketStockController;
