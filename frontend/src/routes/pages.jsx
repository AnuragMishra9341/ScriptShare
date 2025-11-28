import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../screens/Login.jsx";
import SignUp from "../screens/SignUp.jsx"
import Dashboard from "../screens/Dashboard.jsx";
import ProtectedRoute from "../screens/ProtectedRoute.jsx";
import ChatPage from "../screens/ChatPage.jsx";
import Home from "../screens/Home.jsx";
const Pages = () => {
  return (
   <Routes>
     <Route path="/" element={<Home/>} />
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

     <Route
      path="/projects/:projectId/chat"
      element={
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      }
    />

   </Routes>

   

  )
}

export default Pages