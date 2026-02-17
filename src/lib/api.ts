import { toast } from "sonner";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  quickReplies?: string[];
  imageError?: string;
  isPartialImage?: boolean;
  partialIndex?: number;
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
    toast.error("Connection issue", {
      description: "Couldn't reach the server. Please try again in a moment.",
    });
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "I'm having trouble connecting right now. Please try again in a moment.",
      quickReplies: ["Try again"],
    };
  }
}

export interface StreamCallbacks {
  onText: (msg: string, quickReplies?: string[], convId?: string, shouldGenerateImage?: boolean) => void;
  onPartialImage: (b64: string, index: number) => void;
  onImageComplete: (imageUrl: string) => void;
  onImageError: (error: string) => void;
  onDone: () => void;
}

function parseSSE(text: string): Array<{ event: string; data: string }> {
  const events: Array<{ event: string; data: string }> = [];
  let currentEvent = "";
  let currentData = "";

  for (const rawLine of text.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (line.startsWith("event:")) {
      currentEvent = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      currentData = line.slice(5).trim();
    } else if (line === "" && currentEvent) {
      events.push({ event: currentEvent, data: currentData });
      currentEvent = "";
      currentData = "";
    }
  }
  // Handle last event if no trailing newline
  if (currentEvent && currentData) {
    events.push({ event: currentEvent, data: currentData });
  }
  return events;
}

export async function sendMessageStream(
  message: string,
  callbacks: StreamCallbacks,
  imageFile?: File,
): Promise<void> {
  try {
    let res: Response;

    if (imageFile) {
      const formData = new FormData();
      formData.append("message", message || "Here's a photo of my space");
      if (conversationId) {
        formData.append("conversation_id", conversationId);
      }
      formData.append("file", imageFile);

      res = await fetch(`${BASE_URL}/chat-with-image-stream`, {
        method: "POST",
        body: formData,
      });
    } else {
      const body: Record<string, string> = { message };
      if (conversationId) {
        body.conversation_id = conversationId;
      }

      res = await fetch(`${BASE_URL}/chat-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) throw new Error("API error");

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/event-stream")) {
      // Fallback: non-SSE response (older backend)
      const data = await res.json();
      if (data.conversation_id) conversationId = data.conversation_id;
      let imageUrl: string | undefined;
      if (data.image_url) {
        imageUrl = data.image_url.startsWith("http") ? data.image_url : `${BASE_URL}${data.image_url}`;
      }
      callbacks.onText(data.message, data.quick_replies, data.conversation_id, !!imageUrl);
      if (imageUrl) callbacks.onImageComplete(imageUrl);
      callbacks.onDone();
      return;
    }

    // Parse SSE stream
    if (!res.body) throw new Error("No response body");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let receivedDone = false;
    let imageExpected = false;
    let imageResolved = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Process complete events (separated by double newlines, handles \r\n too)
      const parts = buffer.split(/\r?\n\r?\n/);
      buffer = parts.pop() || "";

      for (const part of parts) {
        const events = parseSSE(part + "\n");
        for (const { event, data } of events) {
          try {
            if (event === "text") {
              const parsed = JSON.parse(data);
              if (parsed.conversation_id) conversationId = parsed.conversation_id;
              if (parsed.should_generate_image) imageExpected = true;
              callbacks.onText(
                parsed.message,
                parsed.quick_replies,
                parsed.conversation_id,
                parsed.should_generate_image,
              );
            } else if (event === "partial_image") {
              const parsed = JSON.parse(data);
              callbacks.onPartialImage(parsed.b64_json, parsed.index);
            } else if (event === "image_complete") {
              const parsed = JSON.parse(data);
              imageResolved = true;
              const imageUrl = parsed.image_url.startsWith("http")
                ? parsed.image_url
                : `${BASE_URL}${parsed.image_url}`;
              callbacks.onImageComplete(imageUrl);
            } else if (event === "image_error") {
              const parsed = JSON.parse(data);
              imageResolved = true;
              callbacks.onImageError(parsed.error);
            } else if (event === "done") {
              receivedDone = true;
              callbacks.onDone();
            }
          } catch (parseErr) {
            console.error("SSE event parse error:", parseErr, { event, data: data.slice(0, 100) });
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      const events = parseSSE(buffer);
      for (const { event, data } of events) {
        if (event === "done") { receivedDone = true; callbacks.onDone(); }
      }
    }

    // Safety net: if stream ended without "done" event, clean up
    if (!receivedDone) {
      if (imageExpected && !imageResolved) {
        callbacks.onImageError("connection_lost");
      }
      callbacks.onDone();
    }
  } catch (error) {
    console.error("Streaming API failed, falling back:", error);
    // Fallback to non-streaming
    const reply = await sendMessage(message, imageFile);
    callbacks.onText(reply.content, reply.quickReplies, undefined, !!reply.imageUrl);
    if (reply.imageUrl) callbacks.onImageComplete(reply.imageUrl);
    callbacks.onDone();
  }
}
