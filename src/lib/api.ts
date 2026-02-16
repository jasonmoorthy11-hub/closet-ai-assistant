export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  quickReplies?: string[];
  imageError?: string;
}

// Track conversation ID across messages
let conversationId: string | null = null;

export function resetConversation() {
  conversationId = null;
}

export async function approveDesign(): Promise<{ status: string; message: string }> {
  try {
    if (!conversationId) {
      return { status: "error", message: "No active conversation." };
    }
    const res = await fetch(`${BASE_URL}/approve-design`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: conversationId }),
    });
    return await res.json();
  } catch {
    return { status: "error", message: "Failed to approve design." };
  }
}

export async function sendMessage(message: string, imageFile?: File): Promise<ChatMessage> {
  try {
    let data;

    if (imageFile) {
      // Use multipart endpoint for image uploads
      const formData = new FormData();
      formData.append("message", message || "Here's a photo of my space");
      if (conversationId) {
        formData.append("conversation_id", conversationId);
      }
      formData.append("file", imageFile);

      const res = await fetch(`${BASE_URL}/chat-with-image`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("API error");
      data = await res.json();
    } else {
      // Use JSON endpoint for text messages
      const body: Record<string, string> = { message };
      if (conversationId) {
        body.conversation_id = conversationId;
      }

      const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("API error");
      data = await res.json();
    }

    // Store conversation ID for continuity
    if (data.conversation_id) {
      conversationId = data.conversation_id;
    }

    // Build image URL (backend returns relative paths)
    let imageUrl: string | undefined;
    if (data.image_url) {
      imageUrl = data.image_url.startsWith("http")
        ? data.image_url
        : `${BASE_URL}${data.image_url}`;
    }

    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: data.message,
      imageUrl,
      quickReplies: data.quick_replies || undefined,
      imageError: data.image_error || undefined,
    };
  } catch (error) {
    console.error("API call failed:", error);
    // Fallback for when API is unavailable
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "I'm having trouble connecting right now. Please make sure the backend is running and try again.",
      quickReplies: ["Try again"],
    };
  }
}
