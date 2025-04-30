import React, { useEffect, useState } from 'react';
import { getUserComparisons } from '../firestoreService';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import '../styles/HistoryPage.css';
import Header from '../components/Header';
import HistoryItem from '../components/HistoryItem';

const HistoryPage = () => {
  const [user] = useAuthState(auth);
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        try {
          const history = await getUserComparisons(user.uid);
          setComparisons(history);
          if (history.length > 0) {
            setSelectedComparison(history[0]);
          }
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

  const handleViewComparison = (comparison) => {
    setSelectedComparison(comparison);
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  return (
    <div className="history-page-container">
      <Header user={user} />
      <div className="history-layout">
        <div className="history-sidebar">
          <h2>Your Comparisons</h2>
          {comparisons.length === 0 ? (
            <p className="no-history">No comparison history found.</p>
          ) : (
            <div className="history-list">
              {comparisons.map(comparison => (
                <HistoryItem 
                  key={comparison.id}
                  item={comparison}
                  isSelected={selectedComparison?.id === comparison.id}
                  onClick={() => handleViewComparison(comparison)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="history-detail">
          {selectedComparison ? (
            <div className="comparison-detail-card">
              <h2 className="detail-title">Comparison Details</h2>
              
              <div className="info-box prompt-box">
                <h3 className="info-label">Prompt</h3>
                <p className="info-content">{selectedComparison.prompt}</p>
              </div>
              
              <div className="info-box models-box">
                <h3 className="info-label">Models Compared</h3>
                <div className="models-container">
                  {selectedComparison.models.map(model => (
                    <span key={model} className="model-tag">
                      {model.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedComparison.analysis?.bestModel && (
                <div className="info-box best-model-box">
                  <h3 className="info-label">Best Model</h3>
                  <p className="best-model">{selectedComparison.analysis.bestModel.toUpperCase()}</p>
                </div>
              )}
              
              <div className="info-box date-box">
                <h3 className="info-label">Date</h3>
                <p className="info-content">{formatDate(selectedComparison.timestamp)}</p>
              </div>
              
              <button 
                onClick={() => navigate(`/comparison/${selectedComparison.id}`)}
                className="view-comparison-btn"
              >
                View Full Comparison
              </button>
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a comparison from the sidebar to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;