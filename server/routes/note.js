import express from 'express';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { sendNote } from '../utils/sendNote.js';

const router = express.Router();

// Send note via email
router.post('/', auth, async (req, res) => {
  try {
    const { recipientID, noteText } = req.body;

    // Find recipient
    const recipient = await User.findOne({ anonymousID: recipientID });
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send email
    const result = await sendNote(recipient.email, req.user.anonymousID, noteText);
    
    if (result.success) {
      res.json({ message: 'Note sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send note', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;