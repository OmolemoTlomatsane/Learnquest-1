import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mic, Volume2, RotateCcw } from "lucide-react";

interface ChatMessage {
  text: string;
  isAI: boolean;
}

const ArgumentCenter = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognition = useRef<any>(null);
  const synthesis = useRef<SpeechSynthesis | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state?.documentText) {
      navigate("/dashboard");
    }

    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserInput(transcript);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    synthesis.current = window.speechSynthesis;

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUserInput = async (text: string) => {
    // Add user message
    setMessages(prev => [...prev, { text, isAI: false }]);
    
    try {
      // Get AI response
      const puter = (window as any).puter;
      const response = await puter.ai.chat(
        `Act as a debate opponent. Document context: ${state.documentText}\n\n` +
        `User argument: ${text}\n\n` +
        "Provide a concise counter-argument:"
      );

      const aiText = response.message.content;
      
      // Add AI message
      setMessages(prev => [...prev, { text: aiText, isAI: true }]);
      
      // Speak AI response
      speakText(aiText);
    } catch (error) {
      console.error("Debate error:", error);
      setMessages(prev => [...prev, { 
        text: "Neural network failed to respond. Try again.", 
        isAI: true 
      }]);
    }
  };

  const speakText = (text: string) => {
    if (synthesis.current) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = synthesis.current.getVoices()[0];
      utterance.onend = () => setIsSpeaking(false);
      synthesis.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.current?.stop();
    } else {
      recognition.current?.start();
    }
    setIsListening(!isListening);
  };

  const resetDebate = () => {
    setMessages([]);
    setIsListening(false);
    if (synthesis.current) {
      synthesis.current.cancel();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16 bg-zinc-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-clash-display bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          NEURAL DEBATE ARENA
        </h1>
        <Button 
          onClick={resetDebate}
          className="border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/10"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          RESET DEBATE
        </Button>
      </div>

      <div className="cyber-border p-[2px] rounded-xl bg-zinc-800/50 h-[600px] flex flex-col">
        <div className="p-6 bg-zinc-900 rounded-xl flex-1 overflow-y-auto">
          <div className="space-y-4 mb-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl ${
                  message.isAI 
                    ? "bg-cyan-400/10 border border-cyan-400/20 ml-6" 
                    : "bg-purple-400/10 border border-purple-400/20 mr-6"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isAI 
                      ? "bg-cyan-400/20 text-cyan-400" 
                      : "bg-purple-400/20 text-purple-400"
                  }`}>
                    {message.isAI ? <Volume2 size={16} /> : "YOU"}
                  </div>
                  <p className="text-zinc-300 flex-1 font-mono">{message.text}</p>
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="p-4 border-t border-zinc-700">
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleListening}
              className={`cyber-gradient text-zinc-900 hover:text-white ${
                isListening ? "animate-pulse" : ""
              }`}
              disabled={isSpeaking}
            >
              <Mic className="mr-2 h-4 w-4" />
              {isListening ? "LISTENING..." : "PRESS TO ARGUE"}
            </Button>
            {!("webkitSpeechRecognition" in window) && (
              <p className="text-red-400 text-sm font-mono">
                Speech recognition not supported in this browser
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArgumentCenter;