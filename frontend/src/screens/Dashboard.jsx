// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "../utils/privateApi.js"; // axios instance with token

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [projects, setProjects] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [newProjectName, setNewProjectName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Fetch existing projects from backend on mount
//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const response = await axios.get("/projects"); // your backend endpoint
//         setProjects(response.data.projects);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchProjects();
//   }, []);

//   // Handle new project form submit
//   const handleCreateProject = async (e) => {
//     e.preventDefault();
//     if (!newProjectName.trim()) return;

//     setLoading(true);
//     try {
//       const response = await axios.post("/projects", { name: newProjectName });
//       const createdProject = response.data.project;
//       setProjects((prev) => [...prev, createdProject]);
//       setShowForm(false);
//       setNewProjectName("");
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "Failed to create project");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen p-6 bg-gray-100">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

//       {/* New Project Box */}
//       <div className="mb-6">
//         {!showForm ? (
//           <div
//             onClick={() => setShowForm(true)}
//             className="cursor-pointer bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition text-center text-gray-700 font-medium"
//           >
//             + New Project
//           </div>
//         ) : (
//           <form
//             onSubmit={handleCreateProject}
//             className="bg-white p-6 rounded-2xl shadow-md flex flex-col space-y-4"
//           >
//             {error && (
//               <div className="bg-red-100 text-red-700 p-2 rounded text-center">
//                 {error}
//               </div>
//             )}
//             <input
//               type="text"
//               placeholder="Project Name"
//               value={newProjectName}
//               onChange={(e) => setNewProjectName(e.target.value)}
//               className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//               required
//             />
//             <div className="flex space-x-2">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex-1 bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition"
//               >
//                 {loading ? "Creating..." : "Create Project"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => { setShowForm(false); setError(""); }}
//                 className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-400 transition"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         )}
//       </div>

//       {/* Projects Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {projects.map((project) => (
//           <div
//             key={project._id}
//             onClick={() => navigate(`/projects/${project._id}/chat`)}
//             className="cursor-pointer bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center font-medium text-gray-700"
//           >
//             {project.name}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/solid"; // you can install @heroicons/react

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [error, setError] = useState("");

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setError("Project name cannot be empty");
      return;
    }

    const newProject = {
      _id: Date.now(),
      name: newProjectName.trim(),
    };

    setProjects((prev) => [...prev, newProject]);
    setShowForm(false);
    setNewProjectName("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-purple-50 to-pink-50 p-6">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">
        Dashboard
      </h1>

      {/* New Project / Form */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {!showForm ? (
          <div
            onClick={() => setShowForm(true)}
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl h-32 w-52 cursor-pointer hover:border-blue-500 hover:shadow-lg transition text-gray-500 font-medium text-lg"
          >
            <PlusIcon className="h-8 w-8 mb-2 text-gray-400" />
            New Project
          </div>
        ) : (
          <form
            onSubmit={handleCreateProject}
            className="flex flex-col p-4 rounded-xl shadow-lg bg-white h-32 w-52 justify-between"
          >
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            <input
              type="text"
              placeholder="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm"
              required
            />
            <div className="flex justify-center mt-2 space-x-2">
              <button
                type="submit"
                className="bg-blue-500 text-white text-sm px-4 py-1 rounded hover:bg-blue-600 transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(""); }}
                className="bg-gray-200 text-gray-700 text-sm px-4 py-1 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() => navigate(`/projects/${project._id}/chat`)}
            className="cursor-pointer bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition flex items-center justify-center font-medium text-gray-800 text-center"
          >
            {project.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
