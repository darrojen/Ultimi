// "use client";

// import { useState, useRef, useEffect } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import Image from "next/image";
// import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Edit } from "lucide-react";
// import { toast } from "sonner";

// interface Message {
//   sender: "user" | "bot";
//   text: string;
//   typing?: boolean;
//   id: number;
//   images?: string[];
//   liked?: boolean;
//   disliked?: boolean;
// }

// export default function ChatbotPage() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [pendingImages, setPendingImages] = useState<File[]>([]);
//   const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([]);

//   const chatContainerRef = useRef<HTMLDivElement | null>(null);
//   const textareaRef = useRef<HTMLTextAreaElement | null>(null);
//   const messageIdRef = useRef(0);

//   const typeBotMessage = (fullText: string, tempMsgId: number, speed = 10) => {
//     let index = 0;
//     const interval = setInterval(() => {
//       index++;
//       setMessages((prev) =>
//         prev.map((m) =>
//           m.id === tempMsgId
//             ? { ...m, text: fullText.slice(0, index), typing: index < fullText.length }
//             : m
//         )
//       );
//       if (index >= fullText.length) clearInterval(interval);
//     }, speed);
//   };

//   const handleCopy = (text: string) => {
//     navigator.clipboard.writeText(text).then(() => {
//       toast.success("Copied to clipboard");
//     }).catch(() => {
//       toast.error("Failed to copy");
//     });
//   };

//   const handleLike = (id: number) => {
//     setMessages((prev) =>
//       prev.map((m) =>
//         m.id === id
//           ? { ...m, liked: !m.liked, disliked: m.liked ? m.disliked : false }
//           : m
//       )
//     );
//   };

//   const handleDislike = (id: number) => {
//     setMessages((prev) =>
//       prev.map((m) =>
//         m.id === id
//           ? { ...m, disliked: !m.disliked, liked: m.disliked ? m.liked : false }
//           : m
//       )
//     );
//   };

//   const handleSend = async (overrideText?: string) => {
//     const messageText = overrideText ?? input;
//     if (!messageText.trim() && pendingImages.length === 0) return;

//     if (pendingImages.length > 0) {
//       const previews = [...pendingImagePreviews];
//       const userMsg: Message = {
//         sender: "user",
//         text: messageText || "[Images]",
//         images: previews,
//         id: messageIdRef.current++,
//       };
//       setMessages((prev) => [...prev, userMsg]);
//       setInput("");
//       setPendingImages([]);
//       setPendingImagePreviews([]);

//       const tempBotMsg: Message = { sender: "bot", text: "", typing: true, id: messageIdRef.current++ };
//       setMessages((prev) => [...prev, tempBotMsg]);
//       setIsTyping(true);

//       try {
//         const promises = pendingImages.map(
//           (file) =>
//             new Promise<string>((resolve) => {
//               const reader = new FileReader();
//               reader.onload = () => {
//                 const base64 = reader.result?.toString().split(",")[1] || "";
//                 resolve(base64);
//               };
//               reader.readAsDataURL(file);
//             })
//         );
//         const base64Images = await Promise.all(promises);

//         const res = await fetch("/api/chat", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ imageBase64: base64Images, description: messageText }),
//         });
//         const data = await res.json();
//         typeBotMessage(data.reply, tempBotMsg.id, 10);

//         // Revoke URLs after display
//         setTimeout(() => {
//           previews.forEach(URL.revokeObjectURL);
//         }, 1000);
//       } catch {
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.id === tempBotMsg.id
//               ? { sender: "bot", text: "Error: Could not analyze images.", id: tempBotMsg.id, typing: false }
//               : m
//           )
//         );
//       } finally {
//         setIsTyping(false);
//       }
//       return;
//     }

//     const userMessage: Message = { sender: "user", text: messageText, id: messageIdRef.current++ };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");

