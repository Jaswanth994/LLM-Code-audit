import React, { useEffect, useState } from 'react';
import { getUserComparisons } from '../firestoreService';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import '../styles/HistoryPage.css';
import Header from '../components/Header';

const HistoryPage = () => {
  const [user] = useAuthState(auth);
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        try {
          const history = await getUserComparisons(user.uid);
          setComparisons(history);
        } catch (error) {
          console.error("Error loading history:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadHistory();
  }, [user]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  const handleViewComparison = (comparisonId) => {
    navigate(`/comparison/${comparisonId}`);
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  return (
    <div className="history-container">
      <Header user={user} />
      <h1>Your Comparison History</h1>
      
      {comparisons.length === 0 ? (
        <p className="no-history">No comparison history found.</p>
      ) : (
        <div className="comparison-list">
          {comparisons.map(comparison => (
            <div key={comparison.id} className="comparison-card">
              <div className="comparison-header">
                <h3>{comparison.prompt.substring(0, 100)}{comparison.prompt.length > 100 ? '...' : ''}</h3>
                <span className="comparison-date">{formatDate(comparison.timestamp)}</span>
              </div>
              
              <div className="comparison-meta">
                <span>Models: {comparison.models.join(', ')}</span>
                {comparison.analysis?.bestModel && (
                  <span className="best-model-tag">
                    Best: {comparison.analysis.bestModel.toUpperCase()}
                  </span>
                )}
              </div>
              
              <button 
                onClick={() => handleViewComparison(comparison.id)}
                className="view-comparison-btn"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;