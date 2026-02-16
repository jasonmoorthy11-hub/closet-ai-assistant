import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Camera, LayoutGrid } from "lucide-react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatInput } from "@/components/ChatInput";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";
import { ChatMessage, sendMessage, resetConversation } from "@/lib/api";

const ONBOARDING_KEY = "easyclosets_onboarding_done";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Upload a photo of your space and I'll redesign it with custom EasyClosets cabinetry! Or tell me what you're working with.",
  quickReplies: ["Walk-in closet", "Reach-in closet", "Pantry", "Garage"],
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [loadingWithImage, setLoadingWithImage] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handle template prefill
  useEffect(() => {
    const template = searchParams.get("template");
    if (template) {
      handleSend(`I'd like a design inspired by: ${template}`);
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleDismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const handleSend = useCallback(async (text: string, image?: File) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text || "Photo uploaded",
      imageUrl: image ? URL.createObjectURL(image) : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setLoadingWithImage(!!image);

    const reply = await sendMessage(text, image);
    setMessages((prev) => [...prev, reply]);
    setLoading(false);
    setLoadingWithImage(false);
  }, []);

  const handleQuickReply = useCallback((text: string) => {
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
  };

  const showHero = messages.length === 1;

  // Hero landing state
  if (showHero) {
    return (
      <div className="flex-1 flex flex-col bg-background min-h-0 overflow-auto">
        {showOnboarding && <OnboardingOverlay onDismiss={handleDismissOnboarding} />}
        <ChatHeader onNewChat={handleNewChat} />

        <input
          ref={heroFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleHeroFileChange}
        />

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
          {/* Headline */}
          <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-2 text-center">Design Your Dream Space</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm mb-6">
            Upload a photo and I'll redesign it with custom EasyClosets cabinetry
          </p>

          {/* Centered input */}
          <div className="w-full max-w-lg mb-4">
            <ChatInput onSend={handleSend} disabled={loading} centered />
          </div>

          {/* Action cards */}
          <div className="flex gap-3 w-full max-w-lg mb-4">
            <button
              onClick={() => heroFileRef.current?.click()}
              className="flex-1 flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5 hover:border-accent transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 shrink-0">
                <Camera className="h-4 w-4 text-accent" />
              </div>
              <span className="text-sm font-medium text-foreground">Upload a photo</span>
            </button>
            <button
              onClick={() => navigate("/idea-center")}
              className="flex-1 flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5 hover:border-accent transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 shrink-0">
                <LayoutGrid className="h-4 w-4 text-accent" />
              </div>
              <span className="text-sm font-medium text-foreground">Browse inspiration</span>
            </button>
          </div>

          {/* Quick reply pills */}
          <div className="flex gap-2 flex-wrap justify-center">
            {["Walk-in closet", "Reach-in closet", "Pantry", "Garage"].map((label) => (
              <button
                key={label}
                onClick={() => handleQuickReply(label)}
                className="rounded-full border border-accent bg-background px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {label}
              </button>
            ))}
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
        {messages.slice(1).map((msg, i) => {
          const allMsgs = messages.slice(1);
          let userPhotoUrl: string | undefined;
          if (msg.role === "assistant" && msg.imageUrl && i > 0) {
            const prev = allMsgs[i - 1];
            if (prev.role === "user" && prev.imageUrl) {
              userPhotoUrl = prev.imageUrl;
            }
          }
          return <ChatBubble key={msg.id} message={msg} onQuickReply={handleQuickReply} userPhotoUrl={userPhotoUrl} />;
        })}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="bg-ai-bubble rounded-2xl rounded-bl-md px-4 py-3">
              {loadingWithImage ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                  <span className="text-sm text-muted-foreground">Designing your space...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input pinned to bottom */}
      <div className="shrink-0 bg-background pb-[env(safe-area-inset-bottom)]">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
