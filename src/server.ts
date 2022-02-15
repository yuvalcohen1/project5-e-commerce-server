import { config } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./mongodb";

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

startServer();

async function startServer() {
  await connectDb();
  app.listen(PORT, () => console.log(`server is up at ${PORT}`));
}
