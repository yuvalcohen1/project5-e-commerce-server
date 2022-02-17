import express, { Request, Response } from "express";
import { Cart_Item } from "../collections/cartItems";
import { Cart } from "../collections/carts";
import { Order } from "../collections/orders";
import { verifyJwtMiddleware } from "../helpers/verify-jwt-middleware";
import { OrderModel } from "../models/order.model";

export const ordersRouter = express.Router();

ordersRouter.get(
  "/num-of-all-orders",
  async (req: Request, res: Response<{ numOfAllOrders: number }>) => {
    try {
      const allOrders = await Order.find();
      const numOfAllOrders = allOrders.length;
      res.send({ numOfAllOrders });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

ordersRouter.get(
  "/last-order-date",
  verifyJwtMiddleware,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.sendStatus(401);
    }

    const { _id: userId }: any = req.user;
    if (!userId) {
      return res.sendStatus(401);
    }

    try {
      const userOrders = await Order.find({ userId });
      if (!userOrders.length) {
        res.send(null);
        return;
      }

      const lastOrderDate = userOrders[userOrders.length - 1].orderingDate;
      res.send(lastOrderDate);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

ordersRouter.get(
  "/dates-with-three-orders",
  verifyJwtMiddleware,
  async (req: Request, res: Response<string[]>) => {
    try {
      const datesObjsArr = (await Order.aggregate<{
        _id: string;
        numOfOrders: number;
      }>([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$shippingDate" },
            },
            numOfOrders: {
              $count: {},
            },
          },
        },
      ]))!;

      const datesWithThreeOrdersObjs = datesObjsArr.filter(
        (dateObj) => dateObj.numOfOrders === 3
      );

      const datesWithThreeOrders = datesWithThreeOrdersObjs.map(
        (dateObj) => dateObj._id
      );

      res.send(datesWithThreeOrders);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

ordersRouter.post(
  "/create-order",
  verifyJwtMiddleware,
  async (req: Request<Partial<OrderModel>>, res: Response<OrderModel>) => {
    const { _id: userId }: any = req.user;

    const {
      cartId,
      finalPrice,
      cityForShipping,
      streetForShipping,
      shippingDate,
      fourLastDigitsOfPayment,
    }: Partial<OrderModel> = req.body;

    if (
      !userId ||
      !cartId ||
      !finalPrice ||
      !cityForShipping ||
      !streetForShipping ||
      !shippingDate ||
      !fourLastDigitsOfPayment
    ) {
      return res.sendStatus(400);
    }

    try {
      const newOrder: OrderModel = await Order.create({
        userId,
        cartId,
        finalPrice,
        cityForShipping,
        streetForShipping,
        shippingDate,
        orderingDate: new Date(),
        fourLastDigitsOfPayment,
      });

      res.send(newOrder);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

ordersRouter.get(
  "/receipt-file",
  verifyJwtMiddleware,
  async (req: Request, res: Response) => {
    const { _id: userId }: any = req.user;
    if (!userId) {
      return res.sendStatus(400);
    }

    try {
      const [{ _id: cartId }] = await Cart.find(
        { userId, isOpen: 0 },
        { _id: true }
      )
        .sort({ _id: -1 })
        .limit(1);

      const cartItems = (await Cart_Item.find({ cartId }).populate(
        "product"
      )) as any;
      const itemsText = cartItems
        .map(
          (item: any, index: any) =>
            `${index + 1}. ${item.product.productName} * ${item.quantity}\n`
        )
        .join(`\n`);

      const cartItemsPrices = cartItems.map(
        (cartItem: any) => cartItem.product.price * cartItem.quantity!
      );

      const total = cartItemsPrices.reduce(
        (previousPrice: any, currentPrice: any) => previousPrice + currentPrice,
        0
      );

      const completeContent = `${itemsText} \n Total: ${total}$`;

      res.attachment(`receipt.txt`).send(completeContent);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);
