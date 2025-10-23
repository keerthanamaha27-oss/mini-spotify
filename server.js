// Load dotenv from .env
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

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

// In-memory array to store uploaded songs
let songs = [];

// Upload route
app.post('/upload', upload.single('song'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const stream = cloudinary.uploader.upload_stream(
    { resource_type: 'video', folder: 'songs' }, // video type allows audio
    (error, result) => {
      if (error) return res.status(500).json({ error: error.message });

      // Add song to array with metadata
      songs.unshift({
        name: file.originalname,
        size: (file.size / 1024).toFixed(2) + ' KB',
        url: result.secure_url,
        date: new Date().toLocaleString()
      });

      res.json({ songs });
    }
  );

  stream.end(file.buffer);
});

// Route to get all songs
app.get('/songs', (req, res) => {
  res.json({ songs });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
