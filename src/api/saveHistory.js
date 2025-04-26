export async function saveSearchHistory(userId, prompt) {
    try {
      const response = await fetch('http://localhost:5000/api/save-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, prompt })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save history');
      }
  
      return data;
    } catch (error) {
      console.error("Save History Error:", error.message);
      throw error;
    }
  }
  