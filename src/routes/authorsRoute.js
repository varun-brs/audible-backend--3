import express from "express";

import {
  createAuthor,
  verifyEmail,
  loginAuthor,
  getAuthorProfile,
  updateAuthorProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authorsController.js";

import { authorCheckToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", createAuthor);
router.get("/verifyEmail/:verifyToken", verifyEmail);
router.post("/login", loginAuthor);
router.get("/profile", authorCheckToken, getAuthorProfile);
router.put("/profile", authorCheckToken, updateAuthorProfile);
router.put("/updatepassword", authorCheckToken, updatePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);
export default router;
