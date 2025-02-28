import express from "express";
import { authMiddleware } from "./authMiddleware.js";

const router = express.Router();

// Store active rooms and their messages
const rooms = new Map();

// Initialize a room if it doesn't exist
function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      messages: [],
      users: new Set(),
    });
  }
  return rooms.get(roomId);
}

// roomId is a unique identifier for each room, typically generated when a room is created
// It could be a UUID, an incrementing number, or any other unique string
// The roomId is usually passed from the client when joining or leaving a room

router.post("/create_room", authMiddleware, async (req, res) => {
  // Here you would typically create a new room and generate a roomId
  // For example: const roomId = generateUniqueRoomId();
  res
    .status(200)
    .json({ message: "Room created successfully", roomId: "example-room-id" });
});

// Get room messages - this will be handled by Socket.IO directly
router.get("/rooms/:roomId/messages", async (req, res) => {
  res.status(200).json({
    message:
      "This endpoint is for API compatibility only. Real-time messages are handled by Socket.IO.",
    roomId: req.params.roomId,
  });
});

export default router;
