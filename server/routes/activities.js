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
// Get activities for a specific contact
router.get('/contact/:contactId', authMiddleware, async (req, res) => {
  try {
    const { contactId } = req.params;
    const activities = await prisma.activity.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities for contact.' });
  }
});

// Delete an activity
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.activity.delete({ where: { id } });
    res.json({ message: 'Activity deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete activity.' });
  }
});
module.exports = router;