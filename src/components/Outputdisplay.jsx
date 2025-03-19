const OutputDisplay = ({ results, loading, onClose }) => {
  return (
    <div className="results slide-in">
      <button
        onClick={onClose}
        className="close-button absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
      >
        &times;
      </button>
      <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
      {loading ? (
        <p className="text-gray-500">Analyzing code...</p>
      ) : (
        results.map((result, index) => (
          <div
            key={index}
            className={`p-4 mt-2 rounded-lg ${
              result.feedback.startsWith("🏆")
                ? "bg-green-100 border-l-4 border-green-500"
                : "bg-gray-100 border-l-4 border-gray-500"
            }`}
          >
            <h3 className="font-semibold">Code {index + 1}</h3>
            <p>{result.feedback}</p>
            <p className="font-bold">Score: {result.score}/100</p>
          </div>
        ))
      )}
    </div>
  );
};

export default OutputDisplay;