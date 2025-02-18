import express from "express";
import {
  addCategory,
  getCategory,
  getCategories,
} from "../controllers/categoriesController.js";

const router = express.Router();

router.get("/", getCategory);
router.post("/addcategory", addCategory);
router.get("/getcategory", getCategories);

export default router;
