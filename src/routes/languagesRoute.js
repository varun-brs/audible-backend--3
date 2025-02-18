import express from "express";
import {
  getLanguages,
  addLanguages,
} from "../controllers/languagesController.js";

const router = express.Router();
router.get("/", getLanguages);
router.post("/addlanguage", addLanguages);

export default router;
