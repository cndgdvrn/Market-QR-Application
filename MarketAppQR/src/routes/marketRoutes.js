import express from "express";
import marketController from "../controller/marketController.js";
import marketStockController from "../controller/marketStockController.js";
import security from "../middleware/security.js";
import { Roles } from "../util/Constants.js";

const marketRouter = express.Router();

marketRouter.get(
  "/:id",
  security.protect,
  security.restrictTo(Roles.Admin, Roles.Staff),
  marketController.getMarket
);

marketRouter.post(
  "/new",
  security.protect,
  security.restrictTo(Roles.Admin),
  marketController.newMarket
);

marketRouter.patch(
  "/addQRCode",
  security.protect,
  security.restrictTo(Roles.Admin),
  marketController.QRCodeImage
);

marketRouter.get(
  "/",
  security.protect,
  security.restrictTo(Roles.Admin),
  marketController.getAll
);

// Market Stock
marketRouter.post(
  "/:marketid/newStock",
  security.protect,
  security.restrictTo(Roles.Admin, Roles.Staff),
  marketStockController.newStock
);

marketRouter.patch(
  "/:marketid/updateStock",
  security.protect,
  security.restrictTo(Roles.Admin, Roles.Staff),
  marketStockController.updateStock
);

marketRouter.delete(
  "/:marketid/deleteStock/:productid",
  security.protect,
  security.restrictTo(Roles.Admin, Roles.Staff),
  marketStockController.deleteStock
);

marketRouter.get(
  "/:marketid/getMarketsAllStock",
  security.protect,
  security.restrictTo(Roles.Admin, Roles.Staff),
  marketStockController.getMarketsAllStock
);

export default marketRouter;
