const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const API_KEY = process.env.AABHAS_LICENSE_KEY;
const ORG_ID = "dd0c3fc8-6849-4415-99f1-8beeb490fa91"; 

app.post('/api/run', async (req, res) => {
  const { userImage, clothImage, templateId, category = "t-shirt", topBottom = "top" } = req.body;
  
  const finalTemplateId = templateId || "f9cc7b45-6c90-4f52-9cb3-6b964c88173a";
  const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`Try-On -> Category: ${category}, Type: ${topBottom}`);

  try {
    const response = await fetch(`https://api.aabhas.tech/v1/orgs/${ORG_ID}/template/${finalTemplateId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-license-key': API_KEY
      },
      // THIS NOW MATCHES YOUR CURL EXACTLY
      body: JSON.stringify({
        entityId: "entity_default",
        traceId: traceId,
        variables: {
          "garment_category": category,
          "top_bottom": topBottom
        },
        options: {},
        inputs: {
          "load-garment-image-76": clothImage,  
          "load-person-image-129": userImage    
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json({ traceId: traceId, status: "started" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/status/:traceId', async (req, res) => {
  const { traceId } = req.params;
  try {
    const response = await fetch(`https://api.aabhas.tech/v1/orgs/${ORG_ID}/outputs/by-trace/${traceId}`, {
      headers: { 'x-license-key': API_KEY }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
