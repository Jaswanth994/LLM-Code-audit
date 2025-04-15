// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import { auth } from './firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles/styles.css';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/auth" 
          element={!user ? <AuthPage /> : <Navigate to="/dashboard" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;