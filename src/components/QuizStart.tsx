import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "@/services/quizService";
import { motion } from "framer-motion";

const QuizStart = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  
  const quiz: QuizQuestion[] = state?.quiz || [];
  
  const handleAnswer = useCallback((selectedAnswer: string) => {
    if (!quiz[currentQuestionIndex]) return;
    
    const isCorrect = quiz[currentQuestionIndex].correctAnswer === selectedAnswer;
    
    setUserAnswers(prev => [...prev, selectedAnswer]);
    if (isCorrect) setScore(prev => prev + 1);
    
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(30);
    } else {
      setShowResults(true);
    }
  }, [currentQuestionIndex, quiz]);

  useEffect(() => {
    if (!quiz || quiz.length === 0) {
      navigate("/quiz");
    }
  }, [quiz, navigate]);

  useEffect(() => {
    if (!showResults && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Trigger answer handling when time reaches 0
            handleAnswer('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResults, timeRemaining, handleAnswer]);

  useEffect(() => {
    // Handle time expiration
    if (timeRemaining === 0 && !showResults) {
      handleAnswer('');
    }
  }, [timeRemaining, showResults, handleAnswer]);

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setScore(0);
    setShowResults(false);
    setTimeRemaining(30);
  };

  if (!quiz || quiz.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8 mt-16 bg-zinc-900 min-h-screen">
      {!showResults ? (
        <div className="cyber-border p-[2px] rounded-xl bg-zinc-800/50 backdrop-blur-lg mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-zinc-900 rounded-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-clash-display text-cyan-400">
                QUERY {currentQuestionIndex + 1}/{quiz.length}
              </h2>
              <div className="bg-cyan-400/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-400/20 animate-pulse">
                TIME LEAK: {timeRemaining}S
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <h3 className="text-lg font-mono text-purple-400 mb-4">
                {quiz[currentQuestionIndex].question}
              </h3>
              
              <div className="space-y-3">
                {quiz[currentQuestionIndex].options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Button
                      onClick={() => handleAnswer(option)}
                      className="w-full text-left justify-start bg-zinc-800 hover:bg-zinc-700/50 text-cyan-400 font-mono border border-cyan-400/20 hover:border-cyan-400/40 transition-all group"
                      variant="outline"
                    >
                      <span className="mr-2 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ▸
                      </span>
                      {`[OPTION ${index + 1}] ${option}`}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <div className="w-full bg-zinc-800 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full h-2 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                initial={{ width: "0%" }}
                animate={{ width: `${(currentQuestionIndex / quiz.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="cyber-border p-[2px] rounded-xl bg-zinc-800/50 backdrop-blur-lg">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 bg-zinc-900 rounded-xl"
          >
            <h2 className="text-3xl font-clash-display mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              STRESS-TEST RESULTS
            </h2>
            <div className="text-xl font-mono text-cyan-400 mb-6">
              NEURAL SCORE: {score}/{quiz.length}
            </div>

            <div className="space-y-8">
              {quiz.map((question, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border-b border-zinc-700 pb-6"
                >
                  <h3 className="font-mono text-purple-400 mb-3">
                    {question.question}
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <motion.div
                        key={optIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: optIndex * 0.1 }}
                        className={`p-3 rounded-lg border ${
                          option === question.correctAnswer
                            ? "bg-cyan-400/10 border-cyan-400/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
                            : userAnswers[index] === option
                            ? "bg-pink-400/10 border-pink-400/30 shadow-[0_0_10px_rgba(255,26,107,0.1)]"
                            : "bg-zinc-800/50 border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`mr-2 ${
                            option === question.correctAnswer 
                              ? "text-cyan-400" 
                              : userAnswers[index] === option 
                              ? "text-pink-400" 
                              : "text-zinc-400"
                          }`}>
                            {option === question.correctAnswer ? "✓" : "✗"}
                          </span>
                          <span className={`font-mono ${
                            option === question.correctAnswer 
                              ? "text-cyan-400" 
                              : userAnswers[index] === option 
                              ? "text-pink-400" 
                              : "text-zinc-400"
                          }`}>
                            {option}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button 
                  onClick={handleRetry}
                  className="cyber-gradient text-zinc-900 hover:text-white font-clash-display"
                >
                  ENGAGE RETRY PROTOCOL
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="border border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/10"
                >
                  RETURN TO CORE
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default QuizStart;