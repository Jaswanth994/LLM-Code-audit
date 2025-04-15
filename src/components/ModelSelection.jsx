// src/components/ModelSelection.jsx
import React from 'react';
import '../styles/ModelSelection.css';

const ModelSelection = ({ selectedModels, setSelectedModels }) => {
  return (
    <div className="model-selection-container">
      <h3>Select Models to Compare:</h3>
      <div className="model-grid">
        {Object.entries(selectedModels).map(([model, isSelected]) => (
          <div 
            key={model}
            className={`model-card ${isSelected ? 'selected' : ''}`}
            onClick={() => setSelectedModels(prev => ({
              ...prev,
              [model]: !prev[model]
            }))}
          >
            <div className="model-checkbox">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
              />
            </div>
            <div className="model-name">
              {model.charAt(0).toUpperCase() + model.slice(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelSelection;