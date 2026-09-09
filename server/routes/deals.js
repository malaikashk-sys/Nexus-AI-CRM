const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get deals for user's contacts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const deals = await prisma.deal.findMany({
      where: { contact: { userId: req.userId } },
      include: { contact: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals.' });
  }
});
// Get deals for a specific contact
router.get('/contact/:contactId', authMiddleware, async (req, res) => {
  try {
    const { contactId } = req.params;
    const deals = await prisma.deal.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals for contact.' });
  }
});

// Delete a deal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.deal.delete({ where: { id } });
    res.json({ message: 'Deal deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete deal.' });
  }
});
// Create deal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { contactId, title, value, stage } = req.body;
    const deal = await prisma.deal.create({
      data: { contactId, title, value: parseFloat(value), stage },
    });
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create deal.' });
  }
});

// Update deal stage/details
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, value, stage } = req.body;
    const deal = await prisma.deal.update({
      where: { id },
      data: { title, value: parseFloat(value), stage },
    });
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update deal.' });
  }
});

module.exports = router;