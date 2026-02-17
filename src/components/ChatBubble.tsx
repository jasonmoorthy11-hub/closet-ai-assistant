import { useState, useEffect } from "react";
import { ChatMessage } from "@/lib/api";

interface ChatBubbleProps {
  message: ChatMessage;
  onQuickReply?: (text: string) => void;
}

export function ChatBubble({ message, onQuickReply }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen]);

  return (
    <>
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
        <div className="max-w-[85%] flex flex-col gap-2">
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isUser
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-ai-bubble text-ai-bubble-foreground rounded-bl-md"
            }`}
          >
            {message.imageError && !message.imageUrl && (
              <div className="flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 mb-2 text-xs text-yellow-800">
                <span>&#9888;</span>
                <span>Image generation wasn't successful this time.</span>
              </div>
            )}
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt={isUser ? "Uploaded photo" : "AI-generated design"}
                onClick={() => setLightboxOpen(true)}
                className={`rounded-xl shadow-sm mb-2 object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                  isUser
                    ? "max-w-[200px] max-h-[260px] w-auto"
                    : "w-full max-w-[400px]"
                }`}
              />
            )}
            <p>{message.content}</p>
          </div>

          {!isUser && message.quickReplies && message.quickReplies.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {message.quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => onQuickReply?.(reply)}
                  className="shrink-0 rounded-full border border-accent bg-background px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && message.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-label="Expanded image view"
        >
          <img
            src={message.imageUrl}
            alt="Full-size view"
            className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
