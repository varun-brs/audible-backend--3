import express from "express";
import connectDB from "./src/config/db.js";
// import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./src/routes/usersRoute.js";
import languageRoute from "./src/routes/languagesRoute.js";
import categoryRoute from "./src/routes/categoriesRoute.js";
import authorRoute from "./src/routes/authorsRoute.js";
import filterRoute from "./src/routes/filtersAPIRoute.js";
import audiobooksRoute from "./src/routes/audioBooksRoute.js";

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { notFound, errHandler } from "./src/middlewares/errMiddleware.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const port = process.env.PORT || 3011;

// Connect to the database
await connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Allow only your frontend
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    credentials: true, // Allow cookies/auth headers
    allowedHeaders: "Content-Type,Authorization",
  })
);

// app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));
console.log(path.join(__dirname, "src/uploads"));

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "src", "uploads"));
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// app.post("/single", upload.single("image"), async (req, res) => {
//   try {
//     const { path, filename } = req.file;
//     const image = await Image({ path, filename });
//     console.log(image);
//     await image.save();
//     res.send({ msg: "image uploaded" });
//   } catch (error) {
//     res.send({ error: "Unable to upload image" });
//   }
// });

app.use("/api/users", userRoute);
app.use("/api/languages", languageRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/filters", filterRoute);
app.use("/api/authors", authorRoute);
app.use("/api/audiobooks", audiobooksRoute);

// Use absolute path for production
const viewsPath =
  process.env.NODE_ENV === "production"
    ? "/opt/render/project/src/src/templates"
    : path.join(__dirname, "src", "templates");

app.set("views", viewsPath);
app.set("view engine", "ejs");

// Error handling middleware
app.use(notFound);
app.use(errHandler);

app.listen(port, console.log(`Server started on port ${port}`));
