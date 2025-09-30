import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext  from "../context/Usercontext.jsx";


export const useAuthCheck = () => {
  const navigate = useNavigate();
  const { user,setUser } = useContext(UserContext);

  useEffect(() => {
  const tokenExists = document.cookie.includes("token=");
  if (tokenExists) {
    // optionally fetch user info from backend
    setUser({ loggedIn: true });
  } else {
    setUser(null);
    navigate("/login");
  }
}, [navigate]);
};



