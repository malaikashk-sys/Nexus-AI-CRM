const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Add activity (Call, Email, Meeting, Note)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { contactId, type, details } = req.body;
    const activity = await prisma.activity.create({
      data: { contactId, type, details },
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add activity.' });
  }
});

module.exports = router;