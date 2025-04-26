import React from "react";

const HistoryItem = ({ item }) => {
  return (
    <div className="border p-4 mb-4 rounded-lg shadow-sm">
      <p className="font-semibold">Prompt: {item.prompt}</p>
      <p className="text-sm text-gray-500">Date: {new Date(item.createdAt).toLocaleString()}</p>

      {item.outputs.map((output, index) => (
        <div key={index} className="mt-4">
          <h3 className="text-lg font-semibold">{output.modelName}</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{output.code}</pre>
          <p>Lines of Code: {output.metrics.linesOfCode}</p>
          <p>Cyclomatic Complexity: {output.metrics.cyclomaticComplexity}</p>
        </div>
      ))}
    </div>
  );
};

export default HistoryItem;
