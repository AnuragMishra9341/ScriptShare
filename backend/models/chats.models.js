import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isAI: { type: Boolean, default: false },

  message: String, // normal text
  code: {
    language: String,
    content: String, // actual code snippet
  },

  type: { type: String, enum: ["text", "code", "mixed"], default: "text" },
});

export const Chat = mongoose.model('Chat',chatSchema); 
