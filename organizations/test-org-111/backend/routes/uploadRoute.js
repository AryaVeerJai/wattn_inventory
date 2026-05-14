const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/fileupload');

// Route to handle file upload
router.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.body)
  console.log(req.file);
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.send({ fileUrl });
});
 
module.exports = router;
