import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video'],
    default: 'text'
  },
  time: {
    type: Date,
    default: Date.now
  }
});

const threadSchema = new mongoose.Schema({
  participants: [{
    type: String,
    required: true
  }],
  messages: [messageSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  hiddenFor: [{
    type: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Thread', threadSchema);