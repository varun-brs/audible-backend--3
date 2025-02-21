import express from "express";
import connectDB from "./src/config/db.js";
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

// app.use(
//   cors({
//     origin: "https://audible-frontend-s0x8.onrender.com", // Allow only your frontend
//     methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
//     credentials: true, // Allow cookies/auth headers
//     allowedHeaders: "Content-Type,Authorization",
//   })
// );

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/users", userRoute);
app.use("/api/languages", languageRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/filters", filterRoute);
app.use("/api/authors", authorRoute);
app.use("/api/audiobooks", audiobooksRoute);

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/// Debugging for development (Make sure to remove or disable this in production)
if (process.env.NODE_ENV === "development") {
  app.get("/debug-paths", (req, res) => {
    const debug = {
      viewsPath,
      viewsExists: fs.existsSync(viewsPath),
      cwd: process.cwd(),
      dirname: __dirname,
      viewsContents: fs.existsSync(viewsPath)
        ? fs.readdirSync(viewsPath)
        : "Directory not found",
      env: process.env.NODE_ENV,
    };
    res.json(debug);
  });
}

app.set("views", viewsPath);
app.set("view engine", "ejs");

// Error handling middleware
app.use(notFound);
app.use(errHandler);

app.listen(port, console.log(`Server started on port ${port}`));
