import React, { useEffect, useState, useRef,useContext } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "../utils/privateApi.js";
import { FiSend, FiUser } from "react-icons/fi";
import { UserContext } from "../context/Usercontext.jsx";
let socket;

const ChatPage = () => {
  const { projectId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [collabEmail, setCollabEmail] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [showCollaborators, setShowCollaborators] = useState(false);
 const { user } = useContext(UserContext);

  const chatEndRef = useRef(null);

  const fetchCollaborators = async () => {
    try {
      const res = await axios.get(`/projects/fetch-collaborator/${projectId}`);
      setCollaborators(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Connect socket and join room
  useEffect(() => {
    socket = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });

    socket.emit("joinRoom", projectId);

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]); // append incoming msg
    });

    return () => {
      socket.emit("leaveRoom", projectId);
      socket.disconnect();
    };
  }, [projectId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const msg = {
      text: input,
      sender:user.email,
    };

    socket.emit("message", msg); // send to backend
    setMessages((prev) => [...prev, msg]); // append locally
    setInput("");
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!collabEmail.trim()) return;

    try {
      const res = await axios.post("/projects/add", {
        email: collabEmail,
        projectId,
      });
      alert(res.data.message || "Collaborator added");
      setCollabEmail("");
      setShowAddCollaborator(false);
      fetchCollaborators();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add collaborator");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        <h2 className="text-xl font-bold text-gray-800">Project Chat</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FiUser
              size={24}
              className="cursor-pointer hover:text-blue-500"
              onClick={() => {
                fetchCollaborators();
                setShowCollaborators(!showCollaborators);
              }}
            />
            {showCollaborators && (
              <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-md p-3 z-50">
                <h4 className="text-gray-500 font-semibold mb-2">Collaborators</h4>
                <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto">
                  {collaborators.map((collab, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm text-center truncate"
                      title={collab}
                    >
                      {collab}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Collaborator */}
      <div className="p-4 bg-gray-100">
        {!showAddCollaborator ? (
          <button
            onClick={() => setShowAddCollaborator(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            + Add Collaborator
          </button>
        ) : (
          <form onSubmit={handleAddCollaborator} className="flex space-x-2 items-center">
            <input
              type="email"
              placeholder="Partner's Email"
              value={collabEmail}
              onChange={(e) => setCollabEmail(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddCollaborator(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-xs ${
              msg.sender === user.email ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            {msg.sender !== user.email && <span className="text-xs text-gray-400">{msg.sender}</span>}
            <div
              className={`px-4 py-2 rounded-lg ${
                msg.sender === "You" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* Message input */}
      <div className="p-4 bg-white flex items-center space-x-2 shadow-inner">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
