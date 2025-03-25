// src/components/StudyBuddy.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Smile, MessageSquare, X } from "lucide-react";
import { Button } from "./ui/button";

const StudyBuddy = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getMotivation = async () => {
    setIsLoading(true);
    try {
      // Using Puter.js AI
      const puter = (window as any).puter;
      const response = await puter.ai.chat(
        "Give a short motivational quote about learning and studying. Keep it under 15 words."
      );
      setMessage(response.message.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="relative"
      >
        {isOpen ? (
          <div className="cyber-border p-[2px] rounded-xl bg-zinc-800/50 backdrop-blur-lg">
            <div className="p-4 bg-zinc-900 rounded-xl w-64">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                    <Smile className="w-4 h-4 text-zinc-900" />
                  </div>
                  <span className="font-mono text-cyan-400">NOVA</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-cyan-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="cyber-border p-[2px] rounded-lg mb-4">
                <div className="p-3 bg-zinc-800 rounded-lg min-h-20 text-sm text-zinc-300">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                    </div>
                  ) : message || "Click below for motivation"}
                </div>
              </div>

              <Button 
                onClick={getMotivation}
                className="w-full cyber-gradient text-zinc-900 hover:text-white font-mono text-sm"
              >
                <MessageSquare className="mr-2 w-4 h-4" />
                ENCOURAGE ME
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 cyber-border rounded-full bg-zinc-900 flex items-center justify-center hover:bg-cyan-400/10 transition-all group"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Smile className="w-6 h-6 text-cyan-400 group-hover:text-purple-400" />
            </motion.div>
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default StudyBuddy;