//     const tempBotMsg: Message = { sender: "bot", text: "", typing: true, id: messageIdRef.current++ };
//     setMessages((prev) => [...prev, tempBotMsg]);
//     setIsTyping(true);

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: messageText }),
//       });
//       const data = await res.json();
//       typeBotMessage(data.reply, tempBotMsg.id, 10);
//     } catch {
//       setMessages((prev) =>
//         prev.map((m) =>
//           m.id === tempBotMsg.id
//             ? { sender: "bot", text: "Error: Could not get response.", id: tempBotMsg.id, typing: false }
//             : m
//         )
//       );
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.length) return;
//     const files = Array.from(e.target.files);
//     const previews = files.map((f) => URL.createObjectURL(f));
//     setPendingImages((prev) => [...prev, ...files]);
//     setPendingImagePreviews((prev) => [...prev, ...previews]);
//   };

//   const removePendingImage = (index: number) => {
//     setPendingImages((prev) => prev.filter((_, i) => i !== index));
//     setPendingImagePreviews((prev) => {
//       const filtered = prev.filter((_, i) => i !== index);
//       // Revoke removed URL
//       URL.revokeObjectURL(prev[index]);
//       return filtered;
//     });
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
//       setIsExpanded(textareaRef.current.scrollHeight > 40);
//       textareaRef.current.style.overflowY =
//         textareaRef.current.scrollHeight > 200 ? "auto" : "hidden";
//     }
//   }, [input]);

//   useEffect(() => {
//     const chat = chatContainerRef.current;
//     if (!chat) return;
//     const isNearBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 100;
//     if (isNearBottom) chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
//   }, [messages, isTyping]);

//   const startListening = () => {
//     const SpeechRecognition =
//       (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SpeechRecognition) return alert("Your browser does not support Speech Recognition");

//     setIsRecording(true);
//     const recognition = new SpeechRecognition();
//     recognition.lang = "en-US";
//     recognition.interimResults = true;

//     let finalTranscript = "";
//     recognition.onresult = (event: any) => {
//       let interimTranscript = "";
//       for (let i = 0; i < event.results.length; i++) {
//         const transcript = event.results[i][0].transcript;
//         if (event.results[i].isFinal) finalTranscript += transcript + " ";
//         else interimTranscript += transcript;
//       }
//       setInput(finalTranscript + interimTranscript);
//     };
//     recognition.onend = () => {
//       setIsRecording(false);
//       const trimmed = finalTranscript.trim();
//       if (trimmed) handleSend(trimmed);
//     };
//     recognition.start();
//   };

//   useEffect(() => {
//     if (messages.length === 0) {
//       const initId = messageIdRef.current++;
//       const initMsg: Message = { sender: "bot", text: "", typing: true, id: initId };
//       setMessages([initMsg]);
//       setIsTyping(true);
//       typeBotMessage("Hello! I'm Ultimi AI, your helpful assistant. How can I help you today?", initId, 10);
//     }
//   }, []);

//   return (
//     <div className="p-6 flex flex-col items-center h-screen overflow-hidden relative">
//         <head>
//         <title>Ultimi Ai | Ultimi</title>
//         <meta name="description" content="Learn more about us." />
//       </head>
//       <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-800 to-blue-400 bg-clip-text text-transparent tracking-tight">
//         Ultimi Ai
//       </h1>

//       {/* Chat Area */}
//       <div
//         ref={chatContainerRef}
//         className="chat-container flex-1 mb-24 flex flex-col w-full md:w-2/3 gap-16 overflow-y-auto relative z-10"
//       >
//         {messages.map((msg) => (
//           <div
//             key={msg.id}
//             className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in group relative`}
//           >
//             <div
//               className={`relative px-4 py-2 rounded-xl break-words max-w-[65ch] w-full sm:w-auto ${
//                 msg.sender === "user"
//                   ? "bg-blue-50 text-gray-700 shadow-md px-4 py-2 rounded-xl"
//                   : "text-gray-900 dark:text-gray-200 prose prose-sm dark:prose-invert whitespace-pre-wrap"
//               }`}
//             >
//               {msg.images?.map((img, i) => (
//                 <Image
//                   key={i}
//                   src={img}
//                   alt="Uploaded"
//                   width={200}
//                   height={200}
//                   className="rounded-md mb-2 object-cover"
//                   priority
//                 />
//               ))}

