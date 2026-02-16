export const BASE_URL = "http://localhost:8000";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  quickReplies?: string[];
}

export async function sendMessage(message: string, imageFile?: File): Promise<ChatMessage> {
  const formData = new FormData();
  formData.append("message", message);
  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    // Fallback for demo when API is unavailable
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: imageFile
        ? "Great photo! I can see your space has a lot of potential. What style are you thinking — modern, traditional, or something in between?"
        : "I'd love to help you design the perfect closet! Upload a photo of your space to get started, or tell me about your storage needs.",
      quickReplies: ["Modern style", "Walk-in closet", "Small space solutions", "Show me examples"],
    };
  }
}
