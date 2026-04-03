const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

export async function getGroqChatCompletion(prompt: string, model: string = "llama-3.1-8b-instant") {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      model: model,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function transcribeAudio(audioBlob: Blob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.wav");
  formData.append("model", "whisper-large-v3-turbo");

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Groq Transcription error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.text;
}
