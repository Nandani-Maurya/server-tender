// routes/parsePdf.js
const express = require('express')
const multer  = require('multer')
const pdfParse = require('pdf-parse')

const router = express.Router()

// Store upload in memory (no disk write needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB max
})

// ─── Helper: convert raw PDF text to structured HTML ─────────────────────────
function textToStructuredHtml(rawText) {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  let html = ''
  let inTable = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detect FORM heading (all caps, short line)
    if (/^FORM\s+[T\-\d]+/.test(line)) {
      if (inTable) { html += '</table>'; inTable = false }
      html += `<h2 style="text-align:center">${line}</h2>`
      continue
    }

    // Detect section title (all caps, longer)
    if (line === line.toUpperCase() && line.length > 8 && !/^\d+\./.test(line)) {
      if (inTable) { html += '</table>'; inTable = false }
      html += `<h3 style="text-align:center">${line}</h3>`
      continue
    }

    // Detect numbered field lines: "1. Proposed Position", "2. Name of Staff" etc.
    if (/^\d+\.\s+/.test(line)) {
      if (inTable) { html += '</table>'; inTable = false }

      // Start a 2-column table for numbered fields
      html += `<table border="1" cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:0">`
      inTable = true

      html += `<tr>
        <td style="width:40%;font-weight:bold;background:#f5f5f5">${line}</td>
        <td style="width:60%">&nbsp;</td>
      </tr>`
      continue
    }

    // Detect Employment Record table header keywords
    if (/Dates.*Employing|From.*To/i.test(line)) {
      if (inTable) { html += '</table>'; inTable = false }

      html += `<table border="1" cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:8px">`
      inTable = true

      html += `<tr style="background:#f5f5f5">
        <th style="width:20%">Dates (From - To)</th>
        <th style="width:35%">Employing Organization</th>
        <th style="width:25%">Position Held</th>
        <th style="width:20%">Location</th>
      </tr>`

      // Add 5 empty rows
      for (let r = 0; r < 5; r++) {
        html += `<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`
      }

      html += `</table>`
      inTable = false
      continue
    }

    // Detect SUMMARY section
    if (/SUMMARY OF THE CV/i.test(line)) {
      if (inTable) { html += '</table>'; inTable = false }
      html += `<h3>${line}</h3>`
      continue
    }

    // Detect Education / Experience sub-headers
    if (/^(Education|Experience)\s*:/i.test(line)) {
      if (inTable) { html += '</table>'; inTable = false }
      html += `<p><strong>${line}</strong></p>`
      continue
    }

    // Detect sub-items like (i), (ii), (iii)
    if (/^\(i{1,3}v?\)\s+/.test(line)) {
      if (!inTable) {
        html += `<table border="1" cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:0">`
        inTable = true
      }
      html += `<tr>
        <td style="width:60%;background:#fafafa">${line}</td>
        <td style="width:40%">&nbsp;</td>
      </tr>`
      continue
    }

    // Detect signature line
    if (/Signature of Staff Member/i.test(line)) {
      if (inTable) { html += '</table>'; inTable = false }
      html += `<p style="margin-top:32px">${line}</p>`
      continue
    }

    // Detect date line
    if (/^Date\s*:/i.test(line) || /____/.test(line)) {
      if (inTable) { html += '</table>'; inTable = false }
      html += `<p>${line}</p>`
      continue
    }

    // Default: close table if open, render as paragraph
    if (inTable) { html += '</table>'; inTable = false }
    html += `<p>${line}</p>`
  }

  if (inTable) html += '</table>'

  return html
}

router.post('/parse-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are supported' })
    }

    // Parse PDF buffer using classic pdf-parse
    const data = await pdfParse(req.file.buffer)

    // Convert to structured HTML
    const html = textToStructuredHtml(data.text)

    return res.json({ html, pages: data.numpages })

  } catch (err) {
    console.error('PDF parse error:', err)
    return res.status(500).json({ error: 'Failed to parse PDF' })
  }
})

module.exports = router