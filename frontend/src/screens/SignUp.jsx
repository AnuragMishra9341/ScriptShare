import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axiosInstance";

const Signup = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/users/sendOTP", { email, password });
      setStep(2);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const signup = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/users/signUp", { email, password, otp });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        
        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Create Account
        </h2>
        <p className="text-sm text-gray-500 text-center mt-2">
          {step === 1 ? "Sign up with your email" : "Verify OTP to continue"}
        </p>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={sendOTP} className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 py-3 text-white font-semibold hover:bg-purple-700 transition disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={signup} className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                className="mt-1 w-full text-center tracking-widest rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-lg bg-purple-600 py-3 text-white font-semibold hover:bg-purple-700 transition disabled:opacity-60"
            >
              {loading ? "Signing up..." : "Verify & Signup"}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-purple-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
