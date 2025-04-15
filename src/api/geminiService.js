const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function getGeminiResponse(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", errorText);
    throw new Error(" Gemini API error. Please try again.");
  }

  const data = await response.json();
  const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  const codeMatch = fullText.match(/```(?:\w*\n)?([\s\S]*?)```/);
  return codeMatch ? codeMatch[1].trim() : fullText.trim();
}
