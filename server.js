require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { v2: cloudinary } = require('cloudinary');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(__dirname));

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Path to store uploaded songs info
const SONGS_FILE = path.join(__dirname, 'songs.json');

// Ensure songs.json exists
if (!fs.existsSync(SONGS_FILE)) {
    fs.writeFileSync(SONGS_FILE, JSON.stringify([]));
}

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'video' }, // music files
        (error, result) => {
            if (error) return res.status(500).json({ error });

            // Save uploaded song URL to songs.json
            const songs = JSON.parse(fs.readFileSync(SONGS_FILE));
            songs.push({
                name: req.file.originalname,
                url: result.secure_url
            });
            fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2));

            res.json(result); // return uploaded file URL
        }
    );

    stream.end(req.file.buffer);
});

// Route to get all uploaded songs
app.get('/songs', (req, res) => {
    const songs = JSON.parse(fs.readFileSync(SONGS_FILE));
    res.json(songs);
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
