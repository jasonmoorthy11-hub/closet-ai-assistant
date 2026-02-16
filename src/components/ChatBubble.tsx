import { ChatMessage } from "@/lib/api";

interface ChatBubbleProps {
  message: ChatMessage;
  onQuickReply?: (text: string) => void;
}

export function ChatBubble({ message, onQuickReply }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className="max-w-[85%] flex flex-col gap-2">
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-ai-bubble text-ai-bubble-foreground rounded-bl-md"
          }`}
        >
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Shared image"
              className="w-full rounded-lg mb-2"
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
                className="shrink-0 rounded-full border border-primary bg-background px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
