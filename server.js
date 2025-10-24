// server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Admin password
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "secret123";

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Upload route
app.post("/upload", upload.single("file"), (req, res) => {
  const password = req.headers["admin-password"];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized: Invalid admin password" });
  }
  const stream = cloudinary.uploader.upload_stream(
    { resource_type: "video" },
    (error, result) => {
      if (error) return res.status(500).json({ error });
      res.json(result);
    }
  );
  stream.end(req.file.buffer);
});

// Health check
app.get("/health", (req, res) => res.send("Mini Spotify backend running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
