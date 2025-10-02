import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "../utils/privateApi.js";
import { FiSend, FiUser } from "react-icons/fi";

let socket;

const ChatPage = () => {
  const { projectId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [collabEmail, setCollabEmail] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [showCollaborators, setShowCollaborators] = useState(false);

  const chatEndRef = useRef(null);

  const fetchCollaborators = async () => {
    try {
      const res = await axios.get(`/projects/fetch-collaborator/${projectId}`);
      setCollaborators(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    socket = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });
    socket.emit("joinRoom", projectId);

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit("leaveRoom", projectId);
      socket.disconnect();
    };
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const msg = { text: input, sender: "You" };
    socket.emit("message", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main content: Chat + Files */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Chat section */}
        <div className="flex flex-col w-full md:w-2/5 border-r border-gray-300">
          {/* Chat header: profile + add collaborator */}
          <div className="flex flex-col border-b border-gray-300 p-3 bg-white z-10">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-gray-800">Project Chat</h2>
              <div className="relative">
                <FiUser
                  size={22}
                  className="cursor-pointer hover:text-blue-500"
                  onClick={() => {
                    fetchCollaborators();
                    setShowCollaborators(!showCollaborators);
                  }}
                />
                {showCollaborators && (
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md p-2 z-50">
                    <h4 className="text-gray-500 font-semibold mb-2">Collaborators</h4>
                    <div className="flex flex-col space-y-1 max-h-40 overflow-y-auto">
                      {collaborators.map((collab, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm truncate"
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

            {/* Add Collaborator */}
            {!showAddCollaborator ? (
              <button
                onClick={() => setShowAddCollaborator(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
              >
                + Add Collaborator
              </button>
            ) : (
              <form onSubmit={handleAddCollaborator} className="flex space-x-2 items-center mt-2">
                <input
                  type="email"
                  placeholder="Partner's Email"
                  value={collabEmail}
                  onChange={(e) => setCollabEmail(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                  required
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCollaborator(false)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-xs ${
                  msg.sender === "You" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {msg.sender !== "You" && (
                  <span className="text-xs text-gray-400">{msg.sender}</span>
                )}
                <div
                  className={`px-3 py-2 rounded-lg ${
                    msg.sender === "You" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          {/* Input */}
          <div className="p-2 bg-white flex items-center space-x-2 shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>

        {/* Files / Code editor section */}
        <div className="w-full md:flex-1 p-4 md:max-h-full">
    <div className="h-64 md:h-full w-full border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400">
      Files / Code editor section
    </div>
  </div>
</div>
    </div>
  );
};

export default ChatPage;