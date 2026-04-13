const express = require('express');
const multer = require('multer');

/**
 * Bridge for CommonJS/ESM: pdfjs-dist v5+ uses .mjs files
 * which must be loaded via dynamic import().
 */
let pdfjsLib;
async function getPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  }
  return pdfjsLib;
}

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Production-level PDF Parser: Converts PDF to structured HTML using coordinates
 * Detects tables, headings, and preserve underlines.
 */
async function parsePdfToHtml(buffer) {
  const pdfjs = await getPdfjs();
  
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
    disableWorker: true,
  });

  const pdf = await loadingTask.promise;
  let fullHtml = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items;

    if (items.length === 0) continue;

    // Group items into lines based on Y coordinate with a small tolerance
    const lines = {};
    const Y_TOLERANCE = 5;

    items.forEach(item => {
      const y = Math.round(item.transform[5] / Y_TOLERANCE) * Y_TOLERANCE;
      if (!lines[y]) lines[y] = [];
      lines[y].push({
        text: item.str,
        x: item.transform[4],
        width: item.width,
        height: item.height || 10,
      });
    });

    const sortedY = Object.keys(lines).sort((a, b) => b - a);
    let inTable = false;

    sortedY.forEach(y => {
      const lineItems = lines[y].sort((a, b) => a.x - b.x);
      const lineText = lineItems.map(li => li.text).join(' ').trim();
      if (!lineText) return;

      // Detect table rows: if there are significant gaps between multiple items
      const isTableRow = lineItems.length > 1 && lineItems.some((item, idx) => {
        if (idx === 0) return false;
        const prev = lineItems[idx - 1];
        return (item.x - (prev.x + prev.width)) > 25; // 25px gap suggests a separate column
      });

      if (isTableRow) {
        if (!inTable) {
          fullHtml += `<table border="1" style="width:100%; border-collapse: collapse; margin-bottom: 15px;">`;
          inTable = true;
        }
        fullHtml += `<tr>`;
        lineItems.forEach(item => {
          let content = item.text.replace(/_{3,}/g, '<span style="border-bottom: 1px solid black; min-width: 40px; display: inline-block;">&nbsp;</span>');
          fullHtml += `<td style="border: 1px solid #ccc; padding: 6px;">${content}</td>`;
        });
        fullHtml += `</tr>`;
      } else {
        if (inTable) {
          fullHtml += `</table>`;
          inTable = false;
        }

        // Detect potential headers (all caps or short and distinct)
        if (lineText.toUpperCase() === lineText && lineText.length > 3 && lineText.length < 100) {
          fullHtml += `<h3 style="margin: 15px 0 5px; color: #333;">${lineText}</h3>`;
        } else {
          let formatted = lineText.replace(/_{3,}/g, '<span style="border-bottom: 1px solid black; min-width: 60px; display: inline-block;">&nbsp;</span>');
          fullHtml += `<p style="margin: 5px 0;">${formatted}</p>`;
        }
      }
    });

    if (inTable) {
      fullHtml += `</table>`;
      inTable = false;
    }
  }

  return fullHtml;
}

router.post('/parse-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Valid PDF file required' });
    }

    const html = await parsePdfToHtml(req.file.buffer);
    res.json({ html });
  } catch (err) {
    console.error('Advanced PDF Parse Error:', err);
    res.status(500).json({ error: 'Failed to extract structured PDF content' });
  }
});

module.exports = router;