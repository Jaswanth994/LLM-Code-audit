const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function getLlama4ScoutResponse(prompt, imageUrl = null) {
  try {
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that returns only code when applicable, with no explanation."
      },
      {
        role: "user",
        content: imageUrl
          ? [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          : prompt
      }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:5173", //  Change this to your domain in production
        "X-Title": "my-openrouter-tool"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout:free",
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "API call failed");
    }

    const content = data.choices?.[0]?.message?.content || "";

    // Extract clean code block if present
    const match = content.match(/```(?:[\w-]*)?\n([\s\S]*?)```/);
    return match ? match[1].trim() : content.trim();
  } catch (error) {
    console.error("LLaMA 4 Scout API error:", error.message);
    throw new Error(`LLaMA 4 Error: ${error.message}`);
  }
}
