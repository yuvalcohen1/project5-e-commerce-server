import { config } from "dotenv";
import express, { Request, Response } from "express";
import expressJwt from "express-jwt";
import { Product } from "../collections/products";
import { ProductModel } from "../models/product.model";

config();
const { JWT_SECRET } = process.env;

export const productsRouter = express.Router();

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

productsRouter.get(
  "/all",
  verifyJwtMiddleware,
  async (req: Request, res: Response<ProductModel[]>) => {
    try {
      const allProducts = await Product.find();
      res.send(allProducts);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

productsRouter.get(
  "/num-of-available-products",
  async (req: Request, res: Response) => {
    try {
      const products = await Product.find();
      const numOfAvailableProducts = products.length;
      res.send({ numOfAvailableProducts });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

productsRouter.get(
  "/:categoryId",
  verifyJwtMiddleware,
  async (
    req: Request<{ categoryId: string }>,
    res: Response<ProductModel[] | string>
  ) => {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).send("Category ID is missing");
    }

    try {
      const products = await Product.find({ categoryId });
      res.send(products);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

productsRouter.get(
  "/search/:productName",
  verifyJwtMiddleware,
  async (
    req: Request<{ productName: string }>,
    res: Response<ProductModel[] | string>
  ) => {
    const { productName } = req.params;
    if (!productName) {
      return res.status(400).send("Product name is missing");
    }

    try {
      const products = await Product.find({
        productName: new RegExp(productName, "i"),
      });

      res.send(products);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

productsRouter.post(
  "/add-product",
  verifyJwtMiddleware,
  async (
    req: Request<Partial<ProductModel>>,
    res: Response<ProductModel | string>
  ) => {
    const { productName, categoryId, imgUrl, price }: Partial<ProductModel> =
      req.body;
    if (!productName || !categoryId || !imgUrl || !price) {
      return res.status(400).send("Product details are missing");
    }

    try {
      const newProduct = await Product.create({
        productName,
        categoryId,
        imgUrl,
        price,
      });

      res.send(newProduct);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

productsRouter.put(
  "/update-product",
  verifyJwtMiddleware,
  async (req: Request, res: Response<ProductModel | string>) => {
    const { _id, productName, categoryId, imgUrl, price }: ProductModel =
      req.body;
    if (!_id || !productName || !categoryId || !imgUrl || !price) {
      return res.status(400).send("Product details are missing");
    }

    try {
      const product = await Product.findById(_id);
      product!.productName = productName;
      product!.categoryId = categoryId;
      product!.imgUrl = imgUrl;
      product!.price = price;
      product!.save();

      res.send(product!);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);
