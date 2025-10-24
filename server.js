require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { v2: cloudinary } = require('cloudinary');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Enable CORS so frontend can make requests
app.use(cors({ origin: '*' }));

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'video' }, // music files use "video" type
        (error, result) => {
            if (error) return res.status(500).json({ error });
            res.json(result); // return uploaded file URL
        }
    );
    stream.end(req.file.buffer);
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
