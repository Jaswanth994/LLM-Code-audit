const AboutUs = () => {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-center text-gray-800 mb-8">
            About Our Project
          </h1>
          <p className="text-lg text-gray-700 text-center mb-12">
            Welcome to our Code Quality & Security Comparison Tool! We aim to provide developers with an in-depth analysis of LLM-generated code, ensuring high-quality, maintainable, and secure software development.
          </p>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Code Quality Section */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Code Quality</h2>
              <p className="text-gray-600">
                Evaluate technical debt, maintainability, and best practices in your code.
              </p>
            </div>
  
            {/* Security Checks Section */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Security Checks</h2>
              <p className="text-gray-600">
                Detect vulnerabilities like XSS, SQL injection, and hardcoded secrets.
              </p>
            </div>
  
            {/* LLM Comparison Section */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">LLM Comparison</h2>
              <p className="text-gray-600">
                Compare GPT-4, Claude, and Gemini on code quality & security.
              </p>
            </div>
          </div>
  
          {/* Learn More Button */}
          <div className="text-center mt-12">
            <button className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300 text-lg font-semibold">
              Learn More
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default AboutUs;