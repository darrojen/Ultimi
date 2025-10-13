// import { NextResponse } from "next/server";
// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({}); 

// let chatHistory: { role: "user" | "bot"; text: string }[] = [];

// export async function POST(req: Request) {
//   try {
//     const { message, imageBase64, description, reset } = await req.json();

//     if (reset) {
//       chatHistory = [];
//       return NextResponse.json({ reply: "Chat history cleared successfully ✅" });
//     }

//     const moods = {
//       friendly: [
//         "Sure thing! Let’s look at that together.",
//         "Of course! That’s a nice one.",
//         "Definitely — I like where this is going!",
//         "Absolutely! Let’s keep this simple and clear.",
//         "Great! Let’s explore that in a friendly way.",
//       ],
//       curious: [
//         "That’s a fascinating question!",
//         "Interesting! Let’s dig a little deeper.",
//         "Hmm, I love questions like this!",
//         "Ooh, this sounds intriguing — let’s break it down.",
//         "I was hoping you’d ask something like this!",
//       ],
//       encouraging: [
//         "Nice one! You’re doing great asking this.",
//         "Brilliant question — let’s unpack it together.",
//         "Love that curiosity! Here’s what to know:",
//         "That’s the kind of question smart learners ask!",
//         "Fantastic — let’s make this super easy to grasp.",
//       ],
//     };

//     const moodTypes = Object.keys(moods);
//     const selectedMood = moodTypes[Math.floor(Math.random() * moodTypes.length)];
//     const moodIntros = moods[selectedMood];
//     const randomIntro = moodIntros[Math.floor(Math.random() * moodIntros.length)];

//     let systemPrompt = `
// You are **ULTIMI Ai** — a smart, friendly, and conversational assistant created by Greg Okehie.
// Speak naturally like a helpful human companion — warm, confident, and encouraging.

// Never introduce yourself repeatedly in every message.
// You should only say “Hey, I’m Ultimi Ai 😊” once — at the very start of a new conversation (when there is no chat history).
// If the user later asks for your name, answer politely as usual.

// If asked "Who created you?", say "I was created by Greg Okehie, the amazing developer behind me."
// Keep responses clear, kind, and human-like. You remember previous messages in this chat.

// 🧩 **Response Behavior Rules**
// Before answering, start with a natural short opener that sets the tone:
// "${randomIntro}"

// Then continue your answer following these **style and formatting rules**:

// 1. If the user's message starts with **"Define"** →  
//    - Provide a short **2–3 line definition only**.  
//    - Start with a **bold header** like:  
//      **Definition — [Term]**  
//    - Keep the explanation short and clear.

// 2. If the user's message starts with **"What is"** →  
//    - Give a compact **3–5 line explanation**.  
//    - Begin with a **bold header** like:  
//      **What is [Term]?**  
//    - Use simple, easy-to-read sentences.

// 3. If the user's message starts with **"Explain"**, **"Tell me about"**, **"Note on"**, or **"Short note on"** → answer in **note style**:
//    - Use headers or subheadings in **bold**.
//    - Use bullet points (•) or expressive icons like ✅❌🔷🚀🟢🟡🔹🔸 where appropriate.
//    - Use short, readable paragraphs.
//    - When listing pros, cons, features, or facts — mix in icons for readability.

// 4. For all other messages → respond naturally but still structured and readable.

// 🪶 **Formatting & Style**
// - Always break your text into paragraphs for readability.
// - Use **bold text** for key terms or section titles.
// - Use icons ✅❎🚀🟢🔷🔸 to highlight points or emphasize tone.
// - Never output long walls of text — keep it easy on the eyes.
// - Maintain a positive, friendly, and conversational tone throughout.
// `;

//     // 🆕 Add one-time introduction for first message
//     if (chatHistory.length === 0) {
//       systemPrompt += `
// This is the start of a new chat. Begin your first reply with a friendly introduction, for example:
// "Hey, I'm ULTIMI Ai 😊, how can I help you today?"
// `;
//     }

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const contents: any[] = [{ text: systemPrompt }];