//               {msg.sender === "bot" ? (
//                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                   {msg.text}
//                 </ReactMarkdown>
//               ) : (
//                 msg.text
//               )}

//               {msg.sender === "bot" && msg.typing && <span className="animate-blink">|</span>}

//               {/* User hover icons (outside bubble) */}
//               {msg.sender === "user" && (
//                 <div className="absolute -bottom-6 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all pointer-events-auto">
//                   <button title="Copy" onClick={() => handleCopy(msg.text)} className="hover:scale-110">
//                     <Copy className="w-4 h-4 text-gray-700 dark:text-gray-200" />
//                   </button>
//                   <button title="Edit" className="hover:scale-110">
//                     <Edit className="w-4 h-4 text-gray-700 dark:text-gray-200" />
//                   </button>
//                 </div>
//               )}

//               {/* Bot icons (outside bubble) */}
//               {msg.sender === "bot" && !msg.typing && (
//                 <div className="absolute -bottom-6 right-3 flex gap-2 translate-y-0 transition-all">
//                   <button title="Copy" onClick={() => handleCopy(msg.text)} className="hover:scale-110">
//                     <Copy className="w-4 h-4 text-gray-700 dark:text-gray-200" />
//                   </button>
//                   <button title="Like" onClick={() => handleLike(msg.id)} className="hover:scale-110">
//                     <ThumbsUp className={`w-4 h-4 ${msg.liked ? "text-blue-500" : "text-gray-700 dark:text-gray-200"}`} />
//                   </button>
//                   <button title="Dislike" onClick={() => handleDislike(msg.id)} className="hover:scale-110">
//                     <ThumbsDown className={`w-4 h-4 ${msg.disliked ? "text-red-500" : "text-gray-700 dark:text-gray-200"}`} />
//                   </button>
//                   <button title="Regenerate" className="hover:scale-110">
//                     <RefreshCw className="w-4 h-4 text-gray-700 dark:text-gray-200" />
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input Bar */}
//       <div className="fixed bottom-20 w-full flex justify-center z-10  sm:bottom-6">
//         <div
//           className="flex flex-col items-start bg-background dark:bg-gray-900 border border-border shadow-lg md:w-1/2 w-[90%] px-3"
//           style={{
//             borderRadius:
//               isExpanded || pendingImagePreviews.length > 0 ? "1rem" : "9999px",
//             paddingTop:
//               isExpanded || pendingImagePreviews.length > 0 ? "0.75rem" : "0.5rem",
//             paddingBottom:
//               isExpanded || pendingImagePreviews.length > 0 ? "0.75rem" : "0.5rem",
//             transition: "border-radius 0.3s ease, padding 0.3s ease",
//           }}
//         >
//           {pendingImagePreviews.length > 0 && (
//             <div className="flex gap-2 mb-2">
//               {pendingImagePreviews.map((img, i) => (
//                 <div
//                   key={i}
//                   className="relative w-24 h-24 border border-gray-400 rounded-md overflow-hidden"
//                 >
//                   <Image
//                     src={img}
//                     alt="Pending"
//                     fill
//                     style={{ objectFit: "cover" }}
//                     priority
//                   />
//                   <button
//                     onClick={() => removePendingImage(i)}
//                     className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
//                   >
//                     ✕
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//           <div className="flex items-end w-full">
//             <label className="flex-shrink-0 flex items-center justify-center bg-primary/60 hover:bg-primary transition p-2 rounded-full mr-2 cursor-pointer">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="18"
//                 height="18"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="white"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 className="lucide lucide-image-icon drop-shadow-md"
//               >
//                 <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
//                 <circle cx="9" cy="9" r="2" />
//                 <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
//               </svg>
//               <input
//                 type="file"
//                 accept="image/*"
//                 multiple
//                 onChange={handleImageSelect}
//                 className="hidden"
//               />
//             </label>
//             <textarea
//               ref={textareaRef}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyPress}
//               placeholder="Ask me anything..."
//               className="flex-1 resize-none overflow-hidden bg-transparent focus:outline-none focus:ring-0 p-2 rounded-none border-none shadow-none text-sm text-gray-700 dark:text-gray-200"
//               rows={1}
//             />
//             <button
//               onClick={startListening}
//               className="flex-shrink-0 flex items-center justify-center bg-primary/60 hover:bg-primary transition p-2 rounded-full ml-2 relative"
//             >
//               {isRecording && (
//                 <>
//                   <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping-ripple"></span>
//                   <span className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-50 animate-ping-ripple delay-200"></span>
//                 </>
//               )}
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="18"
//                 height="18"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="white"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 className="lucide lucide-mic-icon drop-shadow-md relative z-10"
//               >
//                 <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
//                 <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
//                 <line x1="12" y1="19" x2="12" y2="23" />
//                 <line x1="8" y1="23" x2="16" y2="23" />
//               </svg>
//             </button>
//             <button
//               onClick={() => handleSend()}
//               className="flex-shrink-0 flex items-center justify-center bg-primary/60 hover:bg-primary transition p-2 rounded-full ml-2 shadow-md"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="18"
//                 height="18"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 className="lucide lucide-send-horizontal-icon text-white drop-shadow-md"
//               >
//                 <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
//                 <path d="M6 12h16" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         .animate-blink {
//           animation: blink 1s step-start infinite;
//         }
//         @keyframes blink {
//           50% {
//             opacity: 0;
//           }
//         }
//         .animate-fade-in {
//           animation: fadeIn 0.3s ease-in;
//         }
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(5px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .animate-ping-ripple {
//           animation: ping-ripple 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
//         }
//         @keyframes ping-ripple {
//           0% {
//             transform: scale(0.8);
//             opacity: 0.6;
//           }
//           50% {
//             transform: scale(1.4);
//             opacity: 0.3;
//           }
//           100% {
//             transform: scale(0.8);
//             opacity: 0.6;
//           }
//         }
//         .delay-200 {
//           animation-delay: 0.2s;
//         }
//       `}</style>
//     </div>
//   );
// }


"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Edit } from "lucide-react";
import { toast } from "sonner";

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
}

declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}

