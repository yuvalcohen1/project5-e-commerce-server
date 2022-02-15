import bcrypt from "bcrypt";
import { config } from "dotenv";
import express, { Request, Response } from "express";
import expressJwt from "express-jwt";
import jsonwebtoken from "jsonwebtoken";
import { promisify } from "util";
import { User } from "../collections/users";
import { RegisterBody } from "../models/register-body.model";
import { UserModel } from "../models/user.model";

config();
const { JWT_SECRET } = process.env;

const promisifiedSign = promisify(jsonwebtoken.sign);

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

export const usersRouter = express.Router();

usersRouter.post(
  "/register",
  async (req: Request<RegisterBody>, res: Response) => {
    const {
      firstName,
      lastName,
      email,
      idNum,
      password,
      city,
      street,
    }: RegisterBody = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !idNum ||
      !password ||
      !city ||
      !street
    ) {
      return res
        .status(400)
        .send("You have to provide all the required details");
    }

    try {
      const existingEmail = await User.find({ email });
      const isEmailExist = existingEmail.length;
      if (isEmailExist) {
        return res.status(400).send("Email is already exist");
      }

      const isIdNumExist = await User.findOne({ idNum });
      if (isIdNumExist) {
        return res.status(400).send("ID number is already exist");
      }

      const salt = await bcrypt.genSalt(2);
      const encryptedPassword = await bcrypt.hash(password, salt);

      const user: UserModel = {
        firstName,
        lastName,
        email,
        idNum,
        encryptedPassword,
        city,
        street,
        isAdmin: 0,
      };

      const newUser = await User.create(user);

      const jwt = await createJwt(
        newUser._id!,
        firstName,
        lastName,
        email,
        idNum,
        newUser.isAdmin,
        city,
        street
      );

      res.cookie("token", jwt, { httpOnly: true });
      res.send(newUser);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

usersRouter.post(
  "/login",
  async (req: Request<{ email: string; password: string }>, res: Response) => {
    const { email, password }: { email: string; password: string } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .send("You have to provide both email and password");
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).send("Email and password don't match");
      }

      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.encryptedPassword
      );
      if (!isPasswordCorrect) {
        res.status(401).send("Email and password don't match");
        return;
      }

      const jwt = await createJwt(
        user._id!,
        user.firstName,
        user.lastName,
        user.email,
        user.idNum,
        user.isAdmin,
        user.city!,
        user.street!
      );

      res.cookie("token", jwt, { httpOnly: true, maxAge: 253370764800000 });
      res.send(user);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }
);

usersRouter.post(
  "/delete-token-cookie",
  verifyJwtMiddleware,
  (req: Request, res: Response) => {
    res.clearCookie("token", { httpOnly: true, maxAge: 253370764800000 });
    res.end();
  }
);

async function createJwt(
  _id: string,
  firstName: string,
  lastName: string,
  email: string,
  idNum: number,
  isAdmin: number,
  city: string,
  street: string
) {
  return promisifiedSign(
    { _id, firstName, lastName, email, idNum, isAdmin, city, street },
    JWT_SECRET!
  );
}
