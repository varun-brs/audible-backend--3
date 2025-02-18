import express from "express";
import { checkToken } from "../middlewares/authMiddleware.js";
import {
  createAudioBook,
  getAudioBooks,
  searchAudioBooks,
  updateAudioBook,
  deleteAudioBook,
  getAllAudioBooks,
  getBooksByCategory,
} from "../controllers/audioBooksController.js";

const router = express.Router();

router.post("/register", checkToken, createAudioBook);
router.get("/getaudiobooks", checkToken, getAudioBooks);
router.get("/search", checkToken, searchAudioBooks);
router.patch("/editaudiobooks/:id", checkToken, updateAudioBook);
router.delete("/deleteaudiobooks/:id", checkToken, deleteAudioBook);
router.get("/getallaudiobooks", checkToken, getAllAudioBooks);
router.get("/category/:category", getBooksByCategory);

export default router;
