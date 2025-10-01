import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/privateApi.js"; // axios instance with token

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("/users/projects");
        console.log("Fetched projects:", response.data); // debug
        setProjects(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load projects");
      }
    };
    fetchProjects();
  }, []);

  // Create a new project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post("/projects/create", { projectName: newProjectName });
      const data = response.data;
      console.log(data);
     const createdProject = response.data.data[0];
       setProjects((prev) => [...prev, createdProject]);
      setShowForm(false);
      setNewProjectName("");
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex flex-center justify-center">
         <h1 className="text-4xl font-bold mb-8 text-gray-800 p-3">Your Projects</h1>
      </div>
     

      {/* Create New Project */}
      <div className="mb-8">
        {!showForm ? (
          <div
            onClick={() => setShowForm(true)}
            className="cursor-pointer bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition text-center text-gray-700 font-semibold text-lg"
          >
            + Create New Project
          </div>
        ) : (
          <form
            onSubmit={handleCreateProject}
            className="bg-white p-6 rounded-2xl shadow-md flex flex-col space-y-4"
          >
            {error && (
              <div className="bg-red-100 text-red-700 p-2 rounded text-center">
                {error}
              </div>
            )}
            <input
              type="text"
              placeholder="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition font-semibold"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(""); }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <p className="text-gray-500 text-center mt-12">
          No projects yet. Create one to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.isArray(projects) && projects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}/chat`)}
              className="cursor-pointer bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition flex items-center justify-center font-medium text-gray-700 text-lg hover:bg-blue-50"
            >
              {project.projectName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
