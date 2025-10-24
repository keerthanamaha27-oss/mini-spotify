const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const path = require('path'); // Added for serving index.html
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Optional: for CSS, JS, images

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Songs JSON
const SONGS_FILE = 'songs.json';
let songs = [];
if (fs.existsSync(SONGS_FILE)) {
    songs = JSON.parse(fs.readFileSync(SONGS_FILE));
}

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'video' }, // music files as video
        (error, result) => {
            if (error) return res.status(500).json({ error: error.message });

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

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => console.log(`Mini Spotify backend running on port ${PORT}`));
