"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
  typing?: boolean;
  id: number;
  image?: string; // 👈 new (for uploaded images)
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messageIdRef = useRef(0);

  // --- Typing effect helper ---
  const typeBotMessage = (fullText: string, tempMsgId: number, speed = 20) => {
    let index = 0;

    const interval = setInterval(() => {
      index++;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempMsgId ? { ...m, text: fullText.slice(0, index) } : m
        )
      );

      if (index >= fullText.length) clearInterval(interval);
    }, speed);
  };

  // --- Send text message ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input, id: messageIdRef.current++ };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Temporary typing bubble
    const tempBotMsg: Message = { sender: "bot", text: "", typing: true, id: messageIdRef.current++ };
    setMessages((prev) => [...prev, tempBotMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });
      const data = await res.json();

      // Use typing effect (text-only)
      typeBotMessage(data.reply, tempBotMsg.id, 20);
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempBotMsg.id
            ? { sender: "bot", text: "Error: Could not get response.", id: tempBotMsg.id }
            : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  // --- Upload image ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (!base64) return;

      // Show image in user bubble
      const userMsg: Message = {
        sender: "user",
        text: "[Image Uploaded]",
        image: URL.createObjectURL(file),
        id: messageIdRef.current++,
      };
      setMessages((prev) => [...prev, userMsg]);

      // Temporary bot bubble
      const tempBotMsg: Message = { sender: "bot", text: "", typing: true, id: messageIdRef.current++ };
      setMessages((prev) => [...prev, tempBotMsg]);
      setIsTyping(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const data = await res.json();

        // Use typing effect (text-only)
        typeBotMessage(data.reply, tempBotMsg.id, 20);
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempBotMsg.id
              ? { sender: "bot", text: "Error: Could not analyze image.", id: tempBotMsg.id }
              : m
          )
        );
      } finally {
        setIsTyping(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Enter key sends message ---
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Auto resize textarea ---
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // --- Scroll chat ---
  useEffect(() => {
    const chat = chatContainerRef.current;
    if (chat) chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  // --- Speech-to-Text ---
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser does not support Speech Recognition");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const speechText = event.results[0][0].transcript;
      setInput(speechText);
    };

    recognition.start();
  };

  return (
    <div className="p-6 flex flex-col items-center h-screen overflow-hidden relative">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-800 to-blue-400 bg-clip-text text-transparent tracking-tight">
        Ultimi Ai
      </h1>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="chat-container flex-1 mb-4 flex flex-col w-full md:w-2/3 gap-16 overflow-y-auto"
      >
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">
            Start a conversation with Ultimi Ai ✨
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            {msg.sender === "user" ? (
              <div className="px-4 py-2 rounded-xl break-words bg-blue-50 text-gray-700 text-sm shadow-md max-w-[65ch] w-full sm:w-auto">
                {msg.image && (
                  <img src={msg.image} alt="Uploaded" className="rounded-md mb-2 max-w-[200px]" />
                )}
                {msg.text}
              </div>
            ) : (
              <div className="text-gray-700 text-sm max-w-[80%] break-words">
                {msg.text}
                {isTyping && msg.sender === "bot" && msg.typing && (
                  <span className="animate-blink">|</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="flex w-full md:w-2/3 relative bg-background dark:bg-gray-900 border border-border rounded-xl p-1.5 shadow-sm z-10 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask me anything..."
          className="w-full resize-none overflow-hidden bg-transparent focus:outline-none focus:ring-0 p-2 rounded-none border-none shadow-none text-sm text-gray-700 dark:text-gray-200"
          rows={1}
        />
        <label className="flex-shrink-0 cursor-pointer bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-2 rounded-full ml-2">
          📷
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
        <button
          onClick={startListening}
          className="flex-shrink-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-2 rounded-full ml-2"
        >
          🎤
        </button>
        <button
          onClick={handleSend}
          className="flex-shrink-0 flex items-center justify-center bg-primary p-2 rounded-full ml-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-send-horizontal-icon text-white drop-shadow-md"
          >
            <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
            <path d="M6 12h16" />
          </svg>
        </button>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-blink {
          animation: blink 1s step-start infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
