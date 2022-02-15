import { config } from "dotenv";
import express, { Request, Response } from "express";
import expressJwt from "express-jwt";
import { Cart_Item } from "../collections/cartItems";
import { CartItemModel } from "../models/cart-item.model";

config();
const { JWT_SECRET } = process.env;

export const cartItemsRouter = express.Router();

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

cartItemsRouter.get(
  "/:cartId",
  verifyJwtMiddleware,
  async (req: Request, res: Response) => {
    const { cartId } = req.params;
    if (!cartId) {
      return res.sendStatus(400);
    }

    try {
      const cartItems = await Cart_Item.find({ cartId }).populate("product");
      res.send(cartItems);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

cartItemsRouter.post(
  "/add-cart-item",
  verifyJwtMiddleware,
  async (req: Request, res: Response) => {
    const { cartId, product, quantity }: Partial<CartItemModel> = req.body;
    if (!cartId || !product || !quantity) {
      return res.sendStatus(400);
    }

    try {
      const newCartItem = await (
        await Cart_Item.create({ quantity, product, cartId })
      ).populate("product");
      res.send(newCartItem);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

cartItemsRouter.delete(
  "/delete-cart-item/:cartItemId",
  verifyJwtMiddleware,
  async (req: Request<{ cartItemId: string }>, res: Response) => {
    const { cartItemId } = req.params;
    if (!cartItemId) {
      return res.sendStatus(400);
    }

    try {
      const { deletedCount } = await Cart_Item.deleteOne({ _id: cartItemId });
      if (!deletedCount) {
        res.status(400).send("cart item has not been deleted");
        return;
      }

      res.end();
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

cartItemsRouter.delete(
  "/empty-cart-items/:cartId",
  verifyJwtMiddleware,
  async (req: Request, res: Response) => {
    const { cartId } = req.params;
    if (!cartId) {
      return res.sendStatus(400);
    }

    try {
      const { deletedCount } = await Cart_Item.deleteMany({ cartId });
      if (!deletedCount) {
        res.status(400).send("cart items have not been deleted");
        return;
      }

      res.end();
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);
