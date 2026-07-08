const fs = require('fs');
const file = '/Users/mac/prog/blockchain/portfolio-v2/components/journal/AssistantWidget.tsx';
let code = fs.readFileSync(file, 'utf8');

const newToggle = `
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const [useNativeFallback, setUseNativeFallback] = useState(false);

  const toggleSpeechRecognition = async (): Promise<void> => {
    if (typeof window === "undefined") return;

    if (listening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        return;
      }
      recognitionRef.current?.stop();
      setListening(false);
      setInterimTranscript("");
      return;
    }

    if (!useNativeFallback && navigator.mediaDevices && window.MediaRecorder) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mr.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          stream.getTracks().forEach((t) => t.stop());
          setListening(false);
          setInterimTranscript("Transcribing...");
          try {
            const form = new FormData();
            form.append("audio", audioBlob);
            const res = await fetch("/api/journal/speech", { method: "POST", body: form });
            if (res.status === 501) {
               setUseNativeFallback(true);
               setInterimTranscript("");
               // immediately try native
               startNativeSpeech();
               return;
            }
            if (!res.ok) throw new Error("API failed");
            const data = await res.json() as { transcript: string };
            if (data.transcript) {
              void handleSendMessage(data.transcript);
            }
          } catch (err) {
             console.error("[journal/assistant] Speech API error:", err);
             setMessages((prev) => [...prev, { role: "assistant", content: "Voice recognition failed. Please try again." }]);
          } finally {
            setInterimTranscript("");
          }
        };
        mediaRecorderRef.current = mr;
        mr.start();
        setListening(true);
        return;
      } catch (err) {
        console.error("Mic error:", err);
        setUseNativeFallback(true);
      }
    }

    startNativeSpeech();
  };

  const startNativeSpeech = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Voice input isn't supported in this browser — try Chrome or Safari." },
      ]);
      return;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      setInterimTranscript(interim);
      if (final) {
        setInterimTranscript("");
        setListening(false);
        void handleSendMessage(final.trim());
      }
    };

    rec.onerror = (e) => {
      console.error("[journal/assistant] speech error:", e);
      setListening(false);
      setInterimTranscript("");
    };

    rec.onend = () => {
      setListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };
`;

code = code.replace(
  /const toggleSpeechRecognition = \(\): void => \{[\s\S]*?rec\.start\(\);\n    setListening\(true\);\n  \};/,
  newToggle.trim()
);

// We also need to add useRef, useEffect, useState imports if they aren't there, but they already are:
// import { useState, useRef, useEffect } from "react";
// So we just need to add the mediaRecorderRef and audioChunksRef logic, wait, they are added in the replacement string, but they should be at the top of the component!

// Let's modify the file properly.

const componentRefs = `
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const [useNativeFallback, setUseNativeFallback] = useState(false);
`;

code = code.replace(
  /const bottomRef = useRef<HTMLDivElement>\(null\);\n  const inputRef = useRef<HTMLTextAreaElement>\(null\);\n  const recognitionRef = useRef<SpeechRecognitionInstance \| null>\(null\);/,
  componentRefs.trim()
);

// We need to remove the internal refs from the toggle block to avoid duplicate declaration
const cleanToggle = newToggle.replace(/const mediaRecorderRef.*\n  const audioChunksRef.*\n  const \[useNativeFallback.*/, '');

code = code.replace(
  /const toggleSpeechRecognition = \(\): void => \{[\s\S]*?rec\.start\(\);\n    setListening\(true\);\n  \};/,
  cleanToggle.trim()
);

// Also change the onClick handler
code = code.replace(/onClick=\{toggleSpeechRecognition\}/g, 'onClick={() => void toggleSpeechRecognition()}');

fs.writeFileSync(file, code, 'utf8');
