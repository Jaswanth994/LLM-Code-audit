import { useEffect, useState, useCallback } from "react";
import { loadPyodide } from "pyodide";

export default function usePyodide() {
  const [pyodide] = useState(null);
  const [pyodideLoaded] = useState(false);

  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       const py = await loadPyodide({
  //         indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
  //       });
  //       setPyodide(py);
  //       setPyodideLoaded(true);
  //       console.log("✅ Pyodide loaded");
  //     } catch (err) {
  //       console.error("❌ Pyodide failed to load", err);
  //     }
  //   };

  //   init();
  // }, []);

  useEffect(() => {
    const initPyodide = async () => {
      const pyodideScript = document.createElement("script");
      pyodideScript.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
      pyodideScript.onload = async () => {
        window.pyodide = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
        });
      };
      document.body.appendChild(pyodideScript);
    };
    initPyodide();
  }, []);
  
  const analyzePythonCode = useCallback(
    async (code) => {
      if (!pyodide) return ["❌ Pyodide not loaded"];
      
      try {
        const sanitized = code
          .replace(/\\/g, "\\\\")
          .replace(/"""/g, '\\"\\"\\"')
          .replace(/`/g, "\\`")
          .replace(/\$/g, "\\$");

        const script = `
import ast

code = """${sanitized}"""

try:
    tree = ast.parse(code)
    issues = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            if not ast.get_docstring(node):
                issues.append(f"Function '{node.name}' is missing a docstring at line {node.lineno}")
            if len(node.body) > 20:
                issues.append(f"Function '{node.name}' is too long ({len(node.body)} lines)")

    for i, line in enumerate(code.splitlines()):
        if len(line) > 80:
            issues.append(f"Line {i+1} is too long ({len(line)} characters)")

except Exception as e:
    issues = [f"Error during analysis: {e}"]

issues
        `;

        const result = await pyodide.runPythonAsync(script);
        return result.toJs ? result.toJs() : result;
      } catch (err) {
        return [`❌ Error analyzing code: ${err.message}`];
      }
    },
    [pyodide]
  );

  return { analyzePythonCode, pyodideLoaded };
}
