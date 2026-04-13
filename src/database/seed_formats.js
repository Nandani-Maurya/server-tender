const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const seedFormats = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        const formats = [
            {
                name: 'ANNEXURE-1',
                title: 'LETTER OF APPLICATION',
                html: `
<div class="annexure-page">
    <div class="annexure-header">
        <h3 class="annexure-id">ANNEXURE - 1</h3>
        <h2 class="annexure-title">LETTER OF APPLICATION</h2>
        <p class="annexure-note">(NOTE: On the letter head paper of the applicant including full postal address, telephone no, and email id.)</p>
    </div>
    
    <div class="annexure-body">
        <div class="meta-section">
            <p>To,</p>
            <div class="address-block">
                <p>Executive Engineer ,</p>
                <p>Construction Division Lucknow-12,</p>
                <p>1st floor, Neelgiri Complex,</p>
                <p>Indira Nagar, Lucknow</p>
            </div>
            <p class="date-line">Date: ....................</p>
        </div>

        <div class="salutation">Sir,</div>

        <div class="content-paragraphs">
            <p>1. Being duly authorized to represent and act on behalf of............................................................("here in after referred to as" the Applicant") and having reviewed and fully understood all the pre-qualification information provided, the undersigned here by apply to be considered by yourself for the prequalification/technical bid for the <strong>"Empanelment of Architects / Consultants Firms in the Categories of AA/ A/ B & C under UPAVP for Deposit/Parishad works."</strong></p>

            <p>2. Attached with this letter are copies or original documents defining:</p>
            <ul class="alpha-list">
                <li>a. The applicants' legal status.</li>
                <li>b. The principal place of business.</li>
                <li>c. The place of incorporation (for applicant who are corporations) or the place of registration and the nationality of the owners (for applicants who are partnerships or individually owned firms).</li>
            </ul>

            <p>3. Your agency and its authorized representatives are here by authorized to conduct any inquiries or investigations to verify the statements, documents and information submitted in connection with this application, and to seek clarification from our bankers and clients regarding any financial and technical aspects. This letter of application will also serve as authorization for any individual or authorized representative or any institution referred to in the supporting information, to provide such information deemed necessary and requested by yourselves to verify statements and information provided in this application, or with regard to the resources, experience, and competence of the Applicant.</p>

            <p>4. Your agency and its authorized representatives may contact the following persons for further information:</p>
            
            <table class="contact-table">
                <tr>
                    <td>General and Managerial Inquiries:</td>
                    <td>............................................................</td>
                </tr>
                <tr>
                    <td>Personnel Inquiries:</td>
                    <td>............................................................</td>
                </tr>
                <tr>
                    <td>Technical Inquiries:</td>
                    <td>............................................................</td>
                </tr>
                <tr>
                    <td>Financial Inquiries:</td>
                    <td>............................................................</td>
                </tr>
            </table>

            <p>5. This application is made with the full understanding that:</p>
            <ul class="roman-list">
                <li>(a) Bids by pre-qualified applicants will be subject to verification of all information submitted for pre-qualification at the time of bidding.</li>
                <li>(b) Your agency reserves the right to:
                    <ul class="bullet-inner">
                        <li>Amend the scope and value of any contracts to be bid under this project; in which event, bids will be invited only from those applicants who meet the resulting amended pre-qualification requirements; and</li>
                        <li>Reject or accept any application, cancel the pre-qualification process, and reject all applications.</li>
                    </ul>
                </li>
                <li>(c) Your agency shall not be liable for any such actions and shall be under no obligation to inform the Applicant of the ground.</li>
            </ul>

            <p>6. The undersigned declare that the statements made and the information provided in the duly completed application are complete, true, and correct in every detail.</p>
        </div>

        <div class="signature-section">
            <div class="signature-block">
                <p>Signed: .............................................................</p>
                <p>Name: .............................................................</p>
                <p>For and on behalf of: .................................................</p>
                <p>(Name of Applicant firm)</p>
            </div>
        </div>
    </div>
</div>
                `
            },
            {
                name: 'ANNEXURE-4',
                title: 'GENERAL INFORMATION',
                html: `
<div class="annexure-page">
    <div class="annexure-header">
        <h3 class="annexure-id">ANNEXURE - 4</h3>
        <h2 class="annexure-title">GENERAL INFORMATION</h2>
        <p class="annexure-note">All individual firms applying for pre-qualification (technical bid) are requested to complete the information in this form. Information to be provided for all owners of APPLICANTS who are in partnerships, members or individually-owned firms.</p>
    </div>

    <table class="format-table border-all">
        <tr>
            <td class="col-center">1.</td>
            <td class="col-label">Name of firm</td>
            <td class="col-data"></td>
        </tr>
        <tr>
            <td class="col-center">2.</td>
            <td class="col-label">Head office address</td>
            <td class="col-data"></td>
        </tr>
        <tr>
            <td class="col-center">3.</td>
            <td class="col-label">Telephone</td>
            <td class="col-data">
                <div class="row-flex">
                    <div class="flex-1 border-r">1. </div>
                    <div class="flex-2">Contact Person</div>
                </div>
            </td>
        </tr>
        <tr>
            <td class="col-center">4.</td>
            <td class="col-label">Fax</td>
            <td class="col-data">
                <div class="row-flex">
                    <div class="flex-1 border-r">1. </div>
                    <div class="flex-2">E-mail No.</div>
                </div>
            </td>
        </tr>
        <tr>
            <td class="col-center">5.</td>
            <td class="col-label">Place of incorporation / registration</td>
            <td class="col-data">
                <div class="row-flex">
                    <div class="flex-1 border-r">1. </div>
                    <div class="flex-2">Year of incorporation / registration</div>
                </div>
            </td>
        </tr>
        <tr>
            <td class="col-center"></td>
            <td class="col-label">Registration</td>
            <td class="col-data">
                <div class="row-flex">
                    <div class="flex-1 border-r">1. </div>
                    <div class="flex-2"></div>
                </div>
            </td>
        </tr>
    </table>
</div>
                `
            },
            {
                name: 'ANNEXURE-5',
                title: 'PERSONNEL CAPABILITIES',
                html: `
<div class="annexure-page">
    <div class="annexure-header">
        <h3 class="annexure-id">ANNEXURE-5</h3>
        <p class="annexure-subnote">(To be given on Rs. 100.00 Non-Judicial stamp paper)</p>
        <h2 class="annexure-title">PERSONNEL CAPABILITIES</h2>
    </div>

    <table class="format-table border-all grid-header">
        <thead>
            <tr>
                <th style="width: 50px;">Sl. No.</th>
                <th>Designation</th>
                <th>Total Number</th>
                <th>Name</th>
                <th>Qualification</th>
                <th style="width: 250px;">Professional experience and details of work carried out</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>1</td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>2</td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>3</td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>4</td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>5</td><td></td><td></td><td></td><td></td><td></td></tr>
        </tbody>
    </table>
</div>
                `
            },
            {
                name: 'ANNEXURE-6',
                title: 'EXPERIENCE OF CONSULTANCY OF COMPLETED PROJECTS',
                html: `
<div class="annexure-page">
    <div class="annexure-header">
        <h3 class="annexure-id">ANNEXURE-6</h3>
        <h2 class="annexure-title">EXPERIENCE OF CONSULTANCY OF COMPLETED PROJECTS OF BUILDING WORKS</h2>
        <p class="annexure-subtitle">(During last ten years ending 30.06.2025)</p>
    </div>

    <table class="format-table border-all grid-header vertical-header">
        <thead>
            <tr>
                <th>Sl.No</th>
                <th>Name of work /project and location</th>
                <th>Owner or sponsoring Organization</th>
                <th>Cost of work (Rs. in Lacs)</th>
                <th>Date of commencement as per contract</th>
                <th>Stipulated date of completion</th>
                <th>Actual date of completion</th>
                <th>Name and Address/ telephone number of officer to whom reference may be made</th>
                <th>Remarks with TDS detail attached</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>1</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>2</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>3</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        </tbody>
    </table>

    <div class="note-box">
        <p><strong>NOTE:</strong> Please attach supporting documents (Completion certificate along with work order copies) for the above information.</p>
    </div>
</div>
                `
            },
            {
                name: 'ANNEXURE-7',
                title: 'FINANCIAL CAPABILITIES',
                html: `
<div class="annexure-page">
    <div class="annexure-header">
        <h3 class="annexure-id">ANNEXURE-7</h3>
        <h2 class="annexure-title">FINANCIAL CAPABILITIES</h2>
    </div>

    <div class="summary-line">
        <p>Average Annual Financial Turnover in the past 3 years</p>
        <p>Rs. .............................................................</p>
    </div>

    <table class="format-table border-all grid-header">
        <thead>
            <tr>
                <th></th>
                <th>2022-23</th>
                <th>2023-24</th>
                <th>2024-25</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>1. Total Assets</td><td></td><td></td><td></td></tr>
            <tr><td>2. Current Assets</td><td></td><td></td><td></td></tr>
            <tr><td>3. Total Liabilities</td><td></td><td></td><td></td></tr>
            <tr><td>4. Current Liabilities</td><td></td><td></td><td></td></tr>
            <tr><td>5. Profit before Tax</td><td></td><td></td><td></td></tr>
            <tr><td>6. Profit after Tax</td><td></td><td></td><td></td></tr>
            <tr><td>7. Net Worth</td><td></td><td></td><td></td></tr>
        </tbody>
    </table>

    <div class="note-box">
        <p><strong>NOTE:</strong> The above data is to be supported by audited balance sheets</p>
        <ol>
            <li>Attach copies of audited balance sheets for all Three years 2022-23, 2023-24 & 2024-25 (Un audited if available)</li>
            <li>Attach recent solvency certificate from bankers / CA.</li>
        </ol>
        <p class="certified-by">Certified by C.A.</p>
    </div>
</div>
                `
            }
        ];

        for (const f of formats) {
            console.log(`Seeding format: ${f.name}`);
            await client.query(
                `INSERT INTO tender.tender_formats (format_name, format_title, template_html) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (format_name) DO UPDATE SET template_html = EXCLUDED.template_html, format_title = EXCLUDED.format_title`,
                [f.name, f.title, f.html]
            );
        }

        console.log('Seeding complete');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.end();
    }
};

// Add unique constraint for name if not exists
const ensureUnique = async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    await client.connect();
    try {
        await client.query('ALTER TABLE tender.tender_formats ADD CONSTRAINT unique_format_name UNIQUE (format_name)');
    } catch (e) {}
    await client.end();
};

ensureUnique().then(() => seedFormats());
