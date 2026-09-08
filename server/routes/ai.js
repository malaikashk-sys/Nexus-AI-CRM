const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { contactId, action } = req.body;

    if (!contactId || !action) {
      return res.status(400).json({ error: 'contactId and action are required.' });
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: { activities: true, deals: true },
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    let prompt = '';

    if (action === 'draft_email') {
      prompt = `You are a professional sales AI assistant. Draft a personalized follow-up email for a client.
      Client Name: ${contact.name}
      Company: ${contact.company || 'N/A'}
      Recent Activities: ${JSON.stringify(contact.activities)}
      Associated Deals: ${JSON.stringify(contact.deals)}
      Keep the tone warm, professional, and concise.`;
    } else if (action === 'summarize') {
      prompt = `Summarize the relationship history for this CRM client into bullet points.
      Client Name: ${contact.name}
      Activities: ${JSON.stringify(contact.activities)}
      Deals: ${JSON.stringify(contact.deals)}
      Provide key insights and recommended next action steps.`;
    } else {
      return res.status(400).json({ error: 'Invalid action specified.' });
    }

    // Model name updated to gemini-3.6-flash as instructed by API response
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('GEMINI API ERROR LOG:', data);
      return res.status(apiResponse.status).json({ error: data.error?.message || 'API Call Failed' });
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No text generated.';
    res.json({ result: generatedText });

  } catch (error) {
    console.error('SERVER ROUTE ERROR:', error);
    res.status(500).json({ error: 'AI generation failed.', details: error.message });
  }
});

module.exports = router;