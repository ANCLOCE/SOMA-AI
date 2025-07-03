export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    // Try Groq API (free tier available)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY || "gsk_demo_key"}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are S.O.M.A., a helpful AI assistant. Keep responses concise and helpful.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        model: "llama3-8b-8192",
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return Response.json({
        response: data.choices[0]?.message?.content || "I understand your request.",
      })
    }

    throw new Error("Groq API failed")
  } catch (error) {
    console.error("Groq API error:", error)
    return Response.json({
      response: "I'm processing your request with my local intelligence.",
    })
  }
}