//     chatHistory.forEach((msg) => {
//       contents.push({ text: `${msg.role === "user" ? "User" : "ULTIMI Ai"}: ${msg.text}` });
//     });

//     // 🖼️ Handle images if provided
//     if (imageBase64 && imageBase64.length > 0) {
//       const imageParts = imageBase64.map((b64: string) => ({
//         inlineData: { data: b64, mimeType: "image/png" },
//       }));

//       contents.push(
//         {
//           text:
//             `User sent image${imageBase64.length > 1 ? "s" : ""}. ${
//               description ? "Description: " + description : ""
//             }\nPlease describe or analyze them in clear structured points.`,
//         },
//         ...imageParts
//       );
//     } else if (message) {
//       contents.push({ text: `User: ${message}` });
//     }

//     // ✨ Generate content using Gemini
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents,
//     });

//     const reply =
//       response.response?.text?.trim?.() ||
//       response.text?.trim?.() ||
//       "No reply from AI.";

//     // 💾 Save conversation
//     if (message || description) {
//       chatHistory.push({
//         role: "user",
//         text: description ? `[Image] ${description}` : message || "[Image]",
//       });
//     }

//     chatHistory.push({ role: "bot", text: reply });

//     // 🧹 Limit chat history
//     if (chatHistory.length > 40) chatHistory.splice(0, chatHistory.length - 40);

//     return NextResponse.json({ reply });
//   } catch (err) {
//     console.error("Gemini API error:", err);
//     return NextResponse.json({ reply: "Error: Could not get response." });
//   }
// }




// import { NextResponse } from "next/server";
// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({}); 

// let chatHistory: { role: "user" | "bot"; text: string }[] = [];

// export async function POST(req: Request) {
//   try {
//     const { message, imageBase64, description, reset } = await req.json();

//     if (reset) {
//       chatHistory = [];
//       return NextResponse.json({ reply: "Chat history cleared successfully ✅" });
//     }

//     const moods = {
//       friendly: [
//         "Sure thing! Let’s look at that together.",
//         "Of course! That’s a nice one.",
//         "Definitely — I like where this is going!",
//         "Absolutely! Let’s keep this simple and clear.",
//         "Great! Let’s explore that in a friendly way.",
//       ],
//       curious: [
//         "That’s a fascinating question!",
//         "Interesting! Let’s dig a little deeper.",
//         "Hmm, I love questions like this!",
//         "Ooh, this sounds intriguing — let’s break it down.",
//         "I was hoping you’d ask something like this!",
//       ],
//       encouraging: [
//         "Nice one! You’re doing great asking this.",
//         "Brilliant question — let’s unpack it together.",
//         "Love that curiosity! Here’s what to know:",
//         "That’s the kind of question smart learners ask!",
//         "Fantastic — let’s make this super easy to grasp.",
//       ],
//     } as const;

//     const moodTypes = Object.keys(moods) as (keyof typeof moods)[];
//     const selectedMood = moodTypes[Math.floor(Math.random() * moodTypes.length)];
//     const moodIntros = moods[selectedMood];
//     const randomIntro = moodIntros[Math.floor(Math.random() * moodIntros.length)];

//     let systemPrompt = `
// You are **ULTIMI Ai** — a smart, friendly, and conversational assistant created by Greg Okehie.
// Speak naturally like a helpful human companion — warm, confident, and encouraging.

// Do not say who you are unless asked. Never introduce yourself repeatedly in every message.
// You should only say “Hey, I’m Ultimi Ai 😊” once — at the very start of a new conversation (when there is no chat history).
// If the user later asks for your name, answer politely as usual.

// If asked "Who created you?", say "I was created by Greg Okehie, the amazing developer behind me."
// Keep responses clear, kind, and human-like. You remember previous messages in this chat.

// 🧩 **Response Behavior Rules**
// Before answering, start with a natural short opener that sets the tone:
// "${randomIntro}"

// Then continue your answer following these **style and formatting rules**:

// 1. If the user's message starts with **"Define"** →  
//    - Provide a short **2–3 line definition only**.  
//    - Start with a **bold header** like:  
//      **Definition — [Term]**  
//    - Keep the explanation short and clear.

