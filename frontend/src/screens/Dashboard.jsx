import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/privateApi.js"; // axios instance already configured with auth token

// Dashboard component: shows user's projects, allows creating a new project
// - Well commented so you can debug easily
// - Modern, pleasant styling using TailwindCSS (cards, gradients, responsive grid)
// - Accessibility and loading/error states handled

export default function Dashboard() {
  const navigate = useNavigate();

  // --- Local UI state ---
  // list of projects fetched from API
  const [projects, setProjects] = useState([]);
  // toggle to show/hide the "create project" form
  const [showForm, setShowForm] = useState(false);
  // controlled input for new project name
  const [newProjectName, setNewProjectName] = useState("");
  // loading states for fetching and creating
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  // store a user friendly error message for display
  const [error, setError] = useState("");

  // --- Fetch projects on mount ---
  useEffect(() => {
    let mounted = true; // guard to avoid state update after unmount
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // GET /users/projects should return { data: [...] }
        const response = await axios.get("/users/projects");
        if (!mounted) return;
        const arr = Array.isArray(response.data?.data) ? response.data.data : [];
        setProjects(arr);
        setError("");
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        if (!mounted) return;
        setError("Unable to load projects. Please refresh or check connection.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProjects();
    return () => { mounted = false; };
  }, []);

  // --- Create a new project ---
  // Called when the create-project form is submitted
  const handleCreateProject = async (e) => {
    e.preventDefault();
    const trimmed = newProjectName.trim();
    if (!trimmed) return setError("Project name cannot be empty");

    setCreating(true);
    setError("");
    try {
      // POST /projects/create with { projectName }
      const res = await axios.post("/projects/create", { projectName: trimmed });
      // Expect server to return created project in data: [project] or data: project
      const created = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data;

      // If server didn't return the project, fetch the list again (safe fallback)
      if (!created) {
        const fresh = await axios.get("/users/projects");
        setProjects(Array.isArray(fresh.data?.data) ? fresh.data.data : []);
      } else {
        // append created project to the local list for instant feedback
        setProjects((prev) => [...prev, created]);
      }

      // reset form
      setNewProjectName("");
      setShowForm(false);
    } catch (err) {
      console.error("Create project error:", err);
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  // --- Helper: navigate to project's chat page ---
  const openProject = (projectId) => {
    if (!projectId) return;
    navigate(`/projects/${projectId}/chat`);
  };

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 py-10 px-4 md:px-8">
      {/* Header / Hero */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Projects</h1>
            <p className="mt-1 text-gray-600">Create and open project chats for collaboration and AI assistance.</p>
          </div>

          {/* Create button (primary action). Shows the form inline when clicked. */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowForm((s) => !s); setError(""); }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:scale-[1.02] transform transition">
              {/* decorative plus */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-semibold">{showForm ? "Close" : "New Project"}</span>
            </button>
          </div>
        </div>

        {/* Optional small helper text */}
        <div className="mt-4 text-sm text-gray-500">Tip: Click a project card to open its chat and AI assistant.</div>
      </div>

      <main className="max-w-7xl mx-auto">
        {/* Create Project Form (animated, compact) */}
        {showForm && (
          <section className="mb-8">
            <form onSubmit={handleCreateProject} className="bg-white shadow-md rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Error message */}
              {error && (
                <div className="md:col-span-4 bg-red-50 text-red-700 px-4 py-2 rounded">
                  {error}
                </div>
              )}

              <label className="sr-only" htmlFor="project-name">Project name</label>
              <input
                id="project-name"
                className="md:col-span-3 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="e.g. product-feedback-bot"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
              />

              <div className="flex gap-3 md:justify-end md:col-span-1">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 md:flex-none bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700 disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setNewProjectName(""); setError(""); }}
                  className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-6 shadow-md h-32" />
            ))}
          </div>
        ) : (
          /* Projects grid */
          <section>
            {projects.length === 0 ? (
              // Empty state
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="mx-auto max-w-xs">
                  <svg className="mx-auto mb-6 h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">No projects yet</h3>
                  <p className="mt-2 text-gray-600">Create your first project to start collaborating and using the assistant.</p>
                  <div className="mt-6">
                    <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow">Create a project</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {projects.map((project) => (
                  <article
                    key={project._id}
                    onClick={() => openProject(project._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && openProject(project._id)}
                    className="cursor-pointer bg-white rounded-2xl p-6 shadow hover:shadow-xl transform hover:-translate-y-1 transition-all duration-150 flex flex-col justify-between"
                    aria-label={`Open project ${project.projectName}`}
                  >
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 truncate">{project.projectName || 'Untitled project'}</h4>
                      <p className="mt-2 text-sm text-gray-500">{project.description || 'Open to chat and AI assistant'}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">{project.collaborators ? `${project.collaborators.length} member(s)` : 'Private'}</div>
                      <div className="text-xs text-indigo-600 font-medium">Open →</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
