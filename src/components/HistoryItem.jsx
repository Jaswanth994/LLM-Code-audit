import React from "react";

const HistoryItem = ({ item, isSelected, onClick }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid date';
    }
  };

  return (
    <div 
      className={`history-item ${isSelected ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="history-item-prompt">
        {item.prompt.substring(0, 60)}{item.prompt.length > 60 ? '...' : ''}
      </div>
      <div className="history-item-meta">
        <span className="history-item-date">
          {formatDate(item.timestamp || item.createdAt)}
        </span>
        {item.analysis?.bestModel && (
          <span className="best-model-tag">
            {item.analysis.bestModel.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
};

export default HistoryItem;