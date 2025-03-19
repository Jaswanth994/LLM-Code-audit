import { useState } from "react";

const CodeInput = ({ onAnalyze }) => {
  const [codes, setCodes] = useState([
    { llm: "GPT-4", code: "" },
    { llm: "Bard", code: "" },
    { llm: "Claude", code: "" },
    { llm: "LLaMA", code: "" },
    { llm: "Cohere", code: "" },
  ]);

  const handleChange = (index, value) => {
    const newCodes = [...codes];
    newCodes[index].code = value;
    setCodes(newCodes);
  };

  const handleLLMChange = (index, value) => {
    const newCodes = [...codes];
    newCodes[index].llm = value;
    setCodes(newCodes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (codes.some((item) => item.code.trim())) {
      onAnalyze(codes);
    }
  };

  return (
    <div className="code-input-section min-h-screen flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Analyze Code from Multiple LLMs</h2>
        <div className="flex flex-col gap-8">
          {codes.map((item, index) => (
            <div
              key={index}
              className="code-input-box p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg hover:shadow-xl transition duration-300"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Code from {item.llm}</h3>
              <input
                type="text"
                value={item.llm}
                onChange={(e) => handleLLMChange(index, e.target.value)}
                placeholder="Enter LLM name"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={item.code}
                onChange={(e) => handleChange(index, e.target.value)}
                rows="10"
                placeholder={`Paste code from ${item.llm} here...`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Centered Analyze All Button */}
      <div className="mt-8">
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-blue-600 text-white py-4 px-16 rounded-lg hover:bg-blue-700 transition duration-300 text-3xl font-semibold"
        >
          Analyze All
        </button>
      </div>
    </div>
  );
};

export default CodeInput;