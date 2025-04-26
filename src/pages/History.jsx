// src/pages/HistoryPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig"; // Firebase auth
import { useAuthState } from 'react-firebase-hooks/auth';

const HistoryPage = () => {
  const [user] = useAuthState(auth); // Get current user from Firebase
  const [history, setHistory] = useState([]); // Store history data
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/"); // Redirect to login if the user is not authenticated
    } else {
      fetchHistory(); // Fetch history if the user is logged in
    }
  }, [user, navigate]);

  const fetchHistory = async () => {
    try {
      const token = await user.getIdToken(); // Get the Firebase ID token for authentication
      const response = await fetch('/api/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data); // Set history data in the state
      } else {
        console.error("Failed to fetch history:", await response.json());
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  return (
    <div className="history-page">
      <h1>Your Search History</h1>
      {history.length === 0 ? (
        <p>No history found.</p>
      ) : (
        <ul>
          {history.map((entry, index) => (
            <li key={index} className="history-entry">
              <h3>Query: {entry.query}</h3>
              <pre>{entry.generatedCode}</pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPage;
