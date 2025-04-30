import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import AboutPage from './pages/AboutPage'; // Added AboutPage
import History from './pages/HistoryPage'; // Added History page
import { auth } from './firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles/styles.css';
import HistoryPage from './pages/HistoryPage';
import ComparisonDetail from './pages/ComparisonDetail';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/about" element={<AboutPage user={user} />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/dashboard" />} />
        <Route path="/history" element={ user ? <History /> : <Navigate to="/history" />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/comparison/:comparisonId" element={<ComparisonDetail />} />
        
      </Routes>
    </Router>
  );
}

export default App;
