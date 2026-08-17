const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file);

    // Determine message type
    const isImage = req.file.mimetype.startsWith('image/');
    const type = isImage ? 'image' : 'document';

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
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