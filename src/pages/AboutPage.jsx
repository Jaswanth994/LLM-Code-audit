import React from 'react';
import Header from '../components/Header';

const AboutPage = ({ user }) => {
  return (
    <div style={{ backgroundColor: '#0f0f13', minHeight: '100vh',margin: '-8px', color: '#e0e0e0' }}>
      <Header user={user} />
      <main style={{ 
        padding: '2rem',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <h2 style={{ 
          color: '#7b81ff',
          fontSize: '2rem',
          borderBottom: '1px solid #2a2a3a',
          paddingBottom: '1rem',
          marginBottom: '2rem'
        }}>
          About LLM Code Audit
        </h2>
        
        <div style={{
          backgroundColor: '#1a1a24',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem',
          borderLeft: '4px solid #7b81ff'
        }}>
          <h3 style={{ color: '#7b81ff', marginTop: 0 }}>Our Mission</h3>
          <p>
            In the era of AI-generated code, developers often copy code from LLMs without proper quality checks, 
            leading to high technical debt. LLM Code Audit provides a standardized, automated approach to evaluate 
            and compare code quality across multiple large language models.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            backgroundColor: '#1a1a24',
            borderRadius: '8px',
            padding: '1.5rem',
            borderLeft: '4px solid #7b81ff'
          }}>
            <h3 style={{ color: '#7b81ff' }}>The Problem</h3>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Current tools focus only on correctness</li>
              <li>Manual reviews are slow and inconsistent</li>
              <li>No system compares code from multiple LLMs</li>
              <li>AI-specific gaps in code evaluation</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: '#1a1a24',
            borderRadius: '8px',
            padding: '1.5rem',
            borderLeft: '4px solid #7b81ff'
          }}>
            <h3 style={{ color: '#7b81ff' }}>Our Solution</h3>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Multi-LLM code generation and analysis</li>
              <li>Automated quality metrics (ACI, AMR)</li>
              <li>Comprehensive technical debt scoring</li>
              <li>Ranking based on readability and complexity</li>
            </ul>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1a1a24',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#7b81ff', marginTop: 0 }}>Technical Details</h3>
          <p>
            We integrate with ChatGPT, Gemini, and DeepSeek APIs, using SonarQube metrics combined with our 
            custom AI-specific metrics:
          </p>
          <div style={{
            backgroundColor: '#252534',
            borderRadius: '6px',
            padding: '1rem',
            margin: '1rem 0',
            fontFamily: "'Fira Code', monospace",
            color: '#7b81ff'
          }}>
            <p><strong>ACI</strong> = (0.5 × Cognitive Complexity) + (0.3 × Method Length) + (0.2 × Nesting Level)</p>
            <p><strong>AMR</strong> = (0.4 × Code Smells per 100 LOC) + (0.4 × Duplication Density %) + (0.2 × % of Methods without Comments)</p>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(123, 129, 255, 0.1), rgba(197, 138, 255, 0.1))',
          borderRadius: '14px',
          padding: '2rem',
          border: '1px dashed #7b81ff',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#c58aff' }}>Future Roadmap</h3>
          <p>
            We're expanding to include Claude, Code Llama, and StarCoder LLMs, with additional metrics for 
            AI Readability Score, Dependency Risk, and Redundancy Factor.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;