import React from 'react'
import Pages from './routes/pages.jsx'
import { UserProvider } from "./context/Usercontext.jsx";
import { BrowserRouter as Router } from "react-router-dom";
const App = () => {
  return (
    <UserProvider>
      <Router>
      <Pages/>
      </Router>
     
    </UserProvider>
  )
}

export default App