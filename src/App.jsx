import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Import routing components
import Navbar from "./components/Navbar";
import CodeInput from "./components/codeinput";
import OutputDisplay from "./components/Outputdisplay";
import AboutUs from "./components/AboutUs"; // Import the AboutUs component

const App = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const analyzeCode = (codes) => {
    setLoading(true);
    setShowResults(false); // Hide results before starting analysis

    setTimeout(() => {
      const analysisResults = codes.map((item) => {
        const code = item.code;
        if (!code.trim()) return { llm: item.llm, language: "Unknown", linesOfCode: 0, readabilityScore: 0, technicalDebtScore: 0, securityScore: 0, feedback: "Empty code." };

        let readabilityScore = 100;
        let technicalDebtScore = 100;
        let securityScore = 100;
        let feedback = "";

        // 🚨 Metric 1: Code size
        const lineCount = code.split("\n").length;
        if (lineCount > 30) {
          technicalDebtScore -= 20;
          feedback += `⚠️ Too many lines (${lineCount}). Consider refactoring.\n`;
        } else {
          feedback += `✅ Code length is manageable (${lineCount} lines).\n`;
        }

        // 🚨 Metric 2: Complexity (nested if-else)
        const complexity = (code.match(/if/g) || []).length;
        if (complexity > 5) {
          technicalDebtScore -= 15;
          feedback += `⚠️ High complexity due to ${complexity} 'if' statements.\n`;
        } else {
          feedback += `✅ Complexity is within acceptable range.\n`;
        }

        // 🚨 Metric 3: Bad practices (goto statements)
        if (code.includes("goto")) {
          technicalDebtScore -= 25;
          feedback += `⚠️ 'goto' statements increase technical debt.\n`;
        }

        // 🚨 Metric 4: Readability (indentation consistency)
        const lines = code.split("\n");
        const inconsistentIndentation = lines.some(
          (line, i) =>
            i > 0 && line.startsWith(" ") && lines[i - 1].startsWith("\t")
        );
        if (inconsistentIndentation) {
          readabilityScore -= 10;
          feedback += `⚠️ Inconsistent indentation detected.\n`;
        } else {
          feedback += `✅ Indentation is consistent.\n`;
        }

        return { 
          llm: item.llm, 
          language: "JavaScript", // Assuming the language is JavaScript for this example
          linesOfCode: lineCount, 
          readabilityScore, 
          technicalDebtScore, 
          securityScore, 
          feedback 
        };
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
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <>
                <div className="max-w-4xl mx-auto p-4">
                  <CodeInput onAnalyze={analyzeCode} />
                </div>
                {showResults && (
                  <OutputDisplay results={results} loading={loading} onClose={handleCloseResults} />
                )}
              </>
            }
          />
          {/* About Us Route */}
          <Route path="/about" element={<AboutUs />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;