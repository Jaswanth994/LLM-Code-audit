const OutputDisplay = ({ results, loading, onClose }) => {
  return (
    <div className="results slide-in">
      <button onClick={onClose} className="close-button">
        &times;
      </button>
      <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
      {loading ? (
        <p className="text-gray-500">Analyzing code...</p>
      ) : (
        results.map((result, index) => (
          <div key={index} className="result-item">
            <h3>Code from {result.llm}</h3>
            <p>Detected Language: {result.language}</p> {/* Display detected language */}
            <p>Lines of Code: {result.linesOfCode}</p>
            <p>Readability Score: {result.readabilityScore}/100</p>
            <p>Technical Debt: {result.technicalDebtScore}%</p>
            <p>Security Vulnerability: {result.securityScore}%</p>
            <p>{result.feedback}</p>
          </div>
        ))
      )}
    </div>
  );
};
export default OutputDisplay;