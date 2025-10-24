const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary config
console.log("Cloudinary config loaded");

// Load songs.json
const SONGS_FILE = 'songs.json';
let songs = {};
if (fs.existsSync(SONGS_FILE)) songs = JSON.parse(fs.readFileSync(SONGS_FILE));
else fs.writeFileSync(SONGS_FILE, JSON.stringify({}));

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    const { category } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!category) return res.status(400).json({ error: 'Category required' });

    if (!songs[category]) songs[category] = [];

    const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'video' },
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const newSong = { name: req.file.originalname, url: result.secure_url };
            songs[category].push(newSong);
            fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));
            res.json({ success: true, song: newSong });
        }
    );
    stream.end(req.file.buffer);
});

// Get all songs
app.get('/songs', (req, res) => res.json(songs));

// Serve frontend from /public
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`Mini Spotify running on port ${PORT}`));
