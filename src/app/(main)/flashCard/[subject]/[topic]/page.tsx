"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronDown } from "lucide-react";

const flashcards = [
  { question: "What is the atomic number of oxygen?", answer: "The atomic number of oxygen is 8." },
  { question: "What is Newton's second law of motion?", answer: "Force equals mass times acceleration (F = ma)." },
  { question: "What is the powerhouse of the cell?", answer: "The mitochondrion." },
];

export default function FlashcardsPage() {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(1);
  const [autoRead, setAutoRead] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [speakerActive, setSpeakerActive] = useState(false); // track speaker clicked
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();

      const zira = availableVoices.find(v => v.name.toLowerCase().includes("zira"));
      const googleUK = availableVoices.find(v => v.name.toLowerCase().includes("uk english"));
      const mark = availableVoices.find(v => v.name.toLowerCase().includes("mark"));
      const david = availableVoices.find(v => v.name.toLowerCase().includes("david"));
      const susan = availableVoices.find(v => v.name.toLowerCase().includes("susan"));

      const orderedVoices = [zira, susan, googleUK, mark, david].filter(Boolean) as SpeechSynthesisVoice[];

      setVoices(orderedVoices);
      if (orderedVoices.length > 0) setSelectedVoice(orderedVoices[0]);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speakCard = () => {
    if (!autoRead || !selectedVoice) return;
    const textToRead = flipped ? flashcards[current].answer : flashcards[current].question;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.voice = selectedVoice;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (autoRead) speakCard();
  }, [current, flipped, autoRead, selectedVoice]);

  const nextCard = () => {
    setFlipped(false);
    setDirection(1);
    setCurrent((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setFlipped(false);
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const getDisplayName = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase();
    if (name.includes("zira")) return "Zira";
    if (name.includes("susan")) return "Susan";
    if (name.includes("uk english")) return "Google UK";
    if (name.includes("mark")) return "Mark";
    if (name.includes("david")) return "David";
    return voice.name;
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Flashcards</h1>

      <div className="w-77 h-90 relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            className="w-full h-full cursor-pointer rounded-xl bg-white shadow-md flex items-center justify-center absolute top-0 left-0"
            style={{ perspective: 1000 }}
            animate={{ rotateY: flipped ? 180 : 0, rotateX: 2, x: 0, opacity: 1 }}
            initial={{ x: direction === 1 ? "100%" : "-100%", opacity: 0 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.5 }}
            onClick={() => setFlipped(!flipped)}
            whileHover={{ scale: 1.03, boxShadow: "0px 8px 20px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Card Text */}
            <AnimatePresence mode="wait">
              <motion.p
                key={flipped ? "answer" : "question"}
                className="absolute inset-0 flex items-center justify-center text-center text-lg font-medium px-4 break-words text-black dark:text-black"
                style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {flipped ? flashcards[current].answer : flashcards[current].question}
              </motion.p>
            </AnimatePresence>

            {/* Speaker Icon */}
            <motion.div
              className={`absolute bottom-2 right-2 cursor-pointer p-1 rounded-full flex items-center z-30 hover:bg-gray-200`}
              style={{ rotateY: flipped ? 180 : 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setAutoRead(!autoRead);
                setSpeakerActive(!speakerActive); // toggle clicked state
              }}
            >
              <Volume2
                className={`w-6 h-6 ${speakerActive ? "text-blue-500" : "text-gray-600"}`}
              />
            </motion.div>

            {/* Dropdown Icon */}
            <motion.div
              className="absolute top-2 right-2 cursor-pointer p-1 hover:bg-gray-100 rounded-full z-30 dropdown-wrapper"
              style={{ rotateY: flipped ? 180 : 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
            >
              <ChevronDown
                className={`w-4 h-4 dropdown-icon ${dropdownOpen ? "text-blue-500" : "text-gray-600"}`}
              />
            </motion.div>

            {/* Animated Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0, rotateY: flipped ? 180 : 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-8 right-2 z-40 flex flex-col gap-1"
                >
                  {voices.map((voice) => (
                    <motion.div
                      key={voice.name}
                      className={`px-2 py-1 text-xs rounded-md shadow w-24 truncate text-center cursor-pointer
                        ${selectedVoice?.name === voice.name ? "bg-blue-200 text-blue-700" : "bg-blue-50 text-gray-700"}
                        hover:bg-blue-100 transition-colors duration-150`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVoice(voice);
                        setDropdownOpen(false);
                      }}
                      title={voice.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {getDisplayName(voice)}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6 w-96 justify-center">
        <Button onClick={prevCard}>Previous</Button>
        <Button onClick={nextCard}>Next</Button>
      </div>

      {/* Card Counter */}
      <p className="mt-4 text-sm text-gray-500 w-96 text-center">
        Card {current + 1} of {flashcards.length}
      </p>
    </div>
  );
}

