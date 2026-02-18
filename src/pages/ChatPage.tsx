import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { TEMPLATES, Template } from "@/lib/templates";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatInput } from "@/components/ChatInput";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";
import { ChatMessage, sendMessage, sendMessageStream, resetConversation } from "@/lib/api";

const ONBOARDING_KEY = "easyclosets_onboarding_done";

// Text chat path (2-5s, user sees 1-2)
const TEXT_LOADING_MESSAGES = [
  "My brain is buffering",
  "Hold on I dropped my train of thought",
  "Consulting my inner shelf",
  "Pretending I went to design school",
  "Googling what a closet is",
  "Asking my mom for advice",
  "Having a moment",
  "The braincell is loading",
  "Thoughts are being thunk",
  "Drawing a blank beautifully",
];

const SPINNER_CHAR = "✶";

// Warm gradient placeholder — shown immediately when image gen starts.
// Under blur(16px) this looks like a soft warm glow where the image will appear.
const PLACEHOLDER_IMAGE = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="96">` +
  `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
  `<stop offset="0%" stop-color="#F0E8DD"/>` +
  `<stop offset="50%" stop-color="#E5D8CA"/>` +
  `<stop offset="100%" stop-color="#D4C4B0"/>` +
  `</linearGradient></defs>` +
  `<rect width="64" height="96" fill="url(#g)"/>` +
  `</svg>`
);

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Upload a photo of your space and I'll redesign it with custom EasyClosets cabinetry! Or tell me what you're working with.",
  quickReplies: ["Walk-in closet", "Reach-in closet", "Pantry", "Garage"],
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const userPhotoRef = useRef<string>();  // persist user's uploaded photo URL for placeholders
  const lastAiImageRef = useRef<string>();  // last generated AI image for iteration placeholders
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Cycle loading messages sequentially (text-only; photo loading is in ChatBubble)
  useEffect(() => {
    if (!loading) {
      setLoadingMsgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % TEXT_LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  // Set page title
  useEffect(() => {
    document.title = "AI Design Assistant | EasyClosets";
  }, []);

  // Handle template prefill (from /idea-center or direct URL)
  useEffect(() => {
    const param = searchParams.get("template");
    if (param) {
      const tmpl = TEMPLATES.find(t => t.id === param)
                || TEMPLATES.find(t => t.title === param);
      if (tmpl) {
        handleSend(tmpl.starterPrompt, undefined, tmpl);
      } else {
        handleSend(`I'd like a design inspired by: ${param}`);
      }
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const handleDismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const handleSend = useCallback(async (text: string, image?: File, template?: Template) => {
    const objectUrl = image ? URL.createObjectURL(image) : undefined;
    if (objectUrl) {
      // Revoke previous photo URL, keep new one alive for placeholders
      if (userPhotoRef.current) URL.revokeObjectURL(userPhotoRef.current);
      userPhotoRef.current = objectUrl;
    }
    // Show short display text in bubble, send rich starterPrompt to backend
    const displayText = template
      ? `I'd like a ${template.title} design`
      : (text || "Photo uploaded");
    const apiText = template ? template.starterPrompt : text;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: displayText,
      imageUrl: objectUrl,
    };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);

    const aiMsgId = crypto.randomUUID();

    try {
      await sendMessageStream(apiText, {
        onText: (msg, quickReplies, _convId, shouldGenerateImage) => {
          // Placeholder priority: new upload > last AI image > user photo > gradient
          const placeholder = objectUrl || lastAiImageRef.current || userPhotoRef.current || PLACEHOLDER_IMAGE;
          const aiMsg: ChatMessage = {
            id: aiMsgId,
            role: "assistant",
            content: msg,
            // Store LLM quick replies always; hide during image gen (shown after image completes)
            quickReplies: shouldGenerateImage ? undefined : quickReplies,
            _pendingQuickReplies: shouldGenerateImage ? quickReplies : undefined,
            imageUrl: shouldGenerateImage ? placeholder : undefined,
            isPartialImage: shouldGenerateImage ? true : undefined,
            partialIndex: shouldGenerateImage ? -1 : undefined,
          };
          setMessages((prev) => [...prev, aiMsg]);
          setLoading(false);
          if (shouldGenerateImage) {
            setImageGenerating(true);
          }
        },
        onCleanupImage: (cleanupUrl) => {
          // Show cleanup image crystal clear for ~2.5s (partialIndex=-2 = cleanup preview mode)
          // StreamingImage snaps to clear on -1→-2, then blurs up on -2→-1
          lastAiImageRef.current = cleanupUrl;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? { ...m, imageUrl: cleanupUrl, isPartialImage: true, partialIndex: -2 }
                : m
            )
          );
          // After 2.5s, blur up to await the incoming redesign
          if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
          cleanupTimerRef.current = setTimeout(() => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId && m.partialIndex === -2
                  ? { ...m, partialIndex: -1 }
                  : m
              )
            );
          }, 2500);
        },
        onPartialImage: (b64, index) => {
          const dataUri = `data:image/png;base64,${b64}`;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, imageUrl: dataUri, isPartialImage: true, partialIndex: index } : m
            )
          );
        },
        onImageComplete: (imageUrl) => {
          lastAiImageRef.current = imageUrl;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? {
                    ...m,
                    imageUrl,
                    isPartialImage: false,
                    partialIndex: undefined,
                    // Use LLM's contextual quick replies saved during text phase
                    quickReplies: m._pendingQuickReplies || m.quickReplies || [
                      "Try a different style",
                      "Change the finish",
                      "Add more storage",
                      "Talk to a designer",
                    ],
                    _pendingQuickReplies: undefined,
                  }
                : m
            )
          );
          setImageGenerating(false);
        },
        onImageError: (error) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId && !m.imageError
                ? {
                    ...m,
                    isPartialImage: false,
                    imageError: error,
                    content:
                      m.content +
                      (error === "content_blocked"
                        ? "\n\nI wasn't able to generate that design — the image request was flagged by our content filter. Try describing your space a bit differently and I'll give it another shot!"
                        : "\n\nI ran into a hiccup generating the design image. Want to try again?"),
                    quickReplies: [
                      "Try generating again",
                      "Let me describe it differently",
                      "Skip the image for now",
                    ],
                  }
                : m
            )
          );
          setImageGenerating(false);
        },
        onDone: () => {
          setLoading(false);
          setImageGenerating(false);
        },
      }, image, template);
    } catch {
      // Final fallback
      const reply = await sendMessage(apiText, image, template);
      setMessages((prev) => [...prev, reply]);
      setLoading(false);
      setImageGenerating(false);
    }
  }, []);

  const handleQuickReply = useCallback((text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("upload") && lower.includes("photo")) {
      fileRef.current?.click();
      return;
    }
    handleSend(text);
  }, [handleSend]);

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSend("", file);
      e.target.value = "";
    }
  };

  const handleFileFromPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSend("", file);
      e.target.value = "";
    }
  };

  const handleNewChat = () => {
    resetConversation();
    setMessages([WELCOME_MESSAGE]);
    if (userPhotoRef.current) {
      URL.revokeObjectURL(userPhotoRef.current);
      userPhotoRef.current = undefined;
    }
    lastAiImageRef.current = undefined;
  };

  const showHero = messages.length === 1;

  // Hero landing state
  if (showHero) {
    return (
      <div className="flex-1 flex flex-col bg-background min-h-0">
        {showOnboarding && <OnboardingOverlay onDismiss={handleDismissOnboarding} />}
        <ChatHeader onNewChat={handleNewChat} />

        <input
          ref={heroFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleHeroFileChange}
        />

        <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
          {/* Headline */}
          <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-2">Design Your Dream Space</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm mb-6">
            Upload a photo of your space and I'll redesign it with custom EasyClosets cabinetry! Or tell me what you're working with
          </p>

          {/* Input */}
          <div className="w-full max-w-lg mb-3">
            <ChatInput onSend={handleSend} disabled={loading} centered hideCamera />
          </div>

          {/* Quick actions — upload + suggestions as equal-weight pills */}
          <div className="flex gap-2 flex-wrap justify-center mb-8">
            <button
              onClick={() => heroFileRef.current?.click()}
              className="rounded-full bg-accent text-accent-foreground px-4 py-1.5 text-xs font-medium hover:bg-accent/90 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Camera className="h-3.5 w-3.5" />
              Upload a photo
            </button>
            {["Walk-in closet", "Reach-in closet", "Pantry", "Garage"].map((label) => (
              <button
                key={label}
                onClick={() => handleQuickReply(label)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-accent hover:text-accent transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Template row — compact horizontal scroll, same viewport */}
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-foreground">Or start with a design</p>
              <button onClick={() => navigate("/idea-center")} className="text-xs text-accent hover:text-accent/80 transition-colors">
                Browse all &rarr;
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {TEMPLATES.slice(0, 6).map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSend(template.starterPrompt, undefined, template)}
                  className="shrink-0 w-36 md:w-40 group text-left transition-transform hover:-translate-y-0.5"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border mb-1.5 transition-shadow group-hover:shadow-md">
                    <img
                      src={template.imageUrl}
                      alt={template.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">{template.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal chat state
  return (
    <div className="flex-1 flex flex-col bg-background min-h-0">
      {showOnboarding && <OnboardingOverlay onDismiss={handleDismissOnboarding} />}
      <ChatHeader onNewChat={handleNewChat} />

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileFromPicker}
      />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        <div className="min-h-full flex flex-col justify-end">
          {/* Welcome note at top of chat */}
          <div className="flex justify-center mb-4">
            <p className="text-xs text-muted-foreground bg-secondary/50 rounded-full px-3 py-1">
              AI Design Assistant — powered by EasyClosets
            </p>
          </div>
          {messages.slice(1).map((msg, i, arr) => {
            const isLastAi = msg.role === "assistant" && i === arr.length - 1;
            return (
              <ChatBubble
                key={msg.id}
                message={msg}
                onQuickReply={handleQuickReply}
                animate={isLastAi}
                onContentReady={scrollToBottom}
              />
            );
          })}
          {loading && !imageGenerating && (
            <div className="flex justify-start mb-3">
              <div className="bg-ai-bubble rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2.5">
                <span className="loading-spinner text-accent text-xs" aria-hidden="true">
                  {SPINNER_CHAR}
                </span>
                <span
                  key={loadingMsgIndex}
                  className="loading-shimmer loading-message-fade text-xs italic font-medium"
                >
                  {TEXT_LOADING_MESSAGES[loadingMsgIndex % TEXT_LOADING_MESSAGES.length]}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input pinned to bottom */}
      <div className="sticky bottom-0 z-20 bg-background pb-[env(safe-area-inset-bottom)]">
        <ChatInput onSend={handleSend} disabled={loading || imageGenerating} />
      </div>
    </div>
  );
}
