const db = require('../config/db');


exports.saveBankDetails = async (req, res) => {
  const client = await db.pool.connect();
  const userId = req.user ? req.user.id : null;

  try {
    const { organization_id, bank_details } = req.body;

    if (!organization_id) {
      return res.status(400).json({ success: false, message: 'Organization ID is required' });
    }

    if (!bank_details || !Array.isArray(bank_details)) {
      return res.status(400).json({ success: false, message: 'Bank details must be an array' });
    }

    await client.query('BEGIN');



    await client.query('DELETE FROM tender.bank_details WHERE organization_id = $1', [organization_id]);

    const bankQuery = `
      INSERT INTO tender.bank_details (
        organization_id, bank_name, branch_name, account_holder_name,
        account_number, ifsc_code, account_type, upi_id,
        bank_statement_id, passbook_id, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    for (const bank of bank_details) {
      await client.query(bankQuery, [
        organization_id,
        bank.bank_name,
        bank.branch_name,
        bank.account_holder_name,
        bank.account_number,
        bank.ifsc_code,
        bank.account_type,
        bank.upi_id,
        bank.bank_statement_id || null,
        bank.passbook_id || null,
        userId,
        userId
      ]);
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Bank details saved successfully' });

  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Save Bank Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
};


exports.getBankDetails = async (req, res) => {
  try {
    const { orgId } = req.params;
    const query = `
      SELECT b.*, d1.file_url as bank_statement_url, d2.file_url as passbook_url
      FROM tender.bank_details b
      LEFT JOIN tender.documents d1 ON b.bank_statement_id = d1.id
      LEFT JOIN tender.documents d2 ON b.passbook_id = d2.id
      WHERE b.organization_id = $1
      ORDER BY b.id ASC
    `;
    const result = await db.query(query, [orgId]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get Bank Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
