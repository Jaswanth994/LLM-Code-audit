import React from "react";
import "./AboutUs.css"; // ✅ Import the new CSS file

const AboutUs = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="title">About Our Project</h1>
        <p className="description">
          Welcome to our <span className="highlight">Code Quality & Security Comparison Tool</span>!
          Our platform enables developers to analyze LLM-generated code, ensuring high-quality,
          maintainable, and secure software development. We help identify the best AI-generated code
          by evaluating key software engineering factors.
        </p>
        
        <h2 className="subtitle">Key Evaluation Factors</h2>
        <ul className="evaluation-list">
          <li>
            <strong>Technical Debt:</strong> Assesses code complexity, maintainability, readability, and duplication.
          </li>
          <li>
            <strong>Security Vulnerabilities:</strong> Detects issues such as SQL injection, XSS, and hardcoded secrets.
          </li>
          <li>
            <strong>Best Practices Compliance:</strong> Ensures the generated code follows industry standards.
          </li>
          <li>
            <strong>LLM Performance Comparison:</strong> Benchmarks different LLMs like GPT-4, Claude, and Gemini.
          </li>
        </ul>

        <h2 className="subtitle">How We Choose the Best Code</h2>
        <p className="description">
          Our tool performs an in-depth analysis using state-of-the-art static code analysis tools
          like SonarQube, Semgrep, and Bandit. We rank each code sample based on:
        </p>
        <ol className="ranking-list">
          <li>
            Security score (60% weightage): Identifies and mitigates security risks.
          </li>
          <li>
            Maintainability score (30% weightage): Measures readability, modularity, and best practices.
          </li>
          <li>
            Performance score (10% weightage): Evaluates efficiency and optimization.
          </li>
        </ol>
        
        <p className="description">
          By aggregating these metrics, our system selects the code with the least technical debt,
          making it the most reliable and secure choice for developers.
        </p>

        <div className="features">
          <div className="feature-card">
            <h3>Code Quality</h3>
            <p>Evaluate technical debt, maintainability, and best practices.</p>
          </div>
          <div className="feature-card">
            <h3>Security Checks</h3>
            <p>Detect vulnerabilities like XSS, SQL injection, and hardcoded secrets.</p>
          </div>
          <div className="feature-card">
            <h3>LLM Comparison</h3>
            <p>Compare GPT-4, Claude, and Gemini on code quality & security.</p>
          </div>
        </div>
        
        <div className="button-container">
          <button className="learn-more">Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
