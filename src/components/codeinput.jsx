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

  const addNewCodeInput = () => {
    setCodes([...codes, { llm: "New LLM", code: "" }]);
  };

  const handleFileUpload = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newCodes = [...codes];
        newCodes[index].code = e.target.result;
        setCodes(newCodes);
      };
      reader.readAsText(file);
    }
  };

  const deleteCodeInput = (index) => {
    const newCodes = codes.filter((_, i) => i !== index);
    setCodes(newCodes);
  };

  return (
    <div className="code-input-section min-h-screen flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Analyze Code from Multiple LLMs</h2>
        <div className="flex flex-col gap-8">
          {codes.map((item, index) => (
            <div
              key={index}
              className="code-input-box p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg hover:shadow-xl transition duration-300 relative"
            >
              {/* Delete Button (Cross Mark) */}
              <button
                onClick={() => deleteCodeInput(index)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition duration-300"
              >
                &times;
              </button>

              <h3 className="text-xl font-semibold mb-4 text-gray-800">Code from {item.llm}</h3>
              <input
                type="text"
                value={item.llm}
                onChange={(e) => handleLLMChange(index, e.target.value)}
                placeholder="Enter LLM name"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="relative">
                <textarea
                  value={item.code}
                  onChange={(e) => handleChange(index, e.target.value)}
                  rows="10"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-10 bg-transparent"
                />
                {!item.code && (
                  <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
                    <p className="text-gray-400 opacity-50">Paste your code here</p>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, index)}
                  className="hidden"
                  id={`file-upload-${index}`}
                />
                <label
                  htmlFor={`file-upload-${index}`}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-blue-600 transition duration-300"
                >
                  Upload File
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Centered Analyze All Button */}
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-blue-600 text-white py-4 px-16 rounded-lg hover:bg-blue-700 transition duration-300 text-3xl font-semibold"
        >
          Analyze All
        </button>
      </div>
      {/* Plus Button to Add New Code Input */}
      <button
        onClick={addNewCodeInput}
        className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition duration-300"
        style={{ fontSize: '2rem' }}
      >
        +
      </button>
    </div>
  );
};

export default CodeInput;