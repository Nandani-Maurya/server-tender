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

    // Deactivate existing active records instead of deleting
    await client.query(`
      UPDATE tender.iso_certificates 
      SET life_cycle_status = 'INACTIVE', updated_by = $1, updated_at = NOW() 
      WHERE life_cycle_status = 'ACTIVE'
    `, [userId]);

    const isoQuery = `
      INSERT INTO tender.iso_certificates (
        certificate_type, year, document_ids, life_cycle_status, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, 'ACTIVE', $4, NOW(), NOW())
    `;

    for (const iso of iso_certificates) {
      await client.query(isoQuery, [
        iso.certificate_type,
        iso.year,
        JSON.stringify(iso.document_ids || []),
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
      SELECT iso.*, 
      (
        SELECT json_agg(json_build_object('id', d.id, 'file_url', d.file_url))
        FROM tender.documents d
        WHERE d.id = ANY(
          SELECT (jsonb_array_elements_text(iso.document_ids))::uuid
        )
      ) as documents
      FROM tender.iso_certificates iso
      WHERE iso.life_cycle_status = 'ACTIVE'
      ORDER BY iso.created_at ASC
    `;
    const result = await db.query(query);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get ISO Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



