import mongoose from "mongoose";

export const marketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  QRCodeImage: String,
  adress: String,
});

export const Market = mongoose.model("Market", marketSchema);
