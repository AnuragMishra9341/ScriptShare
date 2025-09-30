// src/context/UserContext.jsx
import React, { createContext, useState } from "react";

// Create context object
export const UserContext = createContext();

// Provider component to wrap your app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
