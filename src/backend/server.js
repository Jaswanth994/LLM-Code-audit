// backend/routes/history.js
import express from 'express';
import History from './models/History.js'; // Use ES module import for models

const router = express.Router();

// Save search history
router.post('/', verifyToken, async (req, res) => {
  const { query, generatedCode } = req.body; // Extract query and generated code from request body 
  const userId = req.user.id; // Get the user's ID from the JWT token

  try {
    const historyEntry = new History({
      userId,
      query,
      generatedCode,
    });

    await historyEntry.save(); // Save the entry to MongoDB
    res.status(200).json({ message: 'History saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save history' });
  }
});

export default router; // Export the router as default
