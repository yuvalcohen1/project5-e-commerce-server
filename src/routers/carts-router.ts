import express, { Request, Response } from "express";
import { Cart } from "../collections/carts";
import { verifyJwtMiddleware } from "../helpers/verify-jwt-middleware";

export const cartsRouter = express.Router();

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
