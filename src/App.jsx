// src/App.jsx
import { useState } from "react";
import CodeInput from "./components/CodeInput";
import OutputDisplay from "./components/OutputDisplay";
import Header from "./components/Header";

const App = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyzeCode = (codes) => {
    setLoading(true);

    setTimeout(() => {
      const analysisResults = codes.map((code, index) => {
        if (!code.trim()) return { score: 0, feedback: "Empty code." };

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
            i > 0 &&
            line.startsWith(" ") &&
            lines[i - 1].startsWith("\t")
        );
        if (inconsistentIndentation) {
          score -= 10;
          feedback += `⚠️ Inconsistent indentation detected.\n`;
        } else {
          feedback += `✅ Indentation is consistent.\n`;
        }

        return { score, feedback };
      });

      // Find the highest score
      const bestIndex = analysisResults.reduce(
        (best, curr, index) =>
          curr.score > analysisResults[best].score ? index : best,
        0
      );

      // Mark the best code snippet
      analysisResults[bestIndex].feedback =
        "🏆 Best Code! 🎯\n" + analysisResults[bestIndex].feedback;

      setResults(analysisResults);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Header />
      <CodeInput onAnalyze={analyzeCode} />
      <OutputDisplay results={results} loading={loading} />
    </div>
  );
};

export default App;
