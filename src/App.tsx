/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  BookOpen,
  MessageSquare,
  RotateCcw,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Play,
  Pause,
  Info,
} from "lucide-react";
import { Message } from "./types";
import { AudioOrb } from "./components/AudioOrb";
import { ResumeDossier } from "./components/ResumeDossier";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function App() {
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [assistantState, setAssistantState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"assistant" | "dossier">("assistant");
  const [greetingAudio, setGreetingAudio] = useState<string | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMicAvailable, setIsMicAvailable] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === "fr" ? "fr-FR" : "en-US";

      recognition.onstart = () => {
        setAssistantState("listening");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        setAssistantState("idle");
      };

      recognition.onend = () => {
        if (assistantState === "listening") {
          setAssistantState("idle");
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsMicAvailable(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  // Fetch initial greeting on mount or language change
  useEffect(() => {
    const initGreeting = async () => {
      try {
        const res = await fetch(`/api/greeting?lang=${language}`);
        const data = await res.json();
        
        const initialMsg: Message = {
          id: "greeting-" + language,
          role: "assistant",
          text: data.text || (language === "fr" 
            ? "Bonjour, je suis Sat, l'assistante de Satine. Que souhaiteriez-vous savoir à son sujet ?"
            : "Hello, I am Sat's assistant, what would you like to know about him/her ?"),
          audioBase64: data.audio || null,
          language: language,
          timestamp: new Date(),
        };

        setGreetingAudio(data.audio || null);
        setMessages([initialMsg]);
      } catch (err) {
        console.warn("Greeting fetch fallback:", err);
        const fallbackText = language === "fr"
          ? "Bonjour, je suis Sat, l'assistante de Satine. Que souhaiteriez-vous savoir à son sujet ?"
          : "Hello, I am Sat's assistant, what would you like to know about him/her ?";
        setMessages([
          {
            id: "greeting-default",
            role: "assistant",
            text: fallbackText,
            language: language,
            timestamp: new Date(),
          },
        ]);
      }
    };

    initGreeting();
  }, [language]);

  // Scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Play audio helper with fallback to SpeechSynthesis
  const playAudio = (base64Audio: string | null | undefined, textFallback: string, messageId: string) => {
    // Stop any existing playing audio
    stopAudio();

    if (base64Audio) {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audioPlayerRef.current = audio;
      setAssistantState("speaking");
      setCurrentlyPlayingId(messageId);

      audio.onended = () => {
        setAssistantState("idle");
        setCurrentlyPlayingId(null);
      };

      audio.onerror = () => {
        setAssistantState("idle");
        setCurrentlyPlayingId(null);
      };

      audio.play().catch(() => {
        setAssistantState("idle");
        setCurrentlyPlayingId(null);
      });
    } else if ("speechSynthesis" in window) {
      // Fallback to browser TTS if server audio is unavailable
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textFallback);
      utterance.lang = language === "fr" ? "fr-FR" : "en-US";
      utterance.pitch = 0.85; // Deep female voice
      utterance.rate = 0.95; // Poised luxury cadence

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find((v) => 
        (language === "fr" ? v.lang.startsWith("fr") : v.lang.startsWith("en")) &&
        (v.name.includes("Female") || v.name.includes("Amélie") || v.name.includes("Samantha") || v.name.includes("Natural"))
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      setAssistantState("speaking");
      setCurrentlyPlayingId(messageId);

      utterance.onend = () => {
        setAssistantState("idle");
        setCurrentlyPlayingId(null);
      };

      utterance.onerror = () => {
        setAssistantState("idle");
        setCurrentlyPlayingId(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setAssistantState("idle");
    setCurrentlyPlayingId(null);
  };

  const handleMicToggle = () => {
    if (assistantState === "listening") {
      recognitionRef.current?.stop();
      setAssistantState("idle");
      return;
    }

    if (assistantState === "speaking") {
      stopAudio();
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language === "fr" ? "fr-FR" : "en-US";
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Speech recognition restart notice:", err);
      }
    } else {
      alert(
        language === "fr"
          ? "La reconnaissance vocale n'est pas activée sur ce navigateur. Vous pouvez taper votre question ci-dessous."
          : "Speech recognition is not available on this browser. You can type your query in the field below."
      );
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    stopAudio();

    const userMessage: Message = {
      id: "user-" + Date.now(),
      role: "user",
      text: trimmed,
      language: language,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setAssistantState("thinking");

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversationHistory: historyPayload,
          voiceEnabled: voiceEnabled,
        }),
      });

      if (!res.ok) throw new Error("Failed response");
      const data = await res.json();

      const assistantMsg: Message = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        text: data.reply,
        audioBase64: data.audio || null,
        language: data.language || language,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically play speech if voice is enabled
      if (voiceEnabled) {
        playAudio(data.audio, data.reply, assistantMsg.id);
      } else {
        setAssistantState("idle");
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: Message = {
        id: "error-" + Date.now(),
        role: "assistant",
        text: language === "fr"
          ? "Satine a acquis une solide expertise chez Lanvin et à l'ESCE. Que souhaitez-vous approfondir ?"
          : "Satine developed solid expertise at Lanvin and ESCE Paris. What would you like to explore next?",
        language: language,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setAssistantState("idle");
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const curatedQuestions = language === "fr"
    ? [
        "Parle-moi de son expérience chez Lanvin dans le luxe",
        "Quelles sont ses compétences logistiques et SAP / Zendesk ?",
        "Présente sa formation Grandes Écoles à l'ESCE",
        "Quels sont ses centres d'intérêt culturels et cinéma ?",
        "Comment puis-je contacter Satine pour un entretien ?",
      ]
    : [
        "Detail Satine's experience at Maison Lanvin in luxury logistics",
        "What are her key skills in client relations, SAP & Zendesk?",
        "Tell me about her education at ESCE International Business School",
        "What are her cultural passions and cinema experiences?",
        "How can I contact Satine for an interview or internship?",
      ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1F1E1B] flex flex-col font-serif-body">
      {/* Top Editorial Luxury Header */}
      <header className="border-b border-[#E8E2D6] bg-[#FBF9F5]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand & Persona Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1F1E1B] text-[#FBF9F5] flex items-center justify-center font-serif-display text-lg font-medium tracking-tight shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-display text-xl sm:text-2xl font-semibold tracking-tight text-[#1A1816]">
                  Sat
                </h1>
                <span className="text-xs font-sans-ui text-[#8A8172]">/</span>
                <span className="text-xs font-sans-ui text-[#706758] tracking-wide">
                  Satine Liotaud Voice Assistant
                </span>
              </div>
              <p className="text-[11px] font-sans-ui text-[#8C8476] hidden sm:block">
                Deep female voice · American & Parisian French accents
              </p>
            </div>
          </div>

          {/* Controls: Language, Voice Toggle, Dossier Tab */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Switcher (Desktop or Mobile) */}
            <div className="flex items-center p-0.5 bg-[#EFE9DD] rounded-lg border border-[#E0D8CA] text-xs font-sans-ui">
              <button
                onClick={() => setActiveTab("assistant")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === "assistant"
                    ? "bg-[#FAF7F2] text-[#1F1E1B] shadow-xs font-medium"
                    : "text-[#6B6355] hover:text-[#1F1E1B]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{language === "fr" ? "Assistant Vocal" : "Voice Sat"}</span>
              </button>
              <button
                onClick={() => setActiveTab("dossier")}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === "dossier"
                    ? "bg-[#FAF7F2] text-[#1F1E1B] shadow-xs font-medium"
                    : "text-[#6B6355] hover:text-[#1F1E1B]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{language === "fr" ? "Dossier & CV" : "Resume Dossier"}</span>
              </button>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => {
                const nextLang = language === "en" ? "fr" : "en";
                setLanguage(nextLang);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#DCD5C7] rounded-md text-xs font-sans-ui text-[#38332B] hover:bg-[#F2ECE1] transition-colors"
              title={language === "en" ? "Switch to French" : "Passer en anglais"}
            >
              <Globe className="w-3.5 h-3.5 text-[#8C7654]" />
              <span className="font-medium">{language.toUpperCase()}</span>
            </button>

            {/* Voice Audio On/Off */}
            <button
              onClick={() => {
                if (voiceEnabled) stopAudio();
                setVoiceEnabled(!voiceEnabled);
              }}
              className={`p-2 border rounded-md transition-colors ${
                voiceEnabled
                  ? "border-[#DCD5C7] text-[#2C2720] hover:bg-[#F2ECE1]"
                  : "border-[#E5DDD0] text-[#A69E90] hover:text-[#5E574B]"
              }`}
              title={voiceEnabled ? "Voice playback active" : "Voice playback muted"}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-[#8C7654]" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        {activeTab === "dossier" ? (
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-widest font-sans-ui font-semibold text-[#8C7654]">
                {language === "fr" ? "Curriculum Vitae Officiel" : "Official Dossier & Credentials"}
              </p>
              <button
                onClick={() => setActiveTab("assistant")}
                className="text-xs font-sans-ui text-[#595144] hover:text-[#1F1E1B] underline"
              >
                {language === "fr" ? "Retour à la conversation vocale →" : "Return to voice dialogue →"}
              </button>
            </div>
            <ResumeDossier
              language={language}
              onAskTopic={(prompt) => {
                setActiveTab("assistant");
                handleSendMessage(prompt);
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
            {/* Left Column: Voice Orb & Interactive Persona Stage */}
            <div className="lg:col-span-5 flex flex-col items-center justify-between bg-[#FAF7F2] border border-[#E8E2D6] rounded-2xl p-6 sm:p-8">
              {/* Persona Editorial Header */}
              <div className="w-full text-center space-y-1 border-b border-[#E8E2D6]/70 pb-4">
                <span className="text-[11px] uppercase tracking-widest font-sans-ui text-[#8C7654] font-medium">
                  {language === "fr" ? "Représentante Vocale" : "Voice Representative"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#1A1816]">
                  Sat
                </h2>
                <p className="text-xs font-serif-body italic text-[#6B6357]">
                  {language === "fr"
                    ? "Assistante dédiée à Satine Liotaud"
                    : "Official voice for Satine Liotaud"}
                </p>
              </div>

              {/* Central Voice Visualizer Orb */}
              <div className="my-6">
                <AudioOrb
                  state={assistantState}
                  language={language}
                  isMicSupported={isMicAvailable}
                  onMicClick={handleMicToggle}
                  onStopSpeaking={stopAudio}
                />
              </div>

              {/* Greeting Voice Playback Trigger */}
              <div className="w-full bg-[#F3EDE2] border border-[#E2D9CA] rounded-xl p-3.5 flex items-center justify-between text-xs font-sans-ui text-[#4A4337]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8C7654] shrink-0" />
                  <span className="font-serif-body text-xs sm:text-sm">
                    {language === "fr"
                      ? "« Bonjour, je suis Sat... »"
                      : "“Hello, I am Sat's assistant...”"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const firstMsg = messages[0];
                    if (firstMsg) {
                      playAudio(firstMsg.audioBase64 || greetingAudio, firstMsg.text, firstMsg.id);
                    }
                  }}
                  className="px-2.5 py-1 bg-[#1F1E1B] text-[#FAF7F2] rounded-md text-[11px] font-sans-ui hover:bg-[#38342E] transition-colors flex items-center gap-1 shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{language === "fr" ? "Écouter l'accueil" : "Play Greeting"}</span>
                </button>
              </div>

              {/* Satine's Highlights Mini-Card */}
              <div className="w-full mt-4 pt-4 border-t border-[#E8E2D6]/70 text-xs font-sans-ui text-[#6B6357] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#383229]">
                    {language === "fr" ? "Maison LANVIN" : "LANVIN Luxury"}
                  </span>
                  <span>{language === "fr" ? "Logistique & SAV" : "Logistics & Client Relations"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#383229]">ESCE Paris</span>
                  <span>{language === "fr" ? "Commerce International (BAC+5)" : "International Business (BAC+5)"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#383229]">
                    {language === "fr" ? "Langues" : "Languages"}
                  </span>
                  <span>{language === "fr" ? "Français (Nat.), Anglais (B1)" : "French (Native), English (B1)"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dialogue Stream & Controls */}
            <div className="lg:col-span-7 flex flex-col bg-[#FAF7F2] border border-[#E8E2D6] rounded-2xl p-4 sm:p-6 h-[620px]">
              {/* Dialogue Header */}
              <div className="flex items-center justify-between border-b border-[#E8E2D6] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-display text-lg font-medium text-[#1A1816]">
                    {language === "fr" ? "Échange Vocal & Transcriptions" : "Voice Conversation"}
                  </h3>
                  <span className="text-xs font-sans-ui text-[#8C8375]">
                    ({messages.length} {messages.length === 1 ? "entry" : "entries"})
                  </span>
                </div>

                {messages.length > 1 && (
                  <button
                    onClick={() => {
                      stopAudio();
                      const firstMsg = messages[0];
                      setMessages(firstMsg ? [firstMsg] : []);
                    }}
                    className="text-xs font-sans-ui text-[#7A7163] hover:text-[#1F1E1B] flex items-center gap-1 transition-colors"
                    title={language === "fr" ? "Réinitialiser la conversation" : "Reset conversation"}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{language === "fr" ? "Effacer" : "Reset"}</span>
                  </button>
                )}
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {messages.map((msg) => {
                  const isAssistant = msg.role === "assistant";
                  const isPlayingThis = currentlyPlayingId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
                    >
                      {/* Speaker Label */}
                      <span className="text-[11px] font-sans-ui text-[#857C6F] mb-1 px-1">
                        {isAssistant ? "Sat (Voice Assistant)" : "You"}
                      </span>

                      {/* Bubble */}
                      <div
                        className={`max-w-[90%] sm:max-w-[85%] rounded-xl p-4 text-sm sm:text-base leading-relaxed ${
                          isAssistant
                            ? "bg-[#F4EFE6] border border-[#E2DBD0] text-[#1F1D1A]"
                            : "bg-[#25221E] text-[#FBF9F5] shadow-xs"
                        }`}
                      >
                        <p className="font-serif-body">{msg.text}</p>

                        {/* Assistant Audio Action Bar */}
                        {isAssistant && (
                          <div className="mt-3 pt-2.5 border-t border-[#E5DFD4] flex items-center justify-between text-xs font-sans-ui text-[#6E6659]">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (isPlayingThis) {
                                    stopAudio();
                                  } else {
                                    playAudio(msg.audioBase64, msg.text, msg.id);
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-[#8C7654] hover:text-[#6E5A3D] font-medium"
                              >
                                {isPlayingThis ? (
                                  <>
                                    <Pause className="w-3.5 h-3.5 fill-current" />
                                    <span>{language === "fr" ? "Arrêter la voix" : "Stop Voice"}</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>{language === "fr" ? "Écouter Sat" : "Replay Voice"}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <button
                              onClick={() => handleCopyText(msg.id, msg.text)}
                              className="text-[#8A8172] hover:text-[#25221E] transition-colors"
                              title="Copy text"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {assistantState === "thinking" && (
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-sans-ui text-[#857C6F] mb-1 px-1">Sat</span>
                    <div className="bg-[#F4EFE6] border border-[#E2DBD0] rounded-xl p-3.5 flex items-center gap-2 text-xs font-sans-ui text-[#70675A]">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C7654] animate-bounce" />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#8C7654] animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#8C7654] animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="font-serif-body italic">
                        {language === "fr"
                          ? "Sat prépare sa réponse vocale..."
                          : "Sat is generating response..."}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Curated Suggested Prompts */}
              <div className="pt-3 border-t border-[#E8E2D6] mb-3">
                <p className="text-[10px] uppercase tracking-wider font-sans-ui font-medium text-[#8A8172] mb-1.5">
                  {language === "fr" ? "Questions suggérées :" : "Suggested inquiries:"}
                </p>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {curatedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-[11px] font-sans-ui px-2.5 py-1 rounded-md bg-[#EFE9DD] hover:bg-[#E5DDD0] text-[#363129] border border-[#DDD5C7] whitespace-nowrap transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input & Mic Control Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      language === "fr"
                        ? "Posez votre question sur Satine (ou cliquez sur le micro)..."
                        : "Ask anything about Satine (or tap the microphone)..."
                    }
                    className="w-full bg-[#FAF7F2] border border-[#D5CDBC] focus:border-[#8C7654] focus:ring-1 focus:ring-[#8C7654] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-serif-body text-[#1F1E1B] placeholder-[#9E9586] focus:outline-none transition-colors"
                  />
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-3.5 py-2.5 bg-[#25221E] hover:bg-[#3B3630] disabled:opacity-40 disabled:hover:bg-[#25221E] text-[#FBF9F5] rounded-lg transition-colors flex items-center justify-center shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Minimalist Editorial Footer */}
      <footer className="border-t border-[#E8E2D6] py-4 bg-[#FBF9F5] text-xs font-sans-ui text-[#7A7163]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-serif-display font-medium text-[#292520]">
              Satine Liotaud Portfolio
            </span>
            <span>·</span>
            <span>ESCE Paris La Défense</span>
            <span>·</span>
            <span>Maison LANVIN Experience</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="mailto:satine.liotaud@yahoo.com"
              className="hover:text-[#1F1E1B] transition-colors"
            >
              satine.liotaud@yahoo.com
            </a>
            <a
              href="https://www.linkedin.com/in/satine-liotaud-195528253"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1F1E1B] transition-colors flex items-center gap-1"
            >
              <span>LinkedIn</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
