import express from "express";
import security from "../middleware/security.js";
import cartController from "../controller/cartController.js";
import { Roles } from "../util/Constants.js";

const cartRouter = express.Router();

cartRouter.post(
  "/create",
  security.protect,
  security.restrictTo(Roles.Admin, Roles.Staff, Roles.User),
  cartController.createCart
);

cartRouter.post(
  "/:cartid/add",
  security.protect,
  security.restrictTo(Roles.Admin, Roles.Staff, Roles.User),
  cartController.addItem
);

cartRouter.get(
  "/:id",
  security.protect,
  security.restrictTo(Roles.Admin, Roles.Staff, Roles.User),
  cartController.getCart
);

cartRouter.get(
  "/",
  security.protect,
  security.restrictTo(Roles.Admin),
  cartController.getAllCart
);

cartRouter.post(
  "/:cartid/purchase",
  security.protect,
  security.restrictTo(Roles.Admin, Roles.Staff, Roles.User),
  cartController.purchaseCart
);

cartRouter.post(
  "/:cartid/decline",
  security.protect,
  security.restrictTo(Roles.Admin, Roles.Staff, Roles.User),
  cartController.declineCart
);

export default cartRouter;
