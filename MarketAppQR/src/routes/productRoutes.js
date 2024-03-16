import express from "express";
import productController from "../controller/productController.js";
import security from "../middleware/security.js";
import { Roles } from "../util/Constants.js";

const productRouter = express.Router();

productRouter.post(
  "/new",
  security.protect,
  security.restrictTo(Roles.Admin),
  productController.newProduct
);

productRouter.get(
  "/",
  security.protect,
  security.restrictTo(Roles.Admin, Roles.Staff),
  productController.getAll
);

export default productRouter;
