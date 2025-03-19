// src/components/CodeInput.jsx
import { useState } from "react";

const CodeInput = ({ onAnalyze }) => {
  const [codes, setCodes] = useState(["", "", "", ""]);

  const handleChange = (index, value) => {
    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (codes.some((code) => code.trim())) {
      onAnalyze(codes);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Analyze Code for Technical Debt</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {codes.map((code, index) => (
          <div key={index}>
            <h3 className="text-lg font-semibold mb-2">{`Code ${index + 1}`}</h3>
            <textarea
              value={code}
              onChange={(e) => handleChange(index, e.target.value)}
              rows="5"
              placeholder={`Paste code ${index + 1} here...`}
              className="p-2 border rounded w-full"
            />
          </div>
        ))}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Analyze
        </button>
      </form>
    </div>
  );
};

export default CodeInput;
