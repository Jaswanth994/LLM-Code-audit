import React from "react";
import { Link } from "react-router-dom";
import "../styles/styles.css";

function Header() {
  return (
    <nav className="navbar">
      <h1>LLM Analysis Tool</h1>
      <div>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/">Logout</Link>
      </div>
    </nav>
  );
}

export default Header;
