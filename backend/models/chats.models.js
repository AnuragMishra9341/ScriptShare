// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // AI/system messages may not have user id
  },
  senderName: {
    type: String,
    required: true
  },
  senderType: { // "user" | "ai" | "system"
    type: String,
    enum: ["user", "ai", "system"],
    default: "user"
  },
  text: {
    type: String,
    default: ""
  },
  attachments: [
    {
      filename: String,
      url: String,
      mimeType: String,
      code: String // if AI returns inline code
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  edited: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  meta: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

// Compound index for retrieving timeline
messageSchema.index({ projectId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
