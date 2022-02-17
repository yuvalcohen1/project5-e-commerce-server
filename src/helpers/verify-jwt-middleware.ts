import { config } from "dotenv";
import expressJwt from "express-jwt";

config();
const { JWT_SECRET } = process.env;

export const verifyJwtMiddleware = expressJwt({
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
