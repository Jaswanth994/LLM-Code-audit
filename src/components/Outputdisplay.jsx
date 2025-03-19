// src/components/OutputDisplay.jsx
const OutputDisplay = ({ results, loading }) => {
    return (
      <div className="p-4 border rounded-lg mt-4">
        <h2 className="text-xl font-bold mb-2">Analysis Results</h2>
        {loading ? (
          <p className="text-gray-500">Analyzing code...</p>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className={`p-3 mt-2 rounded ${
                result.feedback.startsWith("🏆") ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <h3 className="font-semibold">{`Code ${index + 1}`}</h3>
              <p>{result.feedback}</p>
              <p className="font-bold">Score: {result.score}/100</p>
            </div>
          ))
        )}
      </div>
    );
  };
  
  export default OutputDisplay;
  