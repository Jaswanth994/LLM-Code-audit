import React from 'react';
import Header from '../components/Header';

const AboutPage = ({ user }) => {
  return (
    <div>
      <Header user={user} />
      <main style={{ padding: '2rem' }}>
        <h2>About LLM Code Audit</h2>
        <p>This tool helps you analyze and compare the outputs of different large language models (LLMs) for the same code prompt.</p>
      </main>
    </div>
  );
};

export default AboutPage;
