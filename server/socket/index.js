import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error'));
      }
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.anonymousID} connected`);
    
    // Join user to their own room
    socket.join(socket.user.anonymousID);

    // Handle sending text messages
    socket.on('send_message', async (data) => {
      const { recipientID, text } = data;
      
      // Emit to recipient if they're online
      socket.to(recipientID).emit('receive_message', {
        sender: socket.user.anonymousID,
        text,
        type: 'text',
        time: new Date()
      });
    });

    // Handle sending image messages
    socket.on('send_image', async (data) => {
      const { recipientID, imageUrl, fileName } = data;
      
      // Emit to recipient if they're online
      socket.to(recipientID).emit('receive_message', {
        sender: socket.user.anonymousID,
        text: fileName,
        imageUrl,
        type: 'image',
        time: new Date()
      });
    });

    // Handle sending video messages
    socket.on('send_video', async (data) => {
      const { recipientID, videoUrl, fileName } = data;
      
      // Emit to recipient if they're online
      socket.to(recipientID).emit('receive_message', {
        sender: socket.user.anonymousID,
        text: fileName,
        videoUrl,
        type: 'video',
        time: new Date()
      });
    });

    // Handle user connecting to chat
    socket.on('connect_user', (recipientID) => {
      socket.to(recipientID).emit('user_connected', socket.user.anonymousID);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.anonymousID} disconnected`);
    });
  });

  return io;
};