const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

// Allow your Shopify store to talk to this server
app.use(cors()); 
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads

const API_KEY = process.env.AABHAS_LICENSE_KEY;
const ORG_ID = "dd0c3fc8-6849-4415-99f1-8beeb490fa91"; 

// 1. Start the Try-On Process
app.post('/api/run', async (req, res) => {
  const { userImage, clothImage, templateId } = req.body;
  const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const response = await fetch(`https://api.aabhas.tech/v1/orgs/${ORG_ID}/template/${templateId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-license-key': API_KEY
      },
      body: JSON.stringify({
        entityId: "default",
        traceId: traceId,
        inputs: {
          "load-image-76": userImage,  // USER PHOTO
          "load-image-129": clothImage // CLOTH PHOTO
        }
      })
    });

    const data = await response.json();
    res.json({ traceId: traceId, apiStatus: response.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Check for Results
app.get('/api/status/:traceId', async (req, res) => {
  try {
    const response = await fetch(`https://api.aabhas.tech/v1/orgs/${ORG_ID}/outputs/by-trace/${req.params.traceId}`, {
      headers: { 'x-license-key': API_KEY }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vercel export
module.exports = app;