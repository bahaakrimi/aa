const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Image = require('../models/Image');

const router = express.Router();

// Configuration de Multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/upload', upload.single('image'), async (req, res) => {
  const img = fs.readFileSync(req.file.path);
  const newImage = new Image({
    name: req.body.name,
    img: {
      data: img,
      contentType: req.file.mimetype
    }
  });

  await newImage.save();
  res.send('Image uploaded successfully!');
});

module.exports = router;