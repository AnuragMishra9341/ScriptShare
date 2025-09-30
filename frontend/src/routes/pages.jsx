import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../screens/Login.jsx";
import SignUp from "../screens/SignUp.jsx"
import Dashboard from "../screens/Dashboard.jsx";
import ProtectedRoute from "../screens/ProtectedRoute.jsx";

const Pages = () => {
  return (
   <Routes>
    
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
   </Routes>
  )
}

export default Pages