interface Message {
  sender: "user" | "bot";
  text: string;
  typing?: boolean;
  id: number;
  images?: string[];
  liked?: boolean;
  disliked?: boolean;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [pendingImagePreviews, setPendingImagePreviews] = useState<string[]>([]);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messageIdRef = useRef(0);

  const typeBotMessage = (fullText: string, tempMsgId: number, speed = 10) => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempMsgId
            ? { ...m, text: fullText.slice(0, index), typing: index < fullText.length }
            : m
        )
      );
      if (index >= fullText.length) clearInterval(interval);
    }, speed);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy");
    });
  };

  const handleLike = (id: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, liked: !m.liked, disliked: m.liked ? m.disliked : false }
          : m
      )
    );
  };

  const handleDislike = (id: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, disliked: !m.disliked, liked: m.disliked ? m.liked : false }
          : m
      )
    );
  };

  const handleSend = async (overrideText?: string) => {
    const messageText = overrideText ?? input;
    if (!messageText.trim() && pendingImages.length === 0) return;

    if (pendingImages.length > 0) {
      const previews = [...pendingImagePreviews];
      const userMsg: Message = {
        sender: "user",
        text: messageText || "[Images]",
        images: previews,
        id: messageIdRef.current++,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setPendingImages([]);
      setPendingImagePreviews([]);

      const tempBotMsg: Message = { sender: "bot", text: "", typing: true, id: messageIdRef.current++ };
      setMessages((prev) => [...prev, tempBotMsg]);
      setIsTyping(true);

      try {
        const promises = pendingImages.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = reader.result?.toString().split(",")[1] || "";
                resolve(base64);
              };
              reader.readAsDataURL(file);
            })
        );
        const base64Images = await Promise.all(promises);

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Images, description: messageText }),
        });
        const data = await res.json();
        typeBotMessage(data.reply, tempBotMsg.id, 10);

        // Revoke URLs after display
        setTimeout(() => {
          previews.forEach(URL.revokeObjectURL);
        }, 1000);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempBotMsg.id
              ? { sender: "bot", text: "Error: Could not analyze images.", id: tempBotMsg.id, typing: false }
              : m
          )
        );
      } finally {
        setIsTyping(false);
      }
      return;
    }

    const userMessage: Message = { sender: "user", text: messageText, id: messageIdRef.current++ };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const tempBotMsg: Message = { sender: "bot", text: "", typing: true, id: messageIdRef.current++ };
    setMessages((prev) => [...prev, tempBotMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });
      const data = await res.json();
      typeBotMessage(data.reply, tempBotMsg.id, 10);
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempBotMsg.id
            ? { sender: "bot", text: "Error: Could not get response.", id: tempBotMsg.id, typing: false }
            : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPendingImages((prev) => [...prev, ...files]);
    setPendingImagePreviews((prev) => [...prev, ...previews]);
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
    setPendingImagePreviews((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      // Revoke removed URL
      URL.revokeObjectURL(prev[index]);
      return filtered;
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      setIsExpanded(textareaRef.current.scrollHeight > 40);
      textareaRef.current.style.overflowY =
        textareaRef.current.scrollHeight > 200 ? "auto" : "hidden";
    }
  }, [input]);

  useEffect(() => {
    const chat = chatContainerRef.current;
    if (!chat) return;
    const isNearBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight < 100;
    if (isNearBottom) chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser does not support Speech Recognition");

    setIsRecording(true);
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;

    let finalTranscript = "";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript + " ";
        else interimTranscript += transcript;
      }
      setInput(finalTranscript + interimTranscript);
    };
    recognition.onend = () => {
      setIsRecording(false);
      const trimmed = finalTranscript.trim();
      if (trimmed) handleSend(trimmed);
    };
    recognition.start();
  };

  useEffect(() => {
    if (messages.length === 0) {
      const initId = messageIdRef.current++;
      const initMsg: Message = { sender: "bot", text: "", typing: true, id: initId };
      setMessages([initMsg]);
      setIsTyping(true);
      typeBotMessage("Hello! I'm Ultimi AI, your helpful assistant. How can I help you today?", initId, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 flex flex-col items-center h-screen overflow-hidden relative">
        <head>
        <title>Ultimi Ai | Ultimi</title>
        <meta name="description" content="Learn more about us." />
      </head>
      <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-800 to-blue-400 bg-clip-text text-transparent tracking-tight">
        Ultimi Ai
      </h1>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="chat-container flex-1 mb-24 flex flex-col w-full md:w-2/3 gap-16 overflow-y-auto relative z-10"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in group relative`}
          >
            <div
              className={`relative px-4 py-2 rounded-xl break-words max-w-[65ch] w-full sm:w-auto ${
                msg.sender === "user"
                  ? "bg-blue-50 text-gray-700 shadow-md px-4 py-2 rounded-xl"
                  : "text-gray-900 dark:text-gray-200 prose prose-sm dark:prose-invert whitespace-pre-wrap"
              }`}
            >
              {msg.images?.map((img, i) => (
                <Image
                  key={i}
                  src={img}
                  alt="Uploaded"
                  width={200}
                  height={200}
                  className="rounded-md mb-2 object-cover"
                  priority
                />
              ))}

              {msg.sender === "bot" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text}
                </ReactMarkdown>
              ) : (
                msg.text
              )}

              {msg.sender === "bot" && msg.typing && <span className="animate-blink">|</span>}

              {/* User hover icons (outside bubble) */}
              {msg.sender === "user" && (
                <div className="absolute -bottom-6 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all pointer-events-auto">
                  <button title="Copy" onClick={() => handleCopy(msg.text)} className="hover:scale-110">
                    <Copy className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                  </button>
                  <button title="Edit" className="hover:scale-110">
                    <Edit className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                  </button>
                </div>
              )}

              {/* Bot icons (outside bubble) */}
              {msg.sender === "bot" && !msg.typing && (
                <div className="absolute -bottom-6 right-3 flex gap-2 translate-y-0 transition-all">
                  <button title="Copy" onClick={() => handleCopy(msg.text)} className="hover:scale-110">
                    <Copy className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                  </button>
                  <button title="Like" onClick={() => handleLike(msg.id)} className="hover:scale-110">
                    <ThumbsUp className={`w-4 h-4 ${msg.liked ? "text-blue-500" : "text-gray-700 dark:text-gray-200"}`} />
                  </button>
                  <button title="Dislike" onClick={() => handleDislike(msg.id)} className="hover:scale-110">
                    <ThumbsDown className={`w-4 h-4 ${msg.disliked ? "text-red-500" : "text-gray-700 dark:text-gray-200"}`} />
                  </button>
                  <button title="Regenerate" className="hover:scale-110">
                    <RefreshCw className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-20 w-full flex justify-center z-10  sm:bottom-6">
        <div
          className="flex flex-col items-start bg-background dark:bg-gray-900 border border-border shadow-lg md:w-1/2 w-[90%] px-3"
          style={{
            borderRadius:
              isExpanded || pendingImagePreviews.length > 0 ? "1rem" : "9999px",
            paddingTop:
              isExpanded || pendingImagePreviews.length > 0 ? "0.75rem" : "0.5rem",
            paddingBottom:
              isExpanded || pendingImagePreviews.length > 0 ? "0.75rem" : "0.5rem",
            transition: "border-radius 0.3s ease, padding 0.3s ease",
          }}
        >
          {pendingImagePreviews.length > 0 && (
            <div className="flex gap-2 mb-2">
              {pendingImagePreviews.map((img, i) => (
                <div
                  key={i}
                  className="relative w-24 h-24 border border-gray-400 rounded-md overflow-hidden"
                >
                  <Image
                    src={img}
                    alt="Pending"
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                  />
                  <button
                    onClick={() => removePendingImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end w-full">
            <label className="flex-shrink-0 flex items-center justify-center bg-primary/60 hover:bg-primary transition p-2 rounded-full mr-2 cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-image-icon drop-shadow-md"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
              className="flex-1 resize-none overflow-hidden bg-transparent focus:outline-none focus:ring-0 p-2 rounded-none border-none shadow-none text-sm text-gray-700 dark:text-gray-200"
              rows={1}
            />
            <button
              onClick={startListening}
              className="flex-shrink-0 flex items-center justify-center bg-primary/60 hover:bg-primary transition p-2 rounded-full ml-2 relative"
            >
              {isRecording && (
                <>
                  <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping-ripple"></span>
                  <span className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-50 animate-ping-ripple delay-200"></span>
                </>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-mic-icon drop-shadow-md relative z-10"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
            <button
              onClick={() => handleSend()}
              className="flex-shrink-0 flex items-center justify-center bg-primary/60 hover:bg-primary transition p-2 rounded-full ml-2 shadow-md"
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
        </div>
      </div>

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
        .animate-ping-ripple {
          animation: ping-ripple 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping-ripple {
          0% {
            transform: scale(0.8);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.3;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.6;
          }
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}