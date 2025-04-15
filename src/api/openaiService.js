const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function getChatGPTResponse(prompt) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:5173", // or your deployed URL
        "X-Title": "my-openrouter-tool"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // or "openai/gpt-4", "google/gemini-pro", etc.
        messages: [
          {
            role: "system",
            content: "You are a helpful code assistant. Only return clean code, no explanation."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "API call failed");
    }

    const content = data.choices?.[0]?.message?.content || "";

    // Extract code block if present
    const match = content.match(/```(?:[\w-]*)\n([\s\S]*?)```/);
    return match ? match[1].trim() : content.trim();
  } catch (error) {
    console.error(" ChatGPT (OpenRouter) error:", error.message);
    throw new Error(`ChatGPT Error: ${error.message}`);
  }
}
