import mongoose from "mongoose";
import { HttpStatus } from "../util/Constants.js";
import ErrorHandler from "../util/ErrorHandler.js";
import { Product } from "./productSchema.js";

const marketStockSchema = new mongoose.Schema({
  marketid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Market",
    required: [true, "Stock must belong to a market"],
  },
  productid: {
    type: String,
    ref: "Product",
    required: [true, "Stock must belong to a product"],
    validate: {
      validator: async function (value) {
        const product = await Product.findById(value);
        return product !== null;
      },
      message: (props) => `Invalid product ID: ${props.value}`,
    },
  },
  price: {
    type: Number,
    required: [true, "Stock must have a price for one unit"],
    min: 0,
  },
  quantity: {
    type: Number,
    required: [true, "Stock must have a quantity"],
    min: 0,
  },
});

marketStockSchema.pre("insertMany", async function (next, options) {
  const MarketStockModel = this.model("MarketStock");
  const existingStocks = await Promise.all(
    options.map(async (stock) => {
      const existingStock = await MarketStockModel.findOne({
        marketid: stock.marketid,
        productid: stock.productid,
      });
      return existingStock;
    })
  );

  if (existingStocks.some((e) => e !== null)) {
    return next(
      new ErrorHandler(
        existingStocks.map(
          (stock) =>
            stock &&
            `Duplicate market stock for marketid: ${stock.marketid} and productid: ${stock.productid}`
        ),
        HttpStatus.CONFLICT
      )
    );
  }
  const seen = new Set();
  const duplicates = [];

  options.forEach((stock) => {
    const key = `${stock.marketid}-${stock.productid}`;
    if (seen.has(key)) {
      duplicates.push(stock);
    } else {
      seen.add(key);
    }
  });

  if (duplicates.length > 0) {
    return next(
      new ErrorHandler(
        duplicates.map(
          (stock) =>
            `Duplicate while posting marketid: ${stock.marketid} and productid: ${stock.productid}`
        ),
        HttpStatus.CONFLICT
      )
    );
  }
  next();
});

export const MarketStock = mongoose.model("MarketStock", marketStockSchema);
