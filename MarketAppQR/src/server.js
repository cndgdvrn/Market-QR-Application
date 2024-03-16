import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { app } from "./app.js";

const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, ".env") });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose.set("strictQuery", true);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Error connecting to database:", err));

const port = parseInt(process.env.PORT, 10);

app.listen(port, () => {
  console.log("App running on port", port);
});
