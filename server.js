require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { v2: cloudinary } = require('cloudinary');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Enable CORS
app.use(cors({ origin: '*' }));

// Cloudinary setup
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Upload route (no admin)
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'video' },
        (error, result) => {
            if (error) return res.status(500).json({ error });
            res.json(result);
        }
    );
    stream.end(req.file.buffer);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
