import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Camera, LayoutGrid } from "lucide-react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatInput } from "@/components/ChatInput";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";
import { ChatMessage, sendMessage, resetConversation } from "@/lib/api";

const ONBOARDING_KEY = "easyclosets_onboarding_done";

// Messages shown when the user uploaded a photo (image edit/gen path — takes 15-30s)
const PHOTO_LOADING_MESSAGES = [
  "Judging your closet (respectfully)",
  "Ok wow there's a lot going on in here",
  "Pretending I didn't see that pile",
  "Finding a home for every single shoe",
  "Your wire hangers just filed for divorce",
  "Marie Kondo would be so proud of us right now",
  "This closet has potential... buried under laundry",
  "Evicting the floor pile, effective immediately",
  "Adding shelves where dreams go to thrive",
  "Giving your wardrobe the glow-up it deserves",
  "No because this is going to look incredible",
  "Measuring twice because I'm an overachiever",
  "The before photo is... brave. Respect.",
  "Your future self is going to love this",
  "Hold on, I'm having a design breakthrough",
  "Sorry, got distracted admiring my own work",
  "This is the closet equivalent of a movie makeover",
  "Replacing vibes with actual organization",
];

// Messages shown for text-only responses (chat path — takes 2-5s)
const TEXT_LOADING_MESSAGES = [
  "Hold on, design brain is warming up",
  "White or ivory? Don't worry, I'll decide",
  "Mentally walking through your closet",
  "One sec, checking all 10 finish options",
  "Already have three ideas, narrowing it down",
  "Picturing something you'll actually love",
  "Thinking about shelves (as one does)",
  "Resisting the urge to add a shoe wall",
  "Looking up what 'modern farmhouse' even means",
  "Trying not to overthink the hardware finish",
];

const SPINNER_CHAR = "✶";

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
  const [loadingWithPhoto, setLoadingWithPhoto] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Cycle loading messages sequentially from the appropriate pool
  const loadingMessages = loadingWithPhoto ? PHOTO_LOADING_MESSAGES : TEXT_LOADING_MESSAGES;
  useEffect(() => {
    if (!loading) {
      setLoadingMsgIndex(0);
      return;
    }
    const pool = loadingWithPhoto ? PHOTO_LOADING_MESSAGES : TEXT_LOADING_MESSAGES;
    const interval = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % pool.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading, loadingWithPhoto]);

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
    setLoadingWithPhoto(!!image);
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
        {messages.slice(1).map((msg, i, arr) => {
          const isLastAi = msg.role === "assistant" && i === arr.length - 1;
          return (
            <ChatBubble
              key={msg.id}
              message={msg}
              onQuickReply={handleQuickReply}
              animate={isLastAi}
            />
          );
        })}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="bg-ai-bubble rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2.5">
              <span className="loading-spinner text-accent text-xs" aria-hidden="true">
                {SPINNER_CHAR}
              </span>
              <span className="loading-shimmer text-xs italic font-medium">
                {loadingMessages[loadingMsgIndex % loadingMessages.length]}
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
