const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all contacts for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.userId },
      include: { deals: true, activities: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts.', details: error.message });
  }
});

// Create a new contact
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required.' });
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        company,
        userId: req.userId,
      },
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contact.', details: error.message });
  }
});

// Update a contact
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company } = req.body;

    const contact = await prisma.contact.updateMany({
      where: { id, userId: req.userId },
      data: { name, email, phone, company },
    });

    res.json({ message: 'Contact updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact.', details: error.message });
  }
});

// Delete a contact
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.contact.deleteMany({
      where: { id, userId: req.userId },
    });

    res.json({ message: 'Contact deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact.', details: error.message });
  }
});

module.exports = router;