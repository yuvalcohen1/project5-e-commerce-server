import { config } from "dotenv";
import express, { Request, Response } from "express";
import expressJwt from "express-jwt";
import { Category } from "../collections/categories";

config();
const { JWT_SECRET } = process.env;

export const categoriesRouter = express.Router();

const verifyJwtMiddleware = expressJwt({
  secret: JWT_SECRET!,
  algorithms: ["HS256"],
  getToken: function fromHeaderOrQuerystring(req) {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      return req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }
    return null;
  },
});

categoriesRouter.get(
  "/",
  verifyJwtMiddleware,
  async (req: Request, res: Response) => {
    try {
      const categories = await Category.find();
      res.send(categories);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);
