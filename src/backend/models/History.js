import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who made the query
  query: { type: String, required: true }, // User's search query
  generatedCode: { type: String, required: true }, // Generated code
  createdAt: { type: Date, default: Date.now }, // Timestamp when history was created
});

const History = mongoose.model('History', historySchema);

export default History;
