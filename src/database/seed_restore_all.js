const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const seedAllFormats = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        const fullFormats = [
            {
                name: 'ANNEXURE-1',
                title: 'LETTER OF APPLICATION',
                pages: [
                    `<div class="annexure-page"><div class="annexure-header"><h3 class="annexure-id">ANNEXURE - 1</h3><h2 class="annexure-title">LETTER OF APPLICATION</h2><p class="annexure-note">(NOTE: On the letter head paper of the applicant including full postal address, telephone no, and email id.)</p></div><div class="annexure-body"><div class="meta-section"><p>To,</p><div class="address-block" style="margin-left: 40px; margin-top: 10px;"><p>Executive Engineer ,</p><p>Construction Division Lucknow-12,</p><p>1st floor, Neelgiri Complex,</p><p>Indira Nagar, Lucknow</p></div><p class="date-line" style="text-align: right;">Date: ....................</p></div><div class="salutation" style="margin: 20px 0;">Sir,</div><div class="content-paragraphs"><p style="text-indent: 40px;">1. Being duly authorized to represent and act on behalf of............................................................("here in after referred to as" the Applicant") and having reviewed and fully understood all the pre-qualification information provided, the undersigned here by apply to be considered by yourself for the prequalification/technical bid for the <strong>"Empanelment of Architects / Consultants Firms in the Categories of AA/ A/ B & C under UPAVP for Deposit/Parishad works."</strong></p><p>2. Attached with this letter are copies or original documents defining:</p><ul class="alpha-list" style="list-style-type: lower-alpha; margin-left: 60px;"><li>The applicants' legal status.</li><li>The principal place of business.</li><li>The place of incorporation (for applicant who are corporations) or the place of registration and the nationality of the owners (for applicants who are partnerships or individually owned firms).</li></ul><p>3. Your agency and its authorized representatives are here by authorized to conduct any inquiries or investigations to verify the statements, documents and information submitted in connection with this application, and to seek clarification from our bankers and clients regarding any financial and technical aspects. This letter of application will also serve as authorization for any individual or authorized representative or any institution referred to in the supporting information, to provide such information deemed necessary and requested by yourselves to verify statements and information provided in this application, or with regard to the resources, experience, and competence of the Applicant.</p><p>4. Your agency and its authorized representatives may contact the following persons for further information:</p></div></div></div>`,
                    `<div class="annexure-page"><div class="annexure-body"><table class="format-table border-all" style="width: 100%; margin: 20px 0;"><tr><td colspan="2" style="background: #f8fafc; font-weight: 700;">General, Personnel, Technical and Financial Enquiries with name & post.</td></tr><tr><td style="width: 50%;">Contact 1:</td><td>Telephone 1: <br/> Mobile No.</td></tr><tr><td>Contact 2:</td><td>Telephone 2: <br/> Mobile No.</td></tr></table><div class="content-paragraphs"><p>5. This application is made with the full understanding that:</p><ul class="alpha-list" style="list-style-type: lower-alpha; margin-left: 40px;"><li>Bids by pre-qualified applicants will be subject to verification of all information submitted for pre-qualification at the time of bidding.</li><li>Your agency reserves the right to:-<ul style="list-style-type: disc; margin-left: 30px;"><li>Amend the scope and value of any contracts to be bid under this project; in which event, bids will be invited only from those applicants who meet the resulting amended pre-qualification requirements; and</li><li>Reject or accept any application, cancel the pre-qualification process, and reject all applications without assigning reasons or incurring any liability there of;</li></ul></li><li>Your agency shall not be liable for any such actions and shall be under no obligation to inform the Applicant</li></ul><p style="margin-top: 20px;">6. The undersigned declare that the statements made and the information provided in the duly completed application are true, and correct in every detail.</p></div><div class="signature-section" style="margin-top: 60px;"><div class="signature-block"><p style="font-weight: 700;">Sealed & Signed</p><div style="height: 40px;"></div><p>Name: .............................................................</p><div style="height: 20px;"></div><p>For and on behalf of .................................................</p></div></div><div class="note-box" style="margin-top: 50px; background: #fff; border: none; font-size: 13px;"><p><strong>Note:</strong> Copy of power of attorney/ partnership deed duly attested by notary authorising the person who sign the bid must be attached with this letter of application.</p></div></div></div>`
                ]
            },
            {
                name: 'ANNEXURE-4',
                title: 'GENERAL INFORMATION',
                pages: [
                    `<div class="annexure-page"><div class="annexure-header"><h3 class="annexure-id">ANNEXURE - 4</h3><h2 class="annexure-title">GENERAL INFORMATION</h2><p class="annexure-note">All individual firms applying for pre-qualification (technical bid) are requested to complete the information in this form.</p></div><table class="format-table border-all"><tr><td style="text-align: center; width: 40px;">1.</td><td style="width: 200px; font-weight: 600;">Name of firm</td><td></td></tr><tr><td style="text-align: center;">2.</td><td style="font-weight: 600;">Head office address</td><td></td></tr><tr><td style="text-align: center;">3.</td><td style="font-weight: 600;">Telephone</td><td>Contact Person</td></tr><tr><td style="text-align: center;">4.</td><td style="font-weight: 600;">Fax</td><td>E-mail No.</td></tr><tr><td style="text-align: center;">5.</td><td style="font-weight: 600;">Place of Incorporation / Registration</td><td>Year of Incorporation / Registration</td></tr></table></div>`
                ]
            },
            {
                name: 'ANNEXURE-5',
                title: 'PERSONNEL CAPABILITIES',
                pages: [
                    `<div class="annexure-page"><div class="annexure-header"><h3 class="annexure-id">ANNEXURE-5</h3><p class="annexure-subnote">(To be given on Rs. 100.00 Non-Judicial stamp paper)</p><h2 class="annexure-title">PERSONNEL CAPABILITIES</h2></div><table class="format-table border-all grid-header"><thead><tr><th style="width: 50px;">Sl. No.</th><th>Designation</th><th>Total Number</th><th>Name</th><th>Qualification</th><th style="width: 250px;">Professional experience</th></tr></thead><tbody><tr><td>1.</td><td>Architect</td><td></td><td></td><td></td><td></td></tr><tr><td>2.</td><td>Structural Engineer</td><td></td><td></td><td></td><td></td></tr><tr><td>3.</td><td>Civil Engineer</td><td></td><td></td><td></td><td></td></tr><tr><td>4.</td><td>Electrical/HEC Engineer</td><td></td><td></td><td></td><td></td></tr></tbody></table></div>`
                ]
            },
             {
                name: 'ANNEXURE-6',
                title: 'EXPERIENCE OF CONSULTANCY',
                pages: [
                    `<div class="annexure-page"><div class="annexure-header"><h3 class="annexure-id">ANNEXURE-6</h3><h2 class="annexure-title">EXPERIENCE OF CONSULTANCY OF COMPLETED PROJECTS</h2><p class="section-desc">Details of Projects Architecture/Consultancy completed during last Ten years</p></div><table class="format-table border-all grid-header"><thead><tr><th style="width: 40px;">Sl.No</th><th>Name of project/ package</th><th>Name of Organization</th><th>Cost of project (Rs. In Lakhs)</th><th>Actual date of completion</th></tr></thead><tbody><tr><td>1</td><td></td><td></td><td></td><td></td></tr><tr><td>2</td><td></td><td></td><td></td><td></td></tr><tr><td>3</td><td></td><td></td><td></td><td></td></tr></tbody></table></div>`
                ]
            },
            {
                name: 'ANNEXURE-7',
                title: 'FINANCIAL CAPABILITIES',
                pages: [
                    `<div class="annexure-page"><div class="annexure-header"><h3 class="annexure-id">ANNEXURE-7</h3><h2 class="annexure-title">FINANCIAL CAPABILITIES</h2><p class="annexure-note">Summary of assets and liabilities on the basis of the audited financial statement of the last three financial years.</p></div><table class="format-table border-all grid-header"><thead><tr><th style="width: 200px;">Financial Information</th><th style="width: 150px;">2022-23</th><th style="width: 150px;">2023-24</th><th style="width: 150px;">2024-25</th></tr></thead><tbody><tr><td>1. Total Assets</td><td></td><td></td><td></td></tr><tr><td>2. Current Assets</td><td></td><td></td><td></td></tr><tr><td>3. Total Liabilities</td><td></td><td></td><td></td></tr><tr><td>4. Current Liabilities</td><td></td><td></td><td></td></tr><tr><td>5. Profit before Tax</td><td></td><td></td><td></td></tr><tr><td>6. Profit after Tax</td><td></td><td></td><td></td></tr><tr><td>7. Net Worth</td><td></td><td></td><td></td></tr></tbody></table></div>`
                ]
            }
        ];

        for (const f of fullFormats) {
            console.log(`Ensuring format: ${f.name}`);
            await client.query(
                `INSERT INTO tender.tender_formats (format_name, format_title, template_pages, life_cycle_status) 
                 VALUES ($1, $2, $3, 'ACTIVE') 
                 ON CONFLICT (format_name) 
                 DO UPDATE SET template_pages = EXCLUDED.template_pages, format_title = EXCLUDED.format_title, life_cycle_status = 'ACTIVE'`,
                [f.name, f.title, JSON.stringify(f.pages)]
            );
        }

        console.log('All formats restored and set to ACTIVE.');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.end();
    }
};

seedAllFormats();
