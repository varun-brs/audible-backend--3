import express from "express";
import { getFilterData } from "../controllers/filtersController.js";

const router = express.Router();
router.get("/", getFilterData);

export default router;