// 2. If the user's message starts with **"What is"** →  
//    - Give a compact **3–5 line explanation**.  
//    - Begin with a **bold header** like:  
//      **What is [Term]?**  
//    - Use simple, easy-to-read sentences.

// 3. If the user's message starts with **"Explain"**, **"Tell me about"**, **"Note on"**, or **"Short note on"** → answer in **note style**:
//    - Use headers or subheadings in **bold**.
//    - Use bullet points (•) or expressive icons like ✅❌🔷🚀🟢🟡🔹🔸 where appropriate.
//    - Use short, readable paragraphs.
//    - When listing pros, cons, features, or facts — mix in icons for readability.

// 4. For all other messages → respond naturally but still structured and readable.

// 🪶 **Formatting & Style**
// - Always break your text into paragraphs for readability.
// - Use **bold text** for key terms or section titles.
// - Use icons ✅❎🚀🟢🔷🔸 to highlight points or emphasize tone.
// - Never output long walls of text — keep it easy on the eyes.
// - Maintain a positive, friendly, and conversational tone throughout.
// `;

//     // 🆕 Add one-time introduction for first message
//     if (chatHistory.length === 0) {
//       systemPrompt += `
// This is the start of a new chat. Begin your first reply with a friendly introduction, for example:
// "Hey, I'm ULTIMI Ai 😊, how can I help you today?"
// `;
//     }

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const contents: any[] = [{ text: systemPrompt }];

//     chatHistory.forEach((msg) => {
//       contents.push({ text: `${msg.role === "user" ? "User" : "ULTIMI Ai"}: ${msg.text}` });
//     });

//     // 🖼️ Handle images if provided
//     if (imageBase64 && imageBase64.length > 0) {
//       const imageParts = imageBase64.map((b64: string) => ({
//         inlineData: { data: b64, mimeType: "image/png" },
//       }));

//       contents.push(
//         {
//           text:
//             `User sent image${imageBase64.length > 1 ? "s" : ""}. ${
//               description ? "Description: " + description : ""
//             }\nPlease describe or analyze them in clear structured points.`,
//         },
//         ...imageParts
//       );
//     } else if (message) {
//       contents.push({ text: `User: ${message}` });
//     }

//     // ✨ Generate content using Gemini
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents,
//     });

//     const reply =
//       response.text?.trim() ||
//       "No reply from AI.";

//     // 💾 Save conversation
//     if (message || description) {
//       chatHistory.push({
//         role: "user",
//         text: description ? `[Image] ${description}` : message || "[Image]",
//       });
//     }

//     chatHistory.push({ role: "bot", text: reply });

//     // 🧹 Limit chat history
//     if (chatHistory.length > 40) chatHistory.splice(0, chatHistory.length - 40);

//     return NextResponse.json({ reply });
//   } catch (err) {
//     console.error("Gemini API error:", err);
//     return NextResponse.json({ reply: "Error: Could not get response." });
//   }
// }

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({}); 

let chatHistory: { role: "user" | "bot"; text: string }[] = [];

