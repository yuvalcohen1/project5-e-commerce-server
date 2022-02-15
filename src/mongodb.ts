import { connect } from "mongoose";
import { config } from "dotenv";

config();
const { MONGODB_URL, DB_NAME } = process.env;

export async function connectDb() {
  await connect(`${MONGODB_URL}/${DB_NAME}`);
}
