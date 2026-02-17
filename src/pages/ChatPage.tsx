import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Camera, LayoutGrid } from "lucide-react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatInput } from "@/components/ChatInput";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";
import { ChatMessage, sendMessage, resetConversation } from "@/lib/api";

const ONBOARDING_KEY = "easyclosets_onboarding_done";

const LOADING_MESSAGES = [
  "Straightening the hangers",
  "Color-coordinating your wardrobe",
  "Measuring twice, cutting once",
  "Making Marie Kondo proud",
  "Debating between white and ivory",
  "Finding the missing sock",
  "Folding the fitted sheets",
  "Organizing by season and color",
  "Choosing the perfect hardware",
  "Spacing hangers exactly 2 inches apart",
  "Alphabetizing the spice rack",
  "Fluffing the throw pillows",
  "Consulting the feng shui guide",
  "Ironing out the details",
  "Matching the drawer pulls",
  "Rethinking the shoe situation",
  "Calculating optimal shelf spacing",
  "Pondering the perfect pantry",
  "Aligning everything just so",
  "Admiring the before photo",
];

const SPINNER_CHARS = ["·", "✻", "✽", "✶", "✳", "✢"];

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Upload a photo of your space and I'll redesign it with custom EasyClosets cabinetry! Or tell me what you're working with.",
  quickReplies: ["Walk-in closet", "Reach-in closet", "Pantry", "Garage"],
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Typewriter: type out current message char by char, then pause, then advance
  useEffect(() => {
    if (!loading) {
      setLoadingMsgIndex(0);
      setTypedChars(0);
      return;
    }
    const fullText = LOADING_MESSAGES[loadingMsgIndex];
    if (typedChars < fullText.length) {
      // Still typing — add next character
      const timer = setTimeout(() => setTypedChars((c) => c + 1), 35);
      return () => clearTimeout(timer);
    } else {
      // Fully typed — pause then advance to next message
      const timer = setTimeout(() => {
        setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
        setTypedChars(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, loadingMsgIndex, typedChars]);

  // Spinner character cycling
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setSpinnerIndex((i) => (i + 1) % SPINNER_CHARS.length);
    }, 120);
    return () => clearInterval(interval);
  }, [loading]);

  // Set page title
  useEffect(() => {
    document.title = "AI Design Assistant | EasyClosets";
  }, []);

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
    const objectUrl = image ? URL.createObjectURL(image) : undefined;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text || "Photo uploaded",
      imageUrl: objectUrl,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    setLoading(true);

    const reply = await sendMessage(text, image);
    setMessages((prev) => [...prev, reply]);
    setLoading(false);
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
      <div className="flex-1 flex flex-col bg-background">
        {showOnboarding && <OnboardingOverlay onDismiss={handleDismissOnboarding} />}
        <ChatHeader onNewChat={handleNewChat} />

        <input
          ref={heroFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleHeroFileChange}
        />

        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
          {/* Headline */}
          <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-2">Design Your Dream Space</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm mb-8">
            Upload a photo and I'll redesign it with custom EasyClosets cabinetry
          </p>

          {/* Centered input */}
          <div className="w-full max-w-lg mb-6">
            <ChatInput onSend={handleSend} disabled={loading} centered />
          </div>

          {/* Action cards */}
          <div className="flex gap-3 w-full max-w-lg mb-6">
            <button
              onClick={() => heroFileRef.current?.click()}
              className="flex-1 flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:border-accent transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Camera className="h-5 w-5 text-accent" />
              </div>
              <span className="text-sm font-medium text-foreground">Upload a photo</span>
            </button>
            <button
              onClick={() => navigate("/idea-center")}
              className="flex-1 flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 hover:border-accent transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <LayoutGrid className="h-5 w-5 text-accent" />
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        {messages.slice(1).map((msg) => (
          <ChatBubble key={msg.id} message={msg} onQuickReply={handleQuickReply} />
        ))}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="bg-ai-bubble rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <span className="text-accent text-sm w-3 text-center" aria-hidden="true">
                {SPINNER_CHARS[spinnerIndex]}
              </span>
              <span className="text-xs text-muted-foreground italic">
                {LOADING_MESSAGES[loadingMsgIndex].slice(0, typedChars)}
                {typedChars < LOADING_MESSAGES[loadingMsgIndex].length && (
                  <span className="inline-block w-[1px] h-3 bg-muted-foreground/60 ml-[1px] align-middle animate-pulse" />
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input pinned to bottom */}
      <div className="sticky bottom-0 z-20 bg-background pb-[env(safe-area-inset-bottom)]">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
