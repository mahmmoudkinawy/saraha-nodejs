const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const { validate, messageValidation } = require('../middlewares/validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Anonymous messages for users
 */

/**
 * @swagger
 * /api/messages/{recipientId}:
 *   post:
 *     summary: Send an anonymous message to a user
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: recipientId
 *         required: true
 *         schema:
 *           type: string
 *         description: The recipient's User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error or user not found
 */
router.post('/:recipientId', validate(messageValidation), async (req, res) => {
  const { recipientId } = req.params;
  const { content } = req.body;

  try {
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient)
      return res.status(400).json({ message: 'Recipient not found' });

    // Save message
    const message = new Message({ recipientId, content });
    await message.save();

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get messages sent to the authenticated user
 *     tags: [Messages]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of received messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    // Fetch messages for the logged-in user
    const messages = await Message.find({ recipientId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
