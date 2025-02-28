// Store active rooms and their messages
const rooms = new Map();

// Initialize a room if it doesn't exist
function getRoom(roomId) {
  try {
    const room = rooms.get(roomId);
    if (!room) {
      throw new Error(`Room with ID ${roomId} not found`);
    }
    return room;
  } catch (error) {
    console.error(`Error getting room: ${error.message}`);
    return null;
  }
}

// Initialize a room if it doesn't exist
function createRoom(roomId) {
  if (rooms.has(roomId)) {
    throw new Error(`Room with ID ${roomId} already exists`);
  }
  rooms.set(roomId, {
    messages: [],
    users: new Set(),
  });
  return rooms.get(roomId);
}

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      messages: [],
      users: new Set(),
    });
  }
  return rooms.get(roomId);
}

export function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`New socket connection: ${socket.id}`);

    socket.on("joinRoom", (roomId) => {
      // roomId is received from the client when they want to join a specific room
      socket.join(roomId);

      // Add user to the room
      const room = getOrCreateRoom(roomId);
      room.users.add(socket.id);

      console.log(`User ${socket.id} joined room: ${roomId}`);

      // Notify everyone in the room that a new user joined
      io.to(roomId).emit("userJoined", {
        userId: socket.id,
        userCount: room.users.size,
      });

      // Send previous messages to the new user
      if (room.messages.length > 0) {
        socket.emit("previousMessages", room.messages);
      }
    });

    socket.on("leaveRoom", (roomId) => {
      // roomId is received from the client when they want to leave a specific room
      socket.leave(roomId);

      // Remove user from the room
      const room = getOrCreateRoom(roomId);
      room.users.delete(socket.id);

      console.log(`User ${socket.id} left room: ${roomId}`);

      // Notify everyone in the room that a user left
      io.to(roomId).emit("userLeft", {
        userId: socket.id,
        userCount: room.users.size,
      });
    });

    socket.on("sendMessage", ({ roomId, message }) => {
      console.log(`Message received in room ${roomId}: ${message}`);

      // Create message object with timestamp
      const messageObj = {
        userId: socket.id,
        message,
        timestamp: new Date().toISOString(),
      };

      // Store the message in the room
      const room = getOrCreateRoom(roomId);
      room.messages.push(messageObj);

      // Limit stored messages (optional)
      if (room.messages.length > 100) {
        room.messages.shift(); // Remove oldest message if we have too many
      }

      // Emit the message to everyone in the room
      io.to(roomId).emit("newMessage", messageObj);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      // Find all rooms this user was in and notify others
      rooms.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id);
          io.to(roomId).emit("userLeft", {
            userId: socket.id,
            userCount: room.users.size,
          });
        }
      });
    });
  });
}
