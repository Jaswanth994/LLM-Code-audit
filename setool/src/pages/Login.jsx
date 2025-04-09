import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email === "a@email.com" && password === "password") {
      navigate("/dashboard");
    } else {
      alert("Invalid login credentials");
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome Back</h2>
      <input type="email" placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
