import { db } from "./firebaseConfig";
import { collection, addDoc, query, where, orderBy, getDocs } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

// Save a comparison to Firestore
export const saveComparison = async (userId, prompt, responses, analysis, selectedModels) => {
  try {
    // Transform responses into a more structured format
    const codes = {};
    Object.keys(responses).forEach(model => {
      if (responses[model]) {
        codes[model] = {
          code: responses[model],
          ...(analysis && analysis[model] ? analysis[model] : {})
        };
      }
    });

    const comparisonData = {
      userId,
      prompt,
      models: Object.keys(selectedModels).filter(model => selectedModels[model]),
      codes,
      analysis: analysis || null,
      timestamp: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "comparisons"), comparisonData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving comparison:", error);
    throw error;
  }
};

// Get all comparisons for a user
export const getUserComparisons = async (userId) => {
  try {
    const q = query(
      collection(db, "comparisons"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting comparisons:", error);
    throw error;
  }
};