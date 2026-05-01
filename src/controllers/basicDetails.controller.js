const db = require('../config/db');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9]{10}$/;
const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{3}$/;
const epfPattern = /^[A-Z]{2}[A-Z0-9]{10,22}$/;
const esicPattern = /^[0-9]{17}$/;

const maxLengthRules = [
  ['name_of_firm', 'Name of Firm', 200],
  ['registration_number', 'Registration Number', 100],
  ['email_address', 'Email Address', 150],
  ['web_address', 'Website', 300],
  ['type_of_firm', 'Type of Firm', 100],
  ['pan_card_number', 'PAN Card Number', 10],
  ['gst_registration_number', 'GST Registration Number', 15],
  ['epf_registration_number', 'EPF Registration Number', 22],
  ['esic_registration_number', 'ESIC Registration Number', 17],
  ['head_office_state', 'Head Office State', 100],
  ['head_office_city', 'Head Office City', 100],
  ['head_office_full_address', 'Head Office Full Address', 500],
  ['head_office_pincode', 'Registered Office Pincode', 6]
];

const normalizeWebsite = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const validateOrganizationPayload = (data) => {
  const requiredFields = [
    ['name_of_firm', 'Name of Firm'],
    ['registration_number', 'Registration Number'],
    ['registration_date', 'Registration Date'],
    ['email_address', 'Email Address'],
    ['web_address', 'Website'],
    ['year_of_establishment', 'Year of Establishment'],
    ['type_of_firm', 'Type of Firm'],
    ['pan_card_number', 'PAN Card Number'],
    ['gst_registration_number', 'GST Registration Number'],
    ['epf_registration_number', 'EPF Registration Number'],
    ['esic_registration_number', 'ESIC Registration Number'],
    ['head_office_state', 'Head Office State'],
    ['head_office_city', 'Head Office City'],
    ['head_office_full_address', 'Head Office Full Address'],
    ['head_office_pincode', 'Registered Office Pincode']
  ];

  for (const [key, label] of requiredFields) {
    if (!String(data[key] || '').trim()) {
      return `${label} is required`;
    }
  }

  for (const [key, label, maxLength] of maxLengthRules) {
    if (String(data[key] || '').trim().length > maxLength) {
      return `${label} must be ${maxLength} characters or less`;
    }
  }

  if (!emailPattern.test(String(data.email_address).trim())) {
    return 'Please enter a valid email address';
  }

  if (!normalizeWebsite(data.web_address)) {
    return 'Website is required';
  }

  if (String(data.registration_date || '').trim()) {
    const selectedDate = new Date(`${data.registration_date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      return 'Registration Date cannot be greater than today';
    }
  }

  const year = Number(data.year_of_establishment);
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < 1800 || year > currentYear) {
    return 'Please enter a valid year of establishment';
  }

  if (!panPattern.test(String(data.pan_card_number).trim().toUpperCase())) {
    return 'Please enter a valid PAN card number';
  }

  if (!gstPattern.test(String(data.gst_registration_number).trim().toUpperCase())) {
    return 'Please enter a valid GST registration number';
  }

  if (!epfPattern.test(String(data.epf_registration_number).trim().toUpperCase())) {
    return 'Please enter a valid EPF registration number';
  }

  if (!esicPattern.test(String(data.esic_registration_number).trim())) {
    return 'Please enter a valid ESIC registration number';
  }

  if (!String(data.head_office_state || '').trim() ||
      !String(data.head_office_city || '').trim() ||
      !String(data.head_office_full_address || '').trim()) {
    return 'Registered office details are required';
  }

  if (!/^[0-9]{6}$/.test(String(data.head_office_pincode || '').trim())) {
    return 'Registered office pincode must be exactly 6 digits';
  }

  const contacts = Array.isArray(data.contacts) ? data.contacts : [];
  if (contacts.length === 0) {
    return 'At least one contact number is required';
  }
  for (const contact of contacts) {
    if (!String(contact?.number || '').trim()) {
      return 'Each contact number must have a phone number';
    }
    if (!phonePattern.test(String(contact.number).trim())) {
      return 'Contact phone number must be exactly 10 digits';
    }
  }

  const branches = Array.isArray(data.branches) ? data.branches : [];
  const validBranches = branches.filter((branch) =>
    ['branch_name', 'state', 'city', 'address'].some((field) => String(branch?.[field] || '').trim())
  );
  if (validBranches.length === 0) {
    return 'At least one branch office is required';
  }
  for (const branch of validBranches) {
    const hasAnyBranchData = ['branch_name', 'state', 'city', 'address'].some((field) => String(branch?.[field] || '').trim());
    if (!hasAnyBranchData) continue;

    if (!String(branch.branch_name || '').trim()) return 'Branch name is required for branch entries';
    if (String(branch.branch_name || '').trim().length > 150) return 'Branch name must be 150 characters or less';
    if (!String(branch.state || '').trim()) return 'Branch state is required for branch entries';
    if (String(branch.state || '').trim().length > 100) return 'Branch state must be 100 characters or less';
    if (!String(branch.city || '').trim()) return 'Branch city is required for branch entries';
    if (String(branch.city || '').trim().length > 100) return 'Branch city must be 100 characters or less';
    if (!String(branch.address || '').trim()) return 'Branch address is required for branch entries';
    if (String(branch.address || '').trim().length > 500) return 'Branch address must be 500 characters or less';
    if (!/^[0-9]{6}$/.test(String(branch.pincode || '').trim())) return 'Branch pincode must be exactly 6 digits';
  }

  const partners = Array.isArray(data.partners) ? data.partners : [];
  for (const partner of partners) {
    const hasAnyPartnerData = ['name', 'position', 'address', 'phone'].some((field) => String(partner?.[field] || '').trim()) || Boolean(partner?.is_authorized);
    if (!hasAnyPartnerData) continue;

    if (!String(partner.name || '').trim()) return 'Partner name is required for partner entries';
    if (String(partner.name || '').trim().length > 150) return 'Partner name must be 150 characters or less';
    if (!String(partner.position || '').trim()) return 'Partner designation is required for partner entries';
    if (String(partner.position || '').trim().length > 100) return 'Partner designation must be 100 characters or less';
    if (!String(partner.phone || '').trim()) return 'Partner mobile number is required for partner entries';
    if (!phonePattern.test(String(partner.phone).trim())) return 'Partner mobile number must be exactly 10 digits';
    if (!String(partner.address || '').trim()) return 'Partner residential address is required for partner entries';
    if (String(partner.address || '').trim().length > 500) return 'Partner residential address must be 500 characters or less';
    if (!String(partner.pincode || '').trim()) return 'Partner pincode is required for partner entries';
    if (!/^[0-9]{6}$/.test(String(partner.pincode || '').trim())) return 'Partner pincode must be exactly 6 digits';
  }

  return null;
};

exports.getActiveOrganization = async (req, res) => {
  try {
    const orgQuery = `
      SELECT *
      FROM tender.organizations
      WHERE life_cycle_status = 'ACTIVE'
      ORDER BY created_at DESC, updated_at DESC NULLS LAST, id DESC
      LIMIT 1
    `;
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
    const validationError = validateOrganizationPayload(data);
    if (validationError) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: validationError });
    }


    const activeOrgResult = await client.query(`
      SELECT id
      FROM tender.organizations
      WHERE life_cycle_status = 'ACTIVE'
      ORDER BY created_at DESC, updated_at DESC NULLS LAST, id DESC
      LIMIT 1
      FOR UPDATE
    `);

    if (activeOrgResult.rows.length > 0) {
      await client.query(`
        UPDATE tender.organizations
        SET life_cycle_status = 'INACTIVE', updated_at = now(), updated_by = $1
        WHERE life_cycle_status = 'ACTIVE'
      `, [userId]);
    }

    const contactsJson = JSON.stringify(data.contacts || []);
    const branchesJson = JSON.stringify(data.branches || []);
    const partnersJson = JSON.stringify(data.partners || []);
    const normalizedWebsite = normalizeWebsite(data.web_address);

    const orgInsertQuery = `
      INSERT INTO tender.organizations (
        name_of_firm, registration_number, registration_date, email_address,
        web_address, year_of_establishment, type_of_firm, pan_card_number,
        gst_registration_number, epf_registration_number, esic_registration_number,
        head_office_state, head_office_city, head_office_full_address,
        head_office_pincode, contacts, branches, partners, life_cycle_status, created_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'ACTIVE', $19, NOW(), NOW()
      ) RETURNING *
    `;

    const orgValues = [
      data.name_of_firm || null,
      data.registration_number || null,
      data.registration_date || null,
      data.email_address || null,
      normalizedWebsite || null,
      data.year_of_establishment || null,
      data.type_of_firm || null,
      data.pan_card_number || null,
      data.gst_registration_number || null,
      data.epf_registration_number || null,
      data.esic_registration_number || null,
      data.head_office_state || null,
      data.head_office_city || null,
      data.head_office_full_address || null,
      data.head_office_pincode || null,
      contactsJson,
      branchesJson,
      partnersJson,
      userId
    ];

    const orgResult = await client.query(orgInsertQuery, orgValues);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Organization basic details saved successfully.',
      data: orgResult.rows[0]
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Save Organization Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  } finally {
    if (client) client.release();
  }
};
