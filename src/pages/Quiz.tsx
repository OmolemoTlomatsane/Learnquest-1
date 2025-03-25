import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { generateQuiz } from "@/services/quizService";
import { QuizQuestion } from "@/services/quizService";

const Quiz = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const documentText: string = state?.documentText || "";
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    try {
      const generatedQuiz = await generateQuiz({
        text: documentText,
        questionCount,
        difficulty
      });
      setQuiz(generatedQuiz);
    } catch (error) {
      console.error("Quiz generation failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16 bg-zinc-900 min-h-screen">
      <h1 className="text-4xl font-clash-display mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        KNOWLEDGE STRESS-TEST
      </h1>

      <div className="cyber-border p-[2px] rounded-xl bg-zinc-800/50 backdrop-blur-lg mb-8">
        <div className="p-6 bg-zinc-900 rounded-xl">
          <div className="space-y-6">
            <div>
              <label className="block font-mono text-cyan-400 mb-2">QUERY DENSITY</label>
              <div className="cyber-border p-[2px] rounded-lg">
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={questionCount} 
                  onChange={(e) => setQuestionCount(Number(e.target.value))} 
                  className="w-full bg-zinc-800 text-cyan-400 font-mono p-3 border-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-purple-400 mb-2">CHALLENGE PROTOCOL</label>
              <div className="cyber-border p-[2px] rounded-lg">
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)} 
                  className="w-full bg-zinc-800 text-purple-400 font-mono p-3 border-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="easy" className="bg-zinc-800">BASIC</option>
                  <option value="medium" className="bg-zinc-800">ADVANCED</option>
                  <option value="hard" className="bg-zinc-800">EXPERT</option>
                </select>
              </div>
            </div>

            <Button 
              onClick={handleGenerateQuiz}
              className="w-full cyber-gradient text-zinc-900 hover:text-white font-clash-display py-3 text-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <span className="text-gradient">COMPILING...</span>
                </div>
              ) : "INITIATE PROTOCOL"}
            </Button>
          </div>
        </div>
      </div>

      {quiz.length > 0 && (
        <div className="cyber-border p-[2px] rounded-xl bg-zinc-800/50">
          <div className="p-6 bg-zinc-900 rounded-xl">
            <h2 className="text-2xl font-clash-display mb-4 text-cyan-400">STRESS-TEST READY</h2>
            <Button 
              onClick={() => navigate("/quiz/start", { state: { quiz } })}
              className="cyber-gradient text-zinc-900 hover:text-white font-clash-display"
            >
              ENGAGE SEQUENCE →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;