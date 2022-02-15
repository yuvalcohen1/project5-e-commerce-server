import { config } from "dotenv";
import express, { Request, Response } from "express";
import expressJwt from "express-jwt";
import { Cart } from "../collections/carts";

config();
const { JWT_SECRET } = process.env;

export const cartsRouter = express.Router();

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

cartsRouter.get(
  "/",
  verifyJwtMiddleware,
  async (req: Request, res: Response) => {
    const { _id: userId }: any = req.user;
    if (!userId) {
      return res.sendStatus(401);
    }

    try {
      const cart = await Cart.findOne({ userId, isOpen: 1 });
      res.send(cart);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

cartsRouter.post(
  "/create-cart",
  verifyJwtMiddleware,
  async (req: Request, res: Response) => {
    const { _id: userId }: any = req.user;
    if (!userId) {
      return res.sendStatus(401);
    }

    try {
      const newCart = await Cart.create({
        userId,
        createdAt: new Date(),
        isOpen: 1,
      });

      res.send(newCart);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

cartsRouter.put(
  "/close-cart/:cartId",
  verifyJwtMiddleware,
  async (req: Request<{ cartId: string }>, res: Response) => {
    const { cartId } = req.params;
    if (!cartId) {
      return res.sendStatus(400);
    }

    try {
      const cart = await Cart.findById(cartId);
      cart!.isOpen = 0;
      cart?.save();

      res.send(cart);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);
