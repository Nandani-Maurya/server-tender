const db = require('../config/db');


exports.uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    const { label } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }





    const insertResult = await db.query(
      `INSERT INTO tender.documents (file_url, label, original_name, mime_type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [file.path, label || 'GENERAL', file.originalname, file.mimetype]
    );

    res.status(201).json({
      success: true,
      data: insertResult.rows[0],
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, message: 'Server error while uploading document' });
  }
};
