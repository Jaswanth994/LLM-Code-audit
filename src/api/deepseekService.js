const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function getDeepSeekResponse(prompt) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:5173", // Replace with your domain in production
      "X-Title": "Multi-LLM Tool"
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1-zero:free", 
      messages: [
        {
          role: "system",
          content: "You are a helpful coding assistant. Return only code with no explanations."
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
    console.error(" DeepSeek API error:", data);
    throw new Error(data.error?.message || "Unknown error from DeepSeek");
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  const codeBlock = content?.match(/```(?:[\w-]*)?\n([\s\S]*?)```/);
  return codeBlock ? codeBlock[1].trim() : content;
}
