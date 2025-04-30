import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useParams, useNavigate } from 'react-router-dom';
import ResultsDisplay from '../components/ResultsDisplay';
import '../styles/ComparisonDetail.css';

const ComparisonDetail = () => {
  const { comparisonId } = useParams();
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadComparison = async () => {
      try {
        const docRef = doc(db, "comparisons", comparisonId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Transform the codes data to ensure consistent format
          const transformedCodes = {};
          Object.keys(data.codes).forEach(model => {
            // If code is stored as object, use it directly
            if (typeof data.codes[model] === 'object') {
              transformedCodes[model] = data.codes[model];
            } 
            // If code is stored as string, convert to object format
            else {
              transformedCodes[model] = {
                code: data.codes[model],
                readability: 0,
                complexity: 0,
                technicalDebt: 0,
                maintainability: 0,
                issues: []
              };
            }
          });

          setComparison({
            id: docSnap.id,
            ...data,
            codes: transformedCodes
          });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error loading comparison:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComparison();
  }, [comparisonId]);

  if (loading) {
    return <div className="loading">Loading comparison...</div>;
  }

  if (!comparison) {
    return <div className="not-found">Comparison not found</div>;
  }

  // Prepare selectedModels object for ResultsDisplay
  const selectedModels = {};
  comparison.models.forEach(model => {
    selectedModels[model] = true;
  });

  return (
    <div className="comparison-detail-container">
      <div className="header-section">
        <button onClick={() => navigate('/history')} className="back-button">
          ← Back to History
        </button>
        <h1>Comparison Details</h1>
      </div>
      
      <p className="original-prompt">{comparison.prompt}</p>
      
      <ResultsDisplay 
        responses={comparison.codes}
        selectedModels={selectedModels}
        analysis={comparison.analysis}
      />
    </div>
  );
};

export default ComparisonDetail;