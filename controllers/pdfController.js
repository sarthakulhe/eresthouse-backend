const axios = require('axios');

const generateChallanPDF = async (req, res) => {
  try {
    const { html, css } = req.body;
    if (!html) return res.status(400).json({ error: 'No HTML provided' });

    // Send HTML/CSS to Flask service
    const flaskRes = await axios.post(
      'https://pdf-service-wu9d.onrender.com/generate-pdf',
      { html, css },
      { responseType: 'arraybuffer' }
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="challan.pdf"',
    });
    res.send(flaskRes.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
};

module.exports = { generateChallanPDF };