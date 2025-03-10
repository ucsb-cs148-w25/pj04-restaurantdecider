import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { User } from "../utils/db.js";

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
function createRoom(roomId, ownerId = null) {
  if (rooms.has(roomId)) {
    throw new Error(`Room with ID ${roomId} already exists`);
  }
  rooms.set(roomId, {
    users: new Set(),
    owner: ownerId,
    lobbySettings: {
      restaurant_list: [],
      rankingStyle: "bracket", // Default to bracket style
    },
    status: "waiting", // waiting, started, completed
    bracketResults: [], // To store user results
    finalResults: null, // Final combined results
    userInfo: new Map(), // Map to store user details like name, etc.
  });
  return rooms.get(roomId);
}
// Function to combine bracket results from all users
function combineBracketResults(bracketResults) {
  // Simplified logic for combining bracket results
  // In a real implementation, you might have more complex logic

  // If there's only one result or no results, return it
  if (bracketResults.length <= 1) {
    return bracketResults[0] || null;
  }

  // For demonstration, we'll just pick a random winner from the finalists
  const finalists = bracketResults
    .map((result) => result.winner)
    .filter(Boolean);
  if (finalists.length === 0) return null;

  // Return a randomly selected winner from finalists
  return {
    winner: finalists[Math.floor(Math.random() * finalists.length)],
    finalRound: finalists,
  };
}

// Verify and extract user info from auth token
function verifyAuthToken(token) {
  try {
    if (!token) {
      console.log("No auth token provided");
      return null;
    }

    // Match the format used in authMiddleware
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Successfully verified token:", decoded);
    return decoded; // This will contain { userId: X, iat: Y, exp: Z }
  } catch (error) {
    console.error(`Error verifying auth token: ${error.message}`);
    return null;
  }
}

