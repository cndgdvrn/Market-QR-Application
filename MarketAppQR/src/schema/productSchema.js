import mongoose from "mongoose";

export const productSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  brand: String,
  description: String,
  image: String,
  category: String,
});

export const Product = mongoose.model("Product", productSchema);
