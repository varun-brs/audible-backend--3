import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import User from "../models/usersModel.js";
import Author from "../models/authorsModel.js";

import expressAsyncHandler from "express-async-handler";

const checkToken = expressAsyncHandler(async (req, res, next) => {
  let token;
  const authorizationHeader = req.headers.authorization;
  console.log("req.headers.auth", req.headers.authorization);

  if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
    token = authorizationHeader.split(" ")[1];
    console.log("token", token);
    console.log("jwt_secret", process.env.JWT_SECRET);
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decodedToken, "decoded token");

      // Check if user exists in the database
      const user = await User.findById(decodedToken.userId).select("-password");
      console.log(user);

      if (!user) {
        res.status(404);
        throw new Error("User not found");
      }

      // Attach the user object to the request
      req.user = user;
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, token is required");
  }
});

const authorCheckToken = expressAsyncHandler(async (req, res, next) => {
  let token;
  const authorizationHeader = req.headers.authorization;
  console.log("req.headers.auth", req.headers.authorization);

  if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
    token = authorizationHeader.split(" ")[1];
    console.log("token", token);
    console.log("jwt_secret", process.env.JWT_SECRET);
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decodedToken, "decoded token");

      // Check if user exists in the database
      const author = await Author.findById(decodedToken.authorId).select(
        "-password"
      );
      console.log(author);

      if (!author) {
        res.status(404);
        throw new Error("User not found");
      }

      // Attach the user object to the request
      req.author = author;
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, token is required");
  }
});
export { checkToken, authorCheckToken };
