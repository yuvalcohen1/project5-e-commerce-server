import { config } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./mongodb";
import { usersRouter } from "./routers/users-router";
import { productsRouter } from "./routers/products-router";
import { categoriesRouter } from "./routers/categories-router";
import { cartsRouter } from "./routers/carts-router";
import { cartItemsRouter } from "./routers/cart-items-router";

config();
const { PORT } = process.env;

const app = express();

const CORS_CONFIG = {
  origin: true,
  credentials: true,
};
app.use(cors(CORS_CONFIG));
app.use(cookieParser());
app.use(express.json());

app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/categories", categoriesRouter);
app.use("/shopping-carts", cartsRouter);
app.use("/cart-items", cartItemsRouter);

startServer();

async function startServer() {
  await connectDb();
  app.listen(PORT, () => console.log(`server is up at ${PORT}`));
}
