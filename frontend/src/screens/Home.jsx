import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  CpuChipIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import ChatImage from "../assets/ChatGPT Image Oct 3, 2025, 01_32_17 AM.png";

/**
 * Home page (polished, responsive fixes)
 * - fixes for clumsy text wrapping on small screens
 * - responsive illustration sizing for large screens
 * - floating preview cards moved to avoid overlap
 */
export default function Home() {
  const navigate = useNavigate();

  // demo project data (UI-only placeholders)
  const demoProjects = [
    { id: "p1", name: "AI Code Buddy", desc: "Instant code reviews and suggestions" },
    { id: "p2", name: "Docs Assistant", desc: "Summarize docs and generate examples" },
    { id: "p3", name: "Bug Triage", desc: "Group & prioritize issues with AI" },
  ];

  // testimonial samples — helpful for front-end presentation
  const testimonials = [
    { id: 1, name: "Aisha K.", role: "Frontend Intern", quote: "Helped me build features 3x faster." },
    { id: 2, name: "Ravi S.", role: "Team Lead", quote: "Real-time chat + AI assistant = massive productivity." },
  ];

  // helper to open login / onboarding
  const openLogin = () => navigate("/login");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-slate-900 to-slate-800 text-gray-100">
      {/* Top navigation */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-full p-2 shadow-md">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-lg text-gray-100">CollabChat</div>
            <div className="text-xs text-gray-300">Realtime + AI</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openLogin}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:scale-[1.02] transition"
          >
            Login
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12 md:py-20 flex flex-col md:flex-row items-center gap-8">
        {/* Left: Text content (constrained width + center on mobile) */}
        <div className="md:w-1/2 max-w-xl flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-center md:text-left">
            Collaborate. Code.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Ship faster
            </span>{" "}
            — with AI.
          </h1>

          <p className="text-gray-300 text-lg max-w-2xl text-center md:text-left">
            A unified workspace for real-time team chat, code sharing, and an integrated AI assistant you can call with{" "}
            <span className="font-semibold text-indigo-300">@AI</span>. Built to help teams prototype, review, and launch faster.
          </p>

          <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start">
            {/* Primary CTA */}
            <button
              onClick={openLogin}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl shadow-lg hover:scale-[1.02] transition"
            >
              Get started
              <ArrowRightIcon className="w-5 h-5 opacity-90" />
            </button>

            {/* small informational tag */}
            <div className="text-sm text-gray-400">No credit card • Free for interviews</div>
          </div>

          {/* Quick feature chips (wrap nicely on small screens) */}
          <div className="flex gap-2 flex-wrap mt-4 justify-center md:justify-start">
            <span className="px-3 py-1 bg-indigo-900/30 text-indigo-300 rounded-full text-sm">Socket.io Real-Time Chat</span>
            <span className="px-3 py-1 bg-pink-900/30 text-pink-300 rounded-full text-sm">AI Code Suggestions</span>
            <span className="px-3 py-1 bg-yellow-900/30 text-yellow-300 rounded-full text-sm">Live Code Viewer</span>
            <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm">Multi-Project Workspace</span>
          </div>
        </div>

        
      </header>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Why teams love it</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="Real-Time Chat"
            icon={<ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-300" />}
            desc="Low-latency messaging, typing indicators, presence, and threaded discussions for focused collaboration."
            color="indigo"
          />
          <FeatureCard
            title="Code Collaboration"
            icon={<CodeBracketIcon className="w-8 h-8 text-pink-300" />}
            desc="Share code snippets, view files, and copy with a single click — ideal for pair programming and reviews."
            color="pink"
          />
          <FeatureCard
            title="Integrated AI"
            icon={<CpuChipIcon className="w-8 h-8 text-yellow-300" />}
            desc="Invoke the assistant with @AI for summaries, refactors, test suggestions, and more — instantly."
            color="yellow"
          />
        </div>
      </section>

      {/* Projects + Testimonials */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4 text-gray-100">Projects you can demo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoProjects.map((p) => (
              <div key={p.id} className="bg-white/5 border rounded-xl p-4 shadow hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-100">{p.name}</div>
                    <div className="text-sm text-gray-400 mt-1">{p.desc}</div>
                  </div>
                  <div>
                    <button onClick={openLogin} className="text-sm text-indigo-300">Open</button>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">Preview available when you log in</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="bg-white/5 border rounded-xl p-6 shadow">
          <h4 className="font-semibold text-gray-100">What people say</h4>
          <div className="mt-4 space-y-4">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="text-sm text-gray-300">
                “{t.quote}”
                <div className="mt-2 text-xs text-gray-400">— {t.name}, {t.role}</div>
              </blockquote>
            ))}
          </div>
        </aside>
      </section>

      {/* CTA strip (updated copy) */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-12 py-8">
        <div className="bg-gradient-to-r from-indigo-700 to-pink-700 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-lg">Wishing you brilliant collaboration and successful builds! ✨</div>
            <div className="text-sm opacity-90 mt-1">
              Create together, innovate together — your ideas deserve great tools. We're excited to see what you build.
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={openLogin} className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-semibold">Get started</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white/5 border-t py-6">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} CollabChat — Built for interviews and teamwork.
        </div>
      </footer>
    </div>
  );
}

/* ----------------- Subcomponents ----------------- */
function FeatureCard({ title, icon, desc }) {
  return (
    <div className="bg-white/5 border rounded-xl p-6 shadow hover:shadow-lg transition">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-md bg-white/3">{icon}</div>
        <div>
          <div className="font-semibold text-gray-100">{title}</div>
          <div className="text-sm text-gray-400 mt-1">{desc}</div>
        </div>
      </div>
    </div>
  );
}