export function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`New socket connection: ${socket.id}`);

    // Extract user info from auth token
    const authToken = socket.handshake.auth.token;
    const user = verifyAuthToken(authToken);
    console.log("authtoken:", authToken);
    console.log("user:", user);
    if (user) {
      socket.user = user.userId;
      console.log(`Authenticated user connected: userId ${user.userId}`);
    }

    socket.username = User.findByPk(socket.user).username;

    // Create a new lobby
    socket.on("createLobby", (lobbySettings) => {
      try {
        // Check if user is authenticated
        if (!socket.user) {
          console.log(socket);
          throw new Error("Authentication required to create a lobby");
        }

        // Generate a unique room ID (this should match your API method)
        const roomId = uuidv4();

        // Use authenticated user ID as owner
        const ownerId = socket.user;

        // Create a new room with this user as owner
        const room = createRoom(roomId, ownerId);

        // Update lobby settings
        if (lobbySettings) {
          room.lobbySettings = {
            ...room.lobbySettings,
            ...lobbySettings,
          };
        }

        // Join the room
        socket.join(roomId);
        room.users.add(socket.id);

        // Store user info
        room.userInfo.set(socket.id, {
          isOwner: true,
          userId: ownerId,
        });

        console.log(`User ${socket.id} created and joined lobby: ${roomId}`);

        // Emit success event back to creator
        socket.emit("lobbyCreated", {
          roomId,
          isOwner: true,
          lobbySettings: room.lobbySettings,
        });

        // Notify everyone in the room about user list
        emitUserList(io, roomId, room);
      } catch (error) {
        console.error(`Error creating lobby: ${error.message}`);
        socket.emit("lobbyError", { error: error.message });
      }
    });

    socket.on("joinRoom", ({ roomId, username }) => {
      try {
        // Get the room
        const room = getRoom(roomId);
        if (!room) {
          socket.emit("lobbyError", { error: "Lobby not found" });
          return;
        }

        // Use authenticated username if available
        const joinUsername = socket.username || "Guest";
        const userId = socket.user || socket.id;

        // Check if the room is accepting new users
        if (room.status !== "waiting") {
          socket.emit("lobbyError", {
            error: "Lobby is no longer accepting new users",
          });
          return;
        }

        // Join the room
        socket.join(roomId);
        room.users.add(socket.id);

        // Store username for this socket if provided
        if (username) {
          socket.username = username;
        }

        // Store user info in the room
        room.userInfo.set(socket.id, {
          username: joinUsername,
          isOwner: userId === room.owner,
          userId: userId,
        });

        console.log(`User ${socket.id} joined room: ${roomId}`);

        // Notify the new user about room details
        socket.emit("joinedLobby", {
          roomId,
          isOwner: userId === room.owner,
          lobbySettings: room.lobbySettings,
          status: room.status,
        });

        // Notify everyone in the room about user list
        emitUserList(io, roomId, room);
      } catch (error) {
        console.error(`Error joining room: ${error.message}`);
        socket.emit("lobbyError", { error: error.message });
      }
    });

    function emitUserList(io, roomId, room) {
      const users = [];
      room.userInfo.forEach((info, userId) => {
        users.push({
          userId,
          username: info.username,
          isOwner: info.isOwner,
        });
      });

      io.to(roomId).emit("userList", { users });
    }

    socket.on("leaveRoom", (roomId) => {
      try {
        if (!roomId) return;

        const room = getRoom(roomId);
        if (!room) return;

        // Leave the socket room
        socket.leave(roomId);

        // Remove user from the room data
        room.users.delete(socket.id);
        room.userInfo.delete(socket.id);

        console.log(`User ${socket.id} left room: ${roomId}`);

        // If this was the owner and others are still in the room, transfer ownership
        if (socket.id === room.owner && room.users.size > 0) {
          const newOwner = [...room.users][0]; // Get the first remaining user
          room.owner = newOwner;

          // Update the user info to reflect new owner
          if (room.userInfo.has(newOwner)) {
            const userInfo = room.userInfo.get(newOwner);
            room.userInfo.set(newOwner, { ...userInfo, isOwner: true });

            // Notify the new owner
            io.to(newOwner).emit("ownershipTransferred", { isOwner: true });
          }
        }

        // If room is empty, consider cleaning it up
        if (room.users.size === 0) {
          // Optional: Remove the room after some time
          setTimeout(() => {
            if (rooms.has(roomId) && rooms.get(roomId).users.size === 0) {
              rooms.delete(roomId);
              console.log(`Empty room ${roomId} has been removed`);
            }
          }, 3600000); // Remove after 1 hour of being empty
        } else {
          // Notify everyone in the room about user list
          emitUserList(io, roomId, room);
        }
      } catch (error) {
        console.error(`Error leaving room: ${error.message}`);
      }
    });

    // Start the lobby bracket
    socket.on("startLobby", (roomId) => {
      try {
        const room = getRoom(roomId);
        if (!room) {
          socket.emit("lobbyError", { error: "Lobby not found" });
          return;
        }

        // Verify the requester is the owner
        if (socket.id !== room.owner) {
          socket.emit("lobbyError", {
            error: "Only the lobby owner can start the bracket",
          });
          return;
        }

        // Change room status
        room.status = "started";
        room.bracketResults = []; // Reset any old results

        console.log(`Starting lobby ${roomId} with ${room.users.size} users`);

        // Notify all clients in the room to start their brackets
        io.to(roomId).emit("bracketStarted", {
          lobbySettings: room.lobbySettings,
        });
      } catch (error) {
        console.error(`Error starting lobby: ${error.message}`);
        socket.emit("lobbyError", { error: error.message });
      }
    });

    // Submit bracket results
    socket.on("submitBracketResults", ({ roomId, results }) => {
      try {
        const room = getRoom(roomId);
        if (!room) {
          socket.emit("lobbyError", { error: "Lobby not found" });
          return;
        }

        // Verify the room is in the started state
        if (room.status !== "started") {
          socket.emit("lobbyError", {
            error: "Cannot submit results at this time",
          });
          return;
        }

        console.log(
          `User ${socket.id} submitted bracket results for room ${roomId}`
        );

        // Store the user's results
        room.bracketResults.push({
          userId: socket.id,
          username: socket.username || "Guest",
          results,
        });

        // Notify everyone about the user who submitted
        io.to(roomId).emit("userSubmittedResults", {
          userId: socket.id,
          username: socket.username || "Guest",
          submittedCount: room.bracketResults.length,
          totalUsers: room.users.size,
        });

        // Check if all users have submitted their results
        if (room.bracketResults.length >= room.users.size) {
          // Combine the results
          room.finalResults = combineBracketResults(
            room.bracketResults.map((br) => br.results)
          );

          // Update room status
          room.status = "completed";

          // Send final results to all users
          io.to(roomId).emit("bracketCompleted", {
            finalResults: room.finalResults,
          });

          console.log(`Bracket completed for room ${roomId}`);
        }
      } catch (error) {
        console.error(`Error submitting bracket results: ${error.message}`);
        socket.emit("lobbyError", { error: error.message });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      // Find all rooms this user was in and notify others
      rooms.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          // Use the leaveRoom logic to handle owner transfers, etc.
          socket.leaveRoom = roomId;

          // Remove user from room
          room.users.delete(socket.id);
          room.userInfo.delete(socket.id);

          // Notify everyone about the user list change
          emitUserList(io, roomId, room);

          // Handle owner transfer
          if (socket.id === room.owner && room.users.size > 0) {
            const newOwner = [...room.users][0]; // Get the first remaining user
            room.owner = newOwner;

            // Update the user info to reflect new owner
            if (room.userInfo.has(newOwner)) {
              const userInfo = room.userInfo.get(newOwner);
              room.userInfo.set(newOwner, { ...userInfo, isOwner: true });

              // Notify the new owner
              io.to(newOwner).emit("ownershipTransferred", { isOwner: true });
            }
          }
        }
      });
    });
  });
}
