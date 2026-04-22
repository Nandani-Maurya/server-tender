const db = require('../config/db');


exports.saveIsoCertificates = async (req, res) => {
  const client = await db.pool.connect();
  const userId = req.user ? req.user.id : null;

  try {
    const { iso_certificates } = req.body;

    if (!iso_certificates || !Array.isArray(iso_certificates)) {
      return res.status(400).json({ success: false, message: 'ISO certificates must be an array' });
    }

    await client.query('BEGIN');


    await client.query('DELETE FROM tender.iso_certificates');

    const isoQuery = `
      INSERT INTO tender.iso_certificates (
        certificate_type, year, first_image_id, second_image_id, created_by
      ) VALUES ($1, $2, $3, $4, $5)
    `;

    for (const iso of iso_certificates) {
      await client.query(isoQuery, [
        iso.certificate_type,
        iso.year,
        iso.first_image_id || null,
        iso.second_image_id || null,
        userId
      ]);
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'ISO Certificates saved successfully' });

  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Save ISO Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
};


exports.getIsoCertificates = async (req, res) => {
  try {
    const query = `
      SELECT iso.*, d1.file_url as first_image_url, d2.file_url as second_image_url
      FROM tender.iso_certificates iso
      LEFT JOIN tender.documents d1 ON iso.first_image_id = d1.id
      LEFT JOIN tender.documents d2 ON iso.second_image_id = d2.id
      ORDER BY iso.id ASC
    `;
    const result = await db.query(query);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get ISO Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
