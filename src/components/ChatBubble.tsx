import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { ChatMessage } from "@/lib/api";
import { StreamingImage } from "./StreamingImage";

const WORD_DELAY = 0.09; // seconds per word

// Photo upload path (image edit/gen — 15-30s, user sees many)
const PHOTO_LOADING_MESSAGES = [
  "Your closet just filed for divorce",
  "The shoes are staging a coup",
  "A hanger just fainted",
  "Evicting the ghosts of outfits past",
  "Your socks are in witness protection now",
  "A shelf just whispered 'finally'",
  "The dust bunnies hired a lawyer",
  "Teaching your pants to stand on their own",
  "A drawer just rolled its eyes at me",
  "Your closet rod is having a breakdown",
  "The moths wrote a formal complaint",
  "Convincing your shoes they deserve better",
  "Your sweaters just unionized",
  "The ironing board wants to be included",
  "Your closet called, it's seeing other people",
  "A sock just made a run for it",
  "The coat hooks are gossiping about you",
  "Your belts are tangled and so am I",
  "Filing a missing persons report for the other sock",
];

function ImageLoadingCaption() {
  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random() * PHOTO_LOADING_MESSAGES.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % PHOTO_LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="loading-spinner text-accent text-xs">&#10038;</span>
      <span key={msgIndex} className="loading-shimmer loading-message-fade text-xs italic font-medium text-muted-foreground">
        {PHOTO_LOADING_MESSAGES[msgIndex]}
      </span>
    </div>
  );
}

/**
 * Memoized typewriter text — pure CSS animation, zero React re-renders.
 * Each word is a <span> with staggered `animation-delay`.
 * opacity transitions are GPU-composited (no layout/paint).
 */
const TypewriterText = React.memo(function TypewriterText({
  content,
  animate,
  onDone,
}: {
  content: string;
  animate: boolean;
  onDone?: () => void;
}) {
  const words = content.split(" ");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!animate || !onDone) return;
    const totalMs = words.length * WORD_DELAY * 1000 + 200;
    timerRef.current = setTimeout(onDone, totalMs);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, words.length]);

  if (!animate) return <>{content}</>;

  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          className="typewriter-word"
          style={{ animationDelay: `${i * WORD_DELAY}s` }}
        >
          {word}{i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
});

interface ChatBubbleProps {
  message: ChatMessage;
  onQuickReply?: (text: string) => void;
  animate?: boolean;
  onContentReady?: () => void;
}

export function ChatBubble({ message, onQuickReply, animate, onContentReady }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [doneTyping, setDoneTyping] = useState(!animate);

  useEffect(() => {
    if (doneTyping && onContentReady) onContentReady();
  }, [doneTyping, onContentReady]);

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
          {/* AI message: image outside bubble, text in bubble */}
          {!isUser && (
            <div className="text-sm leading-relaxed">
              {message.imageUrl && (
                <div onClick={() => !message.isPartialImage && setLightboxOpen(true)}>
                  <StreamingImage
                    src={message.imageUrl}
                    isPartial={!!message.isPartialImage}
                    partialIndex={message.partialIndex ?? -1}
                    onLoad={() => {
                      setImageLoaded(true);
                      onContentReady?.();
                    }}
                    isUser={false}
                  />
                </div>
              )}

              {message.imageError && !message.imageUrl && (
                <div className="flex items-center gap-2 rounded-lg bg-secondary border border-border px-3 py-2 mb-2 text-xs text-muted-foreground">
                  <span>&#9888;</span>
                  <span>Image generation wasn't successful this time.</span>
                </div>
              )}

              {(message.content || message.isPartialImage) && (
                <div className="bg-ai-bubble text-ai-bubble-foreground rounded-2xl rounded-bl-md px-4 py-2.5">
                  {message.content && (
                    <p>
                      <TypewriterText
                        content={message.content}
                        animate={!!animate}
                        onDone={() => setDoneTyping(true)}
                      />
                    </p>
                  )}
                  {message.isPartialImage && <ImageLoadingCaption />}
                </div>
              )}
            </div>
          )}

          {/* User message: everything in one bubble */}
          {isUser && (
            <div className="text-sm leading-relaxed rounded-2xl rounded-br-md px-4 py-2.5 bg-primary text-primary-foreground">
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Uploaded photo"
                  onLoad={() => {
                    setImageLoaded(true);
                    onContentReady?.();
                  }}
                  className="rounded-xl shadow-sm mb-2 object-cover max-w-[200px] max-h-[260px] w-auto"
                />
              )}
              <p>{message.content}</p>
            </div>
          )}

          {!isUser && doneTyping && message.quickReplies && message.quickReplies.length > 0 && (
            <div className="flex gap-2 flex-wrap">
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
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Close image"
          >
            <X className="h-5 w-5" />
          </button>
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
