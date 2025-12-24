import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/users/forgot-password", { email });
      setStep(2);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.patch("/users/update-password", {
        email,
        otp,
        password:newPassword,
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          Forgot Password
        </h2>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        {step === 1 && (
          <form onSubmit={sendOTP} className="space-y-4">
            <input
              type="email"
              placeholder="Registered Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded"
            />
            <button className="w-full bg-purple-500 text-white py-3 rounded">
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={updatePassword} className="space-y-4">
            <input
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-3 rounded"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border p-3 rounded"
            />
            <button className="w-full bg-purple-500 text-white py-3 rounded">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
