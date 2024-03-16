import Cart from "../schema/cartSchema.js";
import { MarketStock } from "../schema/marketStockSchema.js";
import { CartStatus, HttpStatus } from "../util/Constants.js";
import ErrorHandler from "../util/ErrorHandler.js";
import { catchAsync } from "../util/Helpers.js";
import { getAll, getOne } from "./crudFactoryController.js";

const cartController = {
  createCart: catchAsync(async (req, res, next) => {
    const { marketId } = req.body;
    const userId = req.user._id;

    const existingCart = await Cart.findOne({
      userId,
      marketId,
      status: CartStatus.Pending,
    });

    if (existingCart) {
      return next(
        new ErrorHandler(
          "A pending cart already exists for this user and market.",
          HttpStatus.CONFLICT
        )
      );
    }

    // Create a new cart
    const newCart = await Cart.create({ userId, marketId });

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: { cart: newCart },
    });
  }),

  addItem: catchAsync(async (req, res, next) => {
    const { cartid } = req.params;
    const { barkod, quantity } = req.body;

    const cart = await Cart.findOne({
      _id: cartid,
      status: CartStatus.Pending,
    });

    if (!cart) {
      return next(
        new ErrorHandler(
          "Cart not found or its status is not pending.",
          HttpStatus.NOT_FOUND
        )
      );
    }

    // Find the marketstockid based on the barkod and marketId of the cart
    const marketStock = await MarketStock.findOne({
      productid: barkod,
      marketid: cart.marketId,
    });

    if (!marketStock) {
      return next(
        new ErrorHandler(
          "Market stock not found for the given barkod and market.",
          HttpStatus.NOT_FOUND
        )
      );
    }

    // Check if the marketstockid already exists in the cart
    const existingItem = cart.products.find((item) =>
      item.marketstockid.equals(marketStock._id)
    );

    if (existingItem) {
      // Calculate the total quantity if the item is updated
      const updatedQuantity = existingItem.quantity + quantity;

      if (updatedQuantity > marketStock.quantity) {
        return next(
          new ErrorHandler(
            "Not enough quantity available in the market stock.",
            HttpStatus.BAD_REQUEST
          )
        );
      }

      // Update the quantity of the existing item
      existingItem.quantity = updatedQuantity;
    } else {
      if (quantity > marketStock.quantity) {
        return next(
          new ErrorHandler(
            "Not enough quantity available in the market stock.",
            HttpStatus.BAD_REQUEST
          )
        );
      }
      // Create a new item and add it to the cart's products array
      const newItem = {
        marketstockid: marketStock._id,
        quantity,
      };

      cart.products.push(newItem);
    }

    await cart.save();

    res.status(HttpStatus.CREATED).json({
      status: "success",
      data: { cart },
    });
  }),

  getCart: catchAsync(async (req, res, next) => {
    const doc = await Cart.findById(req.params.id);
    if (!doc) {
      return next(
        new ErrorHandler("No document found with that ID", HttpStatus.NOT_FOUND)
      );
    }

    const totalCost = await doc.calculateTotalCost();

    res.status(HttpStatus.OK).json({
      status: "success",
      data: {
        ...doc.toObject(),
        totalCost: totalCost,
      },
    });
  }),
  getAllCart: getAll(Cart),

  purchaseCart: catchAsync(async (req, res, next) => {
    const { cartid } = req.params;

    const cart = await Cart.findOne({
      _id: cartid,
      status: CartStatus.Pending,
    });

    if (!cart) {
      return next(
        new ErrorHandler(
          "Cart not found or its status is not pending.",
          HttpStatus.NOT_FOUND
        )
      );
    }

    if (cart.products.length === 0) {
      return next(
        new ErrorHandler(
          "Cannot purchase an empty cart.",
          HttpStatus.BAD_REQUEST
        )
      );
    }

    // Retrieve all the market stock items for the cart
    const marketStocks = await MarketStock.find({
      _id: { $in: cart.products.map((item) => item.marketstockid) },
    });

    // Check if all the market stock items are found
    if (marketStocks.length !== cart.products.length) {
      return next(
        new ErrorHandler(
          "Market stock not found for the items in the cart.",
          HttpStatus.NOT_FOUND
        )
      );
    }

    // Check if there is enough quantity in the market stocks for each item in the cart
    const insufficientQuantity = cart.products.some((item) => {
      const marketStock = marketStocks.find((stock) =>
        stock._id.equals(item.marketstockid)
      );
      return item.quantity > marketStock.quantity;
    });

    if (insufficientQuantity) {
      return next(
        new ErrorHandler(
          "Not enough quantity available in the market stock.",
          HttpStatus.CONFLICT
        )
      );
    }

    // Update the quantities in the market stocks
    await Promise.all(
      cart.products.map(async (item) => {
        const marketStock = marketStocks.find((stock) =>
          stock._id.equals(item.marketstockid)
        );
        marketStock.quantity -= item.quantity;
        await marketStock.save();
      })
    );

    // Update the cart status to "purchased"
    cart.status = CartStatus.Purchased;
    await cart.save();

    res.status(HttpStatus.OK).json({
      status: "success",
      message: "Cart purchased successfully.",
    });
  }),
  declineCart: catchAsync(async (req, res, next) => {
    const { cartid } = req.params;

    const cart = await Cart.findOne({
      _id: cartid,
      status: CartStatus.Pending,
    });

    if (!cart) {
      return next(
        new ErrorHandler(
          "Cart not found or its status is not pending.",
          HttpStatus.NOT_FOUND
        )
      );
    }

    // Update the cart status to "declined"
    cart.status = CartStatus.Declined;
    await cart.save();

    res.status(HttpStatus.OK).json({
      status: "success",
      message: "Cart declined successfully.",
    });
  }),
};

export default cartController;
