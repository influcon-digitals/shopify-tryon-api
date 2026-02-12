const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const API_KEY = process.env.AABHAS_LICENSE_KEY;
const ORG_ID = "dd0c3fc8-6849-4415-99f1-8beeb490fa91"; 

// 1. Start the Try-On Process
app.post('/api/run', async (req, res) => {
  // We default the category to 'dresses' if not sent. 
  // You can change 'dresses' to 'tops' or 'bottoms' depending on your store.
  const { userImage, clothImage, templateId, category = "dresses" } = req.body;
  
  // Use the ID from your cURL if none is sent from frontend
  const finalTemplateId = templateId || "f9cc7b45-6c90-4f52-9cb3-6b964c88173a";
  
  const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log(`Starting try-on. Template: ${finalTemplateId}, Category: ${category}`);

  try {
    const response = await fetch(`https://api.aabhas.tech/v1/orgs/${ORG_ID}/template/${finalTemplateId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-license-key': API_KEY
      },
      body: JSON.stringify({
        entityId: "entity_default",
        traceId: traceId,
        aspectRatioKey: "1:1",
        variables: {
          "garment_category": category // REQUIRED by your template
        },
        inputs: {
          // MAPPED FROM YOUR CURL COMMAND:
          "load-garment-image-76": clothImage,  // The Product Image
          "load-person-image-129": userImage    // The User's Photo
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json({ traceId: traceId, status: "started" });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Check for Results
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
