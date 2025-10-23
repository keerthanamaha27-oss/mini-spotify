// Load dotenv from .env explicitly
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Verify dotenv loaded correctly
console.log("Cloud Name:", process.env.CLOUD_NAME);
console.log("API Key:", process.env.API_KEY);
console.log("API Secret:", process.env.API_SECRET);

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Multer setup for audio uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('audio/')) {
      return cb(new Error('Only audio files are allowed!'));
    }
    cb(null, true);
  }
});

// Upload route
app.post('/upload', upload.single('song'), (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder: 'songs' }, // 'video' allows audio
      (error, result) => {
        if (error) {
          console.log("Cloudinary Upload Error:", error);
          return res.status(500).json({ error: error.message });
        }
        console.log("Uploaded URL:", result.secure_url);
        res.json({ url: result.secure_url });
      }
    );

    stream.end(file.buffer);
  } catch (err) {
    console.log("Server Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
