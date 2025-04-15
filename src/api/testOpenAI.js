const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function getOpenAIResponse(prompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful coding assistant. Return only code without explanation." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(" OpenAI API error:", data);
    throw new Error(data.error?.message || "Unknown error from OpenAI");
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  const codeBlock = content?.match(/```(?:[\w-]*)?\n([\s\S]*?)```/);
  return codeBlock ? codeBlock[1].trim() : content;
}
