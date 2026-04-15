const db = require('../config/db');

// Add GET endpoint to retrieve active organization with its dependencies
exports.getActiveOrganization = async (req, res) => {
  try {
    const orgQuery = `SELECT * FROM tender.organizations WHERE life_cycle_status = 'ACTIVE' LIMIT 1`;
    const orgResult = await db.query(orgQuery);

    if (orgResult.rows.length === 0) {
      return res.status(200).json({ success: true, data: null });
    }

    const org = orgResult.rows[0];

    // Fetch related tables with document URLs
    const isoQuery = `
      SELECT iso.*, d1.file_url as first_image_url, d2.file_url as second_image_url
      FROM tender.iso_certificates iso
      LEFT JOIN tender.documents d1 ON iso.first_image_id = d1.id
      LEFT JOIN tender.documents d2 ON iso.second_image_id = d2.id
      WHERE iso.organization_id = $1
    `;
    const isoResult = await db.query(isoQuery, [org.id]);

    const bankQuery = `
      SELECT bank.*, d1.file_url as bank_statement_url, d2.file_url as passbook_url
      FROM tender.bank_details bank
      LEFT JOIN tender.documents d1 ON bank.bank_statement_id = d1.id
      LEFT JOIN tender.documents d2 ON bank.passbook_id = d2.id
      WHERE bank.organization_id = $1
    `;
    const bankResult = await db.query(bankQuery, [org.id]);

    res.status(200).json({
      success: true,
      data: {
        ...org,
        iso_certificates: isoResult.rows,
        bank_details: bankResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching active organization:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching organization.' });
  }
};

exports.saveOrganization = async (req, res) => {
  const client = await db.pool.connect();
  const userId = req.user ? req.user.id : null; // Requires authMiddleware ideally!

  try {
    await client.query('BEGIN');

    const data = req.body;

    // Soft-delete (Archive) logic: set previously ACTIVE organization to INACTIVE
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

    // 2. Insert ISO Certificates
    if (data.iso_certificates && Array.isArray(data.iso_certificates)) {
      const isoQuery = `
        INSERT INTO tender.iso_certificates (organization_id, certificate_type, year, first_image_id, second_image_id)
        VALUES ($1, $2, $3, $4, $5)
      `;
      for (const iso of data.iso_certificates) {
        await client.query(isoQuery, [
          orgId,
          iso.certificate_type,
          iso.year,
          iso.first_image_id || null,
          iso.second_image_id || null
        ]);
      }
    }

    // 3. Insert Bank Details
    if (data.bank_details && Array.isArray(data.bank_details)) {
      const bankQuery = `
        INSERT INTO tender.bank_details (
          organization_id, bank_name, branch_name, account_holder_name,
          account_number, ifsc_code, micr_code, account_type, upi_id,
          bank_statement_id, passbook_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      for (const bank of data.bank_details) {
        await client.query(bankQuery, [
          orgId,
          bank.bank_name,
          bank.branch_name,
          bank.account_holder_name,
          bank.account_number,
          bank.ifsc_code,
          bank.micr_code,
          bank.account_type,
          bank.upi_id,
          bank.bank_statement_id || null,
          bank.passbook_id || null
        ]);
      }
    }

    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Organization details correctly updated and version saved.',
      data: {
        organization_id: orgId
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Save Organization Error:', error);
    res.status(500).json({ success: false, message: 'Transaction failed, rolled back.' });
  } finally {
    client.release();
  }
};