export async function POST(req: Request) {
  try {
    const { message, files, description, reset } = await req.json();

    if (reset) {
      chatHistory = [];
      return NextResponse.json({ reply: "Chat history cleared successfully ✅" });
    }

    const moods = {
      friendly: [
        "Sure thing! Let’s look at that together.",
        "Of course! That’s a nice one.",
        "Definitely — I like where this is going!",
        "Absolutely! Let’s keep this simple and clear.",
        "Great! Let’s explore that in a friendly way.",
      ],
      curious: [
        "That’s a fascinating question!",
        "Interesting! Let’s dig a little deeper.",
        "Hmm, I love questions like this!",
        "Ooh, this sounds intriguing — let’s break it down.",
        "I was hoping you’d ask something like this!",
      ],
      encouraging: [
        "Nice one! You’re doing great asking this.",
        "Brilliant question — let’s unpack it together.",
        "Love that curiosity! Here’s what to know:",
        "That’s the kind of question smart learners ask!",
        "Fantastic — let’s make this super easy to grasp.",
      ],
    } as const;

    const moodTypes = Object.keys(moods) as (keyof typeof moods)[];
    const selectedMood = moodTypes[Math.floor(Math.random() * moodTypes.length)];
    const moodIntros = moods[selectedMood];
    const randomIntro = moodIntros[Math.floor(Math.random() * moodIntros.length)];

    let systemPrompt = `
You are **ULTIMI Ai** — a smart, friendly, and conversational assistant created by Greg Okehie.
Speak naturally like a helpful human companion — warm, confident, and encouraging.

Do not say who you are unless asked. Never introduce yourself repeatedly in every message.
You should only say “Hey, I’m Ultimi Ai 😊” once — at the very start of a new conversation (when there is no chat history).
If the user later asks for your name, answer politely as usual.

If asked "Who created you?", say "I was created by Greg Okehie, the amazing developer behind me."
Keep responses clear, kind, and human-like. You remember previous messages in this chat.

🧩 **Response Behavior Rules**
Before answering, start with a natural short opener that sets the tone:
"${randomIntro}"

Then continue your answer following these **style and formatting rules**:

1. If the user's message starts with **"Define"** →  
   - Provide a short **2–3 line definition only**.  
   - Start with a **bold header** like:  
     **Definition — [Term]**  
   - Keep the explanation short and clear.

2. If the user's message starts with **"What is"** →  
   - Give a compact **3–5 line explanation**.  
   - Begin with a **bold header** like:  
     **What is [Term]?**  
   - Use simple, easy-to-read sentences.

3. If the user's message starts with **"Explain"**, **"Tell me about"**, **"Note on"**, or **"Short note on"** → answer in **note style**:
   - Use headers or subheadings in **bold**.
   - Use bullet points (•) or expressive icons like ✅❌🔷🚀🟢🟡🔹🔸 where appropriate.
   - Use short, readable paragraphs.
   - When listing pros, cons, features, or facts — mix in icons for readability.

4. For all other messages → respond naturally but still structured and readable.

🪶 **Formatting & Style**
- Always break your text into paragraphs for readability.
- Use **bold text** for key terms or section titles.
- Use icons ✅❎🚀🟢🔷🔸 to highlight points or emphasize tone.
- Never output long walls of text — keep it easy on the eyes.
- Maintain a positive, friendly, and conversational tone throughout.
`;

    // 🆕 Add one-time introduction for first message
    if (chatHistory.length === 0) {
      systemPrompt += `
This is the start of a new chat. Begin your first reply with a friendly introduction, for example:
"Hey, I'm ULTIMI Ai 😊, how can I help you today?"
`;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contents: any[] = [{ text: systemPrompt }];

    chatHistory.forEach((msg) => {
      contents.push({ text: `${msg.role === "user" ? "User" : "ULTIMI Ai"}: ${msg.text}` });
    });

    // 🖼️ Handle files if provided
    if (files && files.length > 0) {
      const fileParts = files.map((file: { base64: string; mimeType: string }) => ({
        inlineData: { data: file.base64, mimeType: file.mimeType },
      }));

      const fileTypes = files.map((file: { mimeType: string }) => file.mimeType).join(', ');
      contents.push(
        {
          text:
            `User sent file${files.length > 1 ? "s" : ""} (${fileTypes}). ${
              description ? "Description: " + description : ""
            }\nPlease describe or analyze it in clear structured points.`,
        },
        ...fileParts
      );
    } else if (message) {
      contents.push({ text: `User: ${message}` });
    }

    // ✨ Generate content using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const reply =
      response.text?.trim() ||
      "No reply from AI.";

    // 💾 Save conversation
    if (message || files?.length > 0 || description) {
      chatHistory.push({
        role: "user",
        text: description ? `[File] ${description}` : message || files ? "[File]" : "",
      });
    }

    chatHistory.push({ role: "bot", text: reply });

    // 🧹 Limit chat history
    if (chatHistory.length > 40) chatHistory.splice(0, chatHistory.length - 40);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json({ reply: "Error: Could not get response." });
  }
}