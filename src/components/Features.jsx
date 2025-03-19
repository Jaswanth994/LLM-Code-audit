const Features = () => {
    const features = [
      {
        title: "Publish to the web",
        description: "Create a website for the next year with ease.",
      },
      {
        title: "Web Interface",
        description: "Build a user-friendly web interface for your projects.",
      },
      {
        title: "Email Integration",
        description: "Set up email addresses and communication channels.",
      },
    ];
  
    return (
      <div className="features">
        <h2>Key Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default Features;