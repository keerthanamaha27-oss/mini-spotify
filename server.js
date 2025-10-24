const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Load existing songs
let songs = [];
const SONGS_FILE = 'songs.json';
if (fs.existsSync(SONGS_FILE)) {
    songs = JSON.parse(fs.readFileSync(SONGS_FILE));
}

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'video' }, // music files are uploaded as 'video' in Cloudinary
        (error, result) => {
            if (error) return res.status(500).json({ error: error.message });

            // Add song to playlist
            const newSong = { url: result.secure_url, name: req.file.originalname };
            songs.push(newSong);
            fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));

            res.json(result);
        }
    );
    stream.end(req.file.buffer);
});

// Get all songs
app.get('/songs', (req, res) => {
    res.json(songs);
});

// Start server
app.listen(PORT, () => {
    console.log(`Mini Spotify server running on port ${PORT}`);
});
