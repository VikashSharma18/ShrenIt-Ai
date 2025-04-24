require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store connected users by course
const courseRooms = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a course room
  socket.on("joinRoom", ({ userId, course }) => {
    socket.join(course);

    if (!courseRooms[course]) {
      courseRooms[course] = [];
    }

    // Add user to the course room if not already there
    if (!courseRooms[course].find((user) => user.userId === userId)) {
      courseRooms[course].push({ userId, socketId: socket.id });
    }

    console.log(`User ${userId} joined room: ${course}`);
    console.log(`Users in ${course}: ${courseRooms[course].length}`);
  });

  // Listen for chat messages
  socket.on(
    "chatMessage",
    ({ userId, userName, course, message, messageId }) => {
      // Create a message object
      const newMessage = {
        id: messageId || Date.now().toString(), // Use provided ID if available
        text: message,
        senderId: userId,
        senderName: userName,
        time: new Date().toISOString(),
      };

      // Broadcast the message to the course room
      io.to(course).emit("message", newMessage);
      console.log(`Message sent to ${course} by ${userName}: ${message}`);
    }
  );

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove user from all course rooms
    for (const course in courseRooms) {
      courseRooms[course] = courseRooms[course].filter(
        (user) => user.socketId !== socket.id
      );

      // Clean up empty rooms
      if (courseRooms[course].length === 0) {
        delete courseRooms[course];
      }
    }
  });
});

// Route to check if server is running
app.get("/", (req, res) => {
  res.send("CampusConnect Socket.io Server is running");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
