const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function getDolphinResponse(prompt) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", // change to your domain in prod
        "X-Title": "multi-llm-code-tool"
      },
      body: JSON.stringify({
        model: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
        messages: [
          {
            role: "system",
            content: "You are a coding assistant. Only return clean code, no explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Unknown error from Dolphin");

    const content = data.choices?.[0]?.message?.content?.trim() || "";
    const match = content.match(/```(?:[\w-]*)?\n([\s\S]*?)```/);
    return match ? match[1].trim() : content;
  } catch (error) {
    console.error("Dolphin API Error:", error.message);
    throw error;
  }
}
