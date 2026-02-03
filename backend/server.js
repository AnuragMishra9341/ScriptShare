// server.js (or your current socket file)
import app from "./app.js";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import { generateResult } from "./utils/AiResults.js";
import mongoose from "mongoose";
import Message from "./models/chats.models.js"; // new model
import Project from "./models/project.models.js"; // optional membership check if you have it
import cookie from "cookie";
import { User } from "./models/user.models.js";
import jwt from "jsonwebtoken";



dotenv.config({ path: "./.env" });

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});








//   SOCKET AUTH MIDDLEWARE 
io.use(async (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) return next(new Error("No cookies"));

    const cookies = cookie.parse(rawCookie);
    const token = cookies.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email })
      .select("_id email");

    if (!user) return next(new Error("User not found"));

    socket.user = {
      id: user._id.toString(),
      email: user.email,
    };

    next(); 
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});






// helper: load last N messages for a project
async function loadHistory(projectId, limit = 100) {
  // newest-first internally then reverse to send oldest->newest
  const msgs = await Message.find({ projectId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return msgs.reverse();
}

io.on("connection", (socket) => {
  console.log("Authenticated socket connected:", socket.user.email);

  // Client should call joinRoom with: { projectId, userId, userName } (or your auth flow)
  socket.on("joinRoom", async (payload) => {
    try {
      const { projectId } = payload || {};
      if (!projectId) return;
//  Authorization check
    const project = await Project.findById(projectId).select("users");
    if (
      !project ||
      !project.users.map(id => id.toString()).includes(socket.user.id)
    ) {
      socket.emit("error", { message: "Unauthorized to join this project" });
      return;
    }

    socket.join(projectId);
    socket.projectId = projectId;

    // Send history
    const history = await loadHistory(projectId, 200);
    socket.emit("history", history);

    console.log(
      `User ${socket.user.email} joined project ${projectId}`
    );
  } catch (err) {
    console.error("joinRoom error:", err);
    socket.emit("error", { message: "Could not join room" });
  }
  });

  // Handle incoming message from client
  socket.on("message", async (msg) => {
    try {
      const projectId = socket.projectId || msg.projectId;
      if (!projectId) {
        socket.emit("error", { message: "Missing projectId" });
        return;
      }

      // Build message doc
      const messageDoc = {
  projectId,
  senderId: socket.user.id,
  senderName: socket.user.email,
  senderType: "user",
  text: msg.text || "",
  attachments: msg.attachments || [],
  createdAt: new Date()
};


      // Save user message to DB
      const saved = await Message.create(messageDoc);

      // Broadcast saved message (ensures all clients receive the canonical saved object with _id & timestamps)
      io.to(projectId).emit("message", saved);

      console.log("Message saved & broadcasted:", saved.text);

      // AI trigger: if text includes @ai (simple detection)
      if (typeof saved.text === "string" && saved.text.toLowerCase().includes("@ai")) {
        // Strip tag and make a prompt
        const prompt = saved.text.replace(/@ai/ig, "").trim();
        // Optionally create a placeholder AI message in DB to show "AI is typing..."
        const placeholder = await Message.create({
          projectId,
          senderType: "ai",
          senderName: "AI Assistant",
          text: "AI is generating response...",
          createdAt: new Date()
        });
        io.to(projectId).emit("message", placeholder);

        try {
          // call your AI util (generateResult should return { text, files? })
          const aiResponse = await generateResult(prompt);

          const aiSaved = await Message.create({
            projectId,
            senderType: "ai",
            senderName: "AI Assistant",
            text: aiResponse?.text || "No response",
            attachments: Array.isArray(aiResponse?.files) ? aiResponse.files.map(f => ({
              filename: f.filename || f.name,
              code: f.code || f.content,
              mimeType: f.mimeType || "text/plain"
            })) : [],
            createdAt: new Date()
          });

          // Option A: replace placeholder by emitting update with ids
          // Option B (simpler): emit the real aiSaved message (clients can dedupe)
          io.to(projectId).emit("message", aiSaved);

          console.log("AI response saved & broadcasted");
        } catch (aiErr) {
          console.error("AI generation failed:", aiErr);
          const errMsg = await Message.create({
            projectId,
            senderType: "system",
            senderName: "System",
            text: "AI generation failed.",
            createdAt: new Date()
          });
          io.to(projectId).emit("message", errMsg);
        }
      }
    } catch (err) {
      console.error("message handler error:", err);
      socket.emit("error", { message: "Could not process message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
