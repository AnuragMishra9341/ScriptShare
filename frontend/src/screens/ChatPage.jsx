import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // added useNavigate
import { io } from "socket.io-client";
import axios from "../utils/privateApi.js";
import { FiSend, FiUser } from "react-icons/fi";
import { UserContext } from "../context/Usercontext.jsx";

import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// NOTE: socket instance is stored in a ref to avoid re-creating it on every render
let socket;

// --------------- ChatPage (responsive + improved styling + inline comments) ---------------
export default function ChatPage() {
  const { projectId } = useParams();
  const navigate = useNavigate(); // added navigation hook
  const { user } = useContext(UserContext);

  // --- State ---
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);

  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [collabEmail, setCollabEmail] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [showCollaborators, setShowCollaborators] = useState(false);

  const [mobileView, setMobileView] = useState("chat"); // 'chat' | 'files'

  // --- New: deleting state for project delete button (non-invasive) ---
  const [deletingProject, setDeletingProject] = useState(false);

  // --- Refs ---
  const chatEndRef = useRef(null);
  const msgsMapRef = useRef(new Map());
  const socketRef = useRef(null);

  // --- Helpers / API calls ---
  const fetchCollaborators = async () => {
    try {
      const res = await axios.get(`/projects/fetch-collaborator/${projectId}`);
      setCollaborators(res.data.data || []);
    } catch (err) {
      console.error("fetchCollaborators", err);
    }
  };

  const addMessage = useCallback((msg) => {
    const id = msg._id || msg.id;
    if (!id) return;
    if (msgsMapRef.current.has(id)) return;
    msgsMapRef.current.set(id, true);
    setMessages((prev) => [...prev, msg]);

    const attachments = msg.attachments || msg.files;
    if ((msg.senderType === "ai" || msg.senderName === "AI Assistant" || msg.sender === "AI Assistant") && Array.isArray(attachments) && attachments.length) {
      setFiles(attachments);
      setActiveFile(attachments[0]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    try {
      hljs.highlightAll();
    } catch (err) {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    socket = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", {
        projectId,
        userId: user?._id || user?.id || user?.email,
        userName: user?.name || user?.email || "Unknown",
      });
    });

    socket.on("history", (history = []) => {
      msgsMapRef.current.clear();
      const filtered = history.filter((m) => m._id || m.id);
      filtered.forEach((m) => msgsMapRef.current.set(m._id || m.id, true));
      setMessages(filtered);

      const lastAi = [...filtered].reverse().find((m) => m.senderType === "ai" || m.senderName === "AI Assistant" || m.sender === "AI Assistant");
      if (lastAi) {
        const attachments = lastAi.attachments || lastAi.files;
        if (Array.isArray(attachments) && attachments.length) {
          setFiles(attachments);
          setActiveFile(attachments[0]);
        }
      }
    });

    socket.on("message", (msg) => addMessage(msg));
    socket.on("error", (err) => console.error("Socket error:", err));

    return () => {
      try {
        socket.emit("leaveRoom", projectId);
        socket.disconnect();
      } catch (err) {
        // ignore
      }
    };
  }, [projectId, user, addMessage]);

  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const outgoing = {
      text: trimmed,
      sender: user?.email || user?.name || "Unknown",
      senderId: user?._id || user?.id || null,
      senderName: user?.name || user?.email || "Unknown",
      projectId,
    };

    try {
      socketRef.current?.emit("message", outgoing);
      setInput("");
    } catch (err) {
      console.error("Send message failed:", err);
      alert("Failed to send message. Try again.");
    }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!collabEmail.trim()) return;
    try {
      const res = await axios.post("/projects/add", { email: collabEmail, projectId });
      alert(res.data.message || "Collaborator added");
      setCollabEmail("");
      setShowAddCollaborator(false);
      fetchCollaborators();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add collaborator");
    }
  };

  const copyCodeToClipboard = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    alert("Code copied to clipboard!");
  };

  const renderMessageContent = (msg) => {
    const isAi = msg.senderType === "ai" || msg.sender === "AI Assistant" || msg.senderName === "AI Assistant";
    if (isAi) {
      return <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text || ""}</ReactMarkdown>;
    }
    return <div className="whitespace-pre-wrap">{msg.text}</div>;
  };

  // --- New: delete current project (minimal & non-invasive) ---
  const handleDeleteProject = async () => {
    // confirm deletion
    if (!projectId) {
      alert("No project selected.");
      return;
    }
    const ok = window.confirm("Are you sure you want to delete this project? This action cannot be undone.");
    if (!ok) return;

    try {
      setDeletingProject(true);
      // send DELETE request to projects/delete/:projectId
     const base = import.meta.env.VITE_API_BASE_URL; 
const res = await axios.delete(`${base}/projects/delete/${projectId}`);
      if (res?.data?.success) {
        alert(res.data.message || "Project deleted");
        // disconnect socket to clean up before navigating away
        try {
          socketRef.current?.emit("leaveRoom", projectId);
          socketRef.current?.disconnect();
        } catch (err) {
          // ignore
        }
        // navigate back to dashboard (adjust path if your app uses a different route)
        navigate("/dashboard");
      } else {
        alert(res?.data?.message || "Failed to delete project");
      }
    } catch (err) {
      console.error("Delete project failed:", err);
      alert(err?.response?.data?.message || "Failed to delete project. Try again.");
    } finally {
      setDeletingProject(false);
    }
  };

  // --- Component JSX ---
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top bar (mobile view toggle + project title) */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 md:hidden">
        <div className="text-lg font-semibold">Project Chat</div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMobileView("chat")}
            className={`px-3 py-1 rounded-lg text-sm ${mobileView === "chat" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
            Chat
          </button>
          <button
            onClick={() => setMobileView("files")}
            className={`px-3 py-1 rounded-lg text-sm ${mobileView === "files" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
            Files
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Chat Section */}
        <div
          className={`flex flex-col w-full md:w-2/5 border-r border-gray-300 min-h-0 bg-white ${
            mobileView === "files" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Chat Header (sticky inside chat column) */}
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-gray-800">Project Chat</h2>
              <div className="relative flex items-center space-x-2">
                {/* Collaborators icon and menu */}
                <div>
                  <FiUser
                    size={20}
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => {
                      fetchCollaborators();
                      setShowCollaborators(!showCollaborators);
                    }}
                  />
                  {showCollaborators && (
                    <div className="absolute right-0 mt-8 w-64 bg-white shadow-lg rounded-md p-2 z-50">
                      <h4 className="text-gray-500 font-semibold mb-2">Collaborators</h4>
                      <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto">
                        {collaborators.length ? (
                          collaborators.map((collab, idx) => (
                            <div
                              key={idx}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm truncate"
                              title={collab}
                            >
                              {collab}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400">No collaborators</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete project button (non-invasive) */}
                <button
                  onClick={handleDeleteProject}
                  disabled={deletingProject}
                  className="px-2 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50"
                  title="Delete project"
                >
                  {deletingProject ? "Deleting..." : "Delete Project"}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              {!showAddCollaborator ? (
                <button
                  onClick={() => setShowAddCollaborator(true)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  + Add Collaborator
                </button>
              ) : (
                <form onSubmit={handleAddCollaborator} className="flex w-full space-x-2 items-center">
                  <input
                    type="email"
                    placeholder="Partner's Email"
                    value={collabEmail}
                    onChange={(e) => setCollabEmail(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                    required
                  />
                  <button type="submit" className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm">Add</button>
                  <button type="button" onClick={() => setShowAddCollaborator(false)} className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm">Cancel</button>
                </form>
              )}
            </div>
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 min-h-0">
            {messages.map((msg) => {
              const isMine = (msg.senderId && (msg.senderId === user?._id || msg.senderId === user?.id)) || (msg.sender === user?.email);
              return (
                <div
                  key={msg._id || msg.id}
                  className={`flex flex-col max-w-full ${isMine ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  {!isMine && <span className="text-xs text-gray-400">{msg.senderName || msg.sender}</span>}
                  <div
                    className={`px-3 py-2 rounded-lg break-words ${isMine ? "bg-blue-500 text-white" : msg.senderType === "ai" ? "bg-green-100 text-gray-900" : "bg-gray-200 text-gray-800"}`}
                  >
                    {renderMessageContent(msg)}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div className="p-2 bg-white flex items-center space-x-2 border-t border-gray-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message... (use @ai to trigger assistant)"
              className="flex-1 border border-gray-300 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button onClick={handleSendMessage} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition" aria-label="send message">
              <FiSend size={18} />
            </button>
          </div>
        </div>

        {/* Files / Code section */}
        <div
          className={`w-full md:flex-1 flex flex-col p-4 min-h-0 bg-gray-50 ${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* File Tabs */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 flex space-x-2 overflow-x-auto py-1">
              {files.length ? (
                files.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFile(file)}
                    className={`px-3 py-1 rounded-lg text-sm border transition-colors duration-200 whitespace-nowrap ${
                      activeFile?.filename === file.filename ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {file.filename || file.name || `File ${idx + 1}`}
                  </button>
                ))
              ) : (
                <div className="text-sm text-gray-500">No files from AI yet</div>
              )}
            </div>

            {/* (Removed mobile-only chat toggle button for large screens — it served no purpose) */}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 relative bg-white rounded-lg overflow-auto shadow-inner border border-gray-200 p-2 min-h-0">
            {activeFile ? (
              <>
                <div className="absolute right-3 top-3 z-10 flex space-x-2">
                  <button
                    onClick={() => copyCodeToClipboard(activeFile.code || activeFile.content || "")}
                    className="px-2 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200 transition"
                  >
                    Copy
                  </button>
                </div>

                <pre className="m-0 p-4 overflow-auto rounded text-sm bg-gray-900 text-gray-100" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  <code
                    className={`language-${activeFile.language || activeFile.lang || "plaintext"} block`}
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        try {
                          return hljs.highlight(activeFile.code || activeFile.content || "", { language: activeFile.language || activeFile.lang || "plaintext" }).value;
                        } catch (err) {
                          const escaped = (activeFile.code || activeFile.content || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
                          return escaped;
                        }
                      })(),
                    }}
                  />
                </pre>
              </>
            ) : (
              <div className="text-gray-500 flex justify-center items-center h-full">No file selected</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
