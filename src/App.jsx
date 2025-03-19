import { useState } from "react";
import Navbar from "./components/Navbar";
import CodeInput from "./components/CodeInput";
import OutputDisplay from "./components/OutputDisplay";

const App = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const analyzeCode = (codes) => {
    setLoading(true);
    setShowResults(false); // Hide results before starting analysis

    setTimeout(() => {
      const analysisResults = codes.map((item, index) => {
        const code = item.code;
        if (!code.trim()) return { llm: item.llm, score: 0, feedback: "Empty code." };

        let score = 100;
        let feedback = "";

        // 🚨 Metric 1: Code size
        const lineCount = code.split("\n").length;
        if (lineCount > 30) {
          score -= 20;
          feedback += `⚠️ Too many lines (${lineCount}). Consider refactoring.\n`;
        } else {
          feedback += `✅ Code length is manageable (${lineCount} lines).\n`;
        }

        // 🚨 Metric 2: Complexity (nested if-else)
        const complexity = (code.match(/if/g) || []).length;
        if (complexity > 5) {
          score -= 15;
          feedback += `⚠️ High complexity due to ${complexity} 'if' statements.\n`;
        } else {
          feedback += `✅ Complexity is within acceptable range.\n`;
        }

        // 🚨 Metric 3: Bad practices (goto statements)
        if (code.includes("goto")) {
          score -= 25;
          feedback += `⚠️ 'goto' statements increase technical debt.\n`;
        }

        // 🚨 Metric 4: Readability (indentation consistency)
        const lines = code.split("\n");
        const inconsistentIndentation = lines.some(
          (line, i) =>
            i > 0 && line.startsWith(" ") && lines[i - 1].startsWith("\t")
        );
        if (inconsistentIndentation) {
          score -= 10;
          feedback += `⚠️ Inconsistent indentation detected.\n`;
        } else {
          feedback += `✅ Indentation is consistent.\n`;
        }

        return { llm: item.llm, score, feedback };
      });

      setResults(analysisResults);
      setLoading(false);
      setShowResults(true); // Show results after analysis is done
    }, 1000);
  };

  const handleCloseResults = () => {
    setShowResults(false); // Hide results section
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-4">
        <CodeInput onAnalyze={analyzeCode} />
      </div>
      {showResults && (
        <OutputDisplay results={results} loading={loading} onClose={handleCloseResults} />
      )}
    </div>
  );
};

export default App;