import { Product } from "../schema/productSchema.js";
import { createOne, getAll } from "./crudFactoryController.js";

const productController = {
  newProduct: createOne(Product),
  getAll: getAll(Product),
};

export default productController;
