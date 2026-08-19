const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const isImage = req.file.mimetype.startsWith('image/');
    const type = isImage ? 'image' : 'document';

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        type,
        name: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadFile };