import mongoose from "mongoose";
import { CartStatus } from "../util/Constants.js";
import { MarketStock } from "./marketStockSchema.js";

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  marketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Market",
    required: true,
  },
  products: [
    {
      marketstockid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MarketStock",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  status: {
    type: String,
    enum: Object.values(CartStatus),
    default: CartStatus.Pending,
  },
});

cartSchema.methods.calculateTotalCost = async function () {
  const total = await Promise.all(
    this.products.map(async (product) => {
      const marketStock = await MarketStock.findById(product.marketstockid);
      if (marketStock) {
        return marketStock.price * product.quantity;
      }
      return 0;
    })
  );

  return total.reduce((acc, curr) => acc + curr, 0);
};
const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
