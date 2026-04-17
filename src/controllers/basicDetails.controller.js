const db = require('../config/db');


exports.getActiveOrganization = async (req, res) => {
  try {
    const orgQuery = `SELECT * FROM tender.organizations WHERE life_cycle_status = 'ACTIVE' LIMIT 1`;
    const orgResult = await db.query(orgQuery);

    if (orgResult.rows.length === 0) {
      return res.status(200).json({ success: true, data: null });
    }


    res.status(200).json({
      success: true,
      data: orgResult.rows[0]
    });

  } catch (error) {
    console.error('Error fetching active organization:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching organization.' });
  }
};


exports.saveOrganization = async (req, res) => {
  const client = await db.pool.connect();
  const userId = req.user ? req.user.id : null;

  try {
    await client.query('BEGIN');

    const data = req.body;


    await client.query(`
      UPDATE tender.organizations
      SET life_cycle_status = 'INACTIVE', updated_at = now(), updated_by = $1
      WHERE life_cycle_status = 'ACTIVE'
    `, [userId]);

    const contactsJson = JSON.stringify(data.contacts || []);
    const branchesJson = JSON.stringify(data.branches || []);
    const partnersJson = JSON.stringify(data.partners || []);

    const orgInsertQuery = `
      INSERT INTO tender.organizations (
        name_of_firm, registration_number, registration_date, email_address,
        web_address, year_of_establishment, type_of_firm, pan_card_number,
        gst_registration_number, epf_registration_number, esic_registration_number,
        head_office_state, head_office_city, head_office_full_address,
        contacts, branches, partners, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING id
    `;

    const orgValues = [
      data.name_of_firm || null,
      data.registration_number || null,
      data.registration_date || null,
      data.email_address || null,
      data.web_address || null,
      data.year_of_establishment || null,
      data.type_of_firm || null,
      data.pan_card_number || null,
      data.gst_registration_number || null,
      data.epf_registration_number || null,
      data.esic_registration_number || null,
      data.head_office_state || null,
      data.head_office_city || null,
      data.head_office_full_address || null,
      contactsJson,
      branchesJson,
      partnersJson,
      userId
    ];

    const orgResult = await client.query(orgInsertQuery, orgValues);
    const orgId = orgResult.rows[0].id;

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Organization basic details saved successfully.',
      data: { organization_id: orgId }
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Save Organization Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  } finally {
    if (client) client.release();
  }
};
