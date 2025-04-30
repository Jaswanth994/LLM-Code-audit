import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useParams } from 'react-router-dom';
import ResultsDisplay from '../components/ResultsDisplay';
import '../styles/ComparisonDetail.css';

const analyzeCode = (code) => {
  if (!code || typeof code !== 'string' || !code.trim()) {
    return {
      readability: 0,
      complexity: 0,
      technicalDebt: 0,
      maintainability: 0,
      issues: []
    };
  }

  const lines = code.split('\n').length;
  const charCount = code.length;
  const commentCount = (code.match(/\/\/|\/\*|\*\//g) || []).length;
  
  const readability = Math.min(100, Math.max(0, 
    80 - (lines / 50) - (charCount / lines / 100) + (commentCount * 2))
  );
  
  const complexity = Math.min(100, Math.max(0, 
    (lines / 20) + (code.match(/\bif\b|\bfor\b|\bwhile\b/g) || []).length * 5
  ));
  
  const technicalDebt = Math.min(100, Math.max(0, 
    complexity * 0.7 - readability * 0.3
  ));
  
  const maintainability = Math.min(100, Math.max(0,
    100 - (complexity * 0.3) - (technicalDebt * 0.2) - (lines / 50))
  );
  
  const issues = [];
  if (lines > 100) issues.push("Long method/function");
  if (complexity > 70) issues.push("High complexity");
  if (readability < 50) issues.push("Low readability");
  
  return {
    readability: Math.round(readability),
    complexity: Math.round(complexity),
    technicalDebt: Math.round(technicalDebt),
    maintainability: Math.round(maintainability),
    issues
  };
};

const ComparisonDetail = () => {
  const { comparisonId } = useParams();
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadComparison = async () => {
      try {
        const docRef = doc(db, "comparisons", comparisonId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const transformedCodes = {};

          // Process all code entries
          for (const [model, code] of Object.entries(data.codes)) {
            transformedCodes[model] = {
              code: typeof code === 'string' ? code : code.code,
              ...(typeof code === 'string' ? analyzeCode(code) : code)
            };
          }

          setComparison({
            id: docSnap.id,
            ...data,
            codes: transformedCodes,
            analysis: data.analysis || {}
          });
        } else {
          setError('Comparison not found');
        }
      } catch (error) {
        console.error("Error loading comparison:", error);
        setError('Failed to load comparison');
      } finally {
        setLoading(false);
      }
    };

    loadComparison();
  }, [comparisonId]);

  if (loading) {
    return <div className="loading">Loading comparison...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!comparison) {
    return <div className="not-found">Comparison data unavailable</div>;
  }

  // Prepare display data
  const selectedModels = comparison.models.reduce((acc, model) => {
    acc[model] = true;
    return acc;
  }, {});

  const responses = Object.entries(comparison.codes).reduce((acc, [model, data]) => {
    acc[model] = data.code;
    return acc;
  }, {});

  return (
    <div className="comparison-detail-container">
      <h1>Comparison Details</h1>
      
      <div className="metadata-section">
        <div className="original-prompt">
          <h3>Original Prompt</h3>
          <p>{comparison.prompt}</p>
        </div>

        {comparison.codes.user && (
          <div className="user-code-section">
            <h3>User's Custom Code</h3>
            <pre className="user-code">
              {comparison.codes.user.code}
            </pre>
          </div>
        )}
      </div>

      <ResultsDisplay 
        responses={responses}
        selectedModels={selectedModels}
        analysis={comparison.analysis}
      />
    </div>
  );
};

export default ComparisonDetail;