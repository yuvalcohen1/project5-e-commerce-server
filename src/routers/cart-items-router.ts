import express, { Request, Response } from "express";
import { Cart_Item } from "../collections/cartItems";
import { verifyJwtMiddleware } from "../helpers/verify-jwt-middleware";
import { CartItemModel } from "../models/cart-item.model";

export const cartItemsRouter = express.Router();

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
