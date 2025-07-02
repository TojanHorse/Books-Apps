import express from 'express';
import User from '../models/User.js';
import Thread from '../models/Thread.js';
import { auth } from '../middleware/auth.js';
import { uploadImage, uploadVideo } from '../utils/cloudinary.js';

const router = express.Router();

// Get user by anonymous ID
router.get('/user/:id', auth, async (req, res) => {
  try {
    const user = await User.findOne({ anonymousID: req.params.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      anonymousID: user.anonymousID,
      exists: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all threads for current user
router.get('/', auth, async (req, res) => {
  try {
    const threads = await Thread.find({
      participants: req.user.anonymousID,
      hiddenFor: { $ne: req.user.anonymousID }
    }).sort({ lastUpdated: -1 });

    const threadsWithContact = await Promise.all(
      threads.map(async (thread) => {
        const otherParticipant = thread.participants.find(p => p !== req.user.anonymousID);
        const contact = await User.findOne({ anonymousID: otherParticipant });
        
        return {
          _id: thread._id,
          participants: thread.participants,
          messages: thread.messages,
          lastUpdated: thread.lastUpdated,
          contactName: contact ? contact.anonymousID : 'Unknown',
          lastMessage: thread.messages[thread.messages.length - 1]
        };
      })
    );

    res.json(threadsWithContact);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message to user by ID
router.post('/:id', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const recipientID = req.params.id;

    // Check if recipient exists
    const recipient = await User.findOne({ anonymousID: recipientID });
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create thread
    let thread = await Thread.findOne({
      participants: { $all: [req.user.anonymousID, recipientID] }
    });

    if (!thread) {
      thread = new Thread({
        participants: [req.user.anonymousID, recipientID],
        messages: [],
        hiddenFor: []
      });
    }

    // Add message
    const message = {
      sender: req.user.anonymousID,
      text,
      time: new Date(),
      type: 'text'
    };

    thread.messages.push(message);
    thread.lastUpdated = new Date();
    
    // Remove from hidden if it was hidden
    thread.hiddenFor = thread.hiddenFor.filter(id => id !== req.user.anonymousID);

    await thread.save();

    // Add to contacts if not already there
    if (!req.user.contacts.includes(recipientID)) {
      req.user.contacts.push(recipientID);
      await req.user.save();
    }

    // Add sender to recipient's contacts when they reply
    if (thread.messages.some(msg => msg.sender === recipientID)) {
      if (!recipient.contacts.includes(req.user.anonymousID)) {
        recipient.contacts.push(req.user.anonymousID);
        await recipient.save();
      }
    }

    res.json({ message: 'Message sent', thread });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send image to user by ID
router.post('/:id/image', auth, uploadImage.single('image'), async (req, res) => {
  try {
    const recipientID = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Check if recipient exists
    const recipient = await User.findOne({ anonymousID: recipientID });
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create thread
    let thread = await Thread.findOne({
      participants: { $all: [req.user.anonymousID, recipientID] }
    });

    if (!thread) {
      thread = new Thread({
        participants: [req.user.anonymousID, recipientID],
        messages: [],
        hiddenFor: []
      });
    }

    // Add image message
    const message = {
      sender: req.user.anonymousID,
      text: req.file.originalname,
      imageUrl: req.file.path,
      time: new Date(),
      type: 'image'
    };

    thread.messages.push(message);
    thread.lastUpdated = new Date();
    
    // Remove from hidden if it was hidden
    thread.hiddenFor = thread.hiddenFor.filter(id => id !== req.user.anonymousID);

    await thread.save();

    // Add to contacts if not already there
    if (!req.user.contacts.includes(recipientID)) {
      req.user.contacts.push(recipientID);
      await req.user.save();
    }

    // Add sender to recipient's contacts when they reply
    if (thread.messages.some(msg => msg.sender === recipientID)) {
      if (!recipient.contacts.includes(req.user.anonymousID)) {
        recipient.contacts.push(req.user.anonymousID);
        await recipient.save();
      }
    }

    res.json({ message: 'Image sent', thread, imageUrl: req.file.path });
  } catch (error) {
    console.error('Error sending image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send video to user by ID
router.post('/:id/video', auth, uploadVideo.single('video'), async (req, res) => {
  try {
    const recipientID = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    // Check if recipient exists
    const recipient = await User.findOne({ anonymousID: recipientID });
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find or create thread
    let thread = await Thread.findOne({
      participants: { $all: [req.user.anonymousID, recipientID] }
    });

    if (!thread) {
      thread = new Thread({
        participants: [req.user.anonymousID, recipientID],
        messages: [],
        hiddenFor: []
      });
    }

    // Add video message
    const message = {
      sender: req.user.anonymousID,
      text: req.file.originalname,
      videoUrl: req.file.path,
      time: new Date(),
      type: 'video'
    };

    thread.messages.push(message);
    thread.lastUpdated = new Date();
    
    // Remove from hidden if it was hidden
    thread.hiddenFor = thread.hiddenFor.filter(id => id !== req.user.anonymousID);

    await thread.save();

    // Add to contacts if not already there
    if (!req.user.contacts.includes(recipientID)) {
      req.user.contacts.push(recipientID);
      await req.user.save();
    }

    // Add sender to recipient's contacts when they reply
    if (thread.messages.some(msg => msg.sender === recipientID)) {
      if (!recipient.contacts.includes(req.user.anonymousID)) {
        recipient.contacts.push(req.user.anonymousID);
        await recipient.save();
      }
    }

    res.json({ message: 'Video sent', thread, videoUrl: req.file.path });
  } catch (error) {
    console.error('Error sending video:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear thread
router.post('/:id/clear', auth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    // Add user to hiddenFor array
    if (!thread.hiddenFor.includes(req.user.anonymousID)) {
      thread.hiddenFor.push(req.user.anonymousID);
    }

    // If both participants have hidden it, delete the thread
    if (thread.hiddenFor.length === thread.participants.length) {
      await Thread.findByIdAndDelete(req.params.id);
    } else {
      await thread.save();
    }

    res.json({ message: 'Thread cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;