import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, FileText } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-zinc-900">
      <main className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1
            animate={{
              textShadow: [
                "0 0 10px #00F0FF",
                "0 0 20px #7A2FF9",
                "0 0 10px #00F0FF",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 cyber-text font-clash-display"
          >
            LEARNQUEST
          </motion.h1>
          <p className="text-lg sm:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Transform your study material into{" "}
            <span className="cyber-text">neural-enhanced</span> learning experiences
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="cyber-border rounded-full inline-block"
          >
            <Button
              asChild
              className="cyber-gradient text-zinc-900 px-8 py-6 text-lg rounded-full font-bold hover:bg-transparent hover:text-white transition-all duration-300"
            >
              <Link to="/register">
                INITIALIZE SYSTEM
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-32 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: <FileText className="w-12 h-12 mb-4" />,
              title: "NEURAL SUMMARIES",
              content:
                "Crystallize complex material into diamond-sharp insights",
            },
            {
              icon: <BookOpen className="w-12 h-12 mb-4" />,
              title: "TACTICAL PLANS",
              content: "Combat-ready learning strategies optimized for your cortex",
            },
            {
              icon: <Brain className="w-12 h-12 mb-4" />,
              title: "QUANTUM QUIZZES",
              content: "Stress-test knowledge with adaptive challenge protocols",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="cyber-border p-[2px] rounded-xl bg-zinc-800/50 backdrop-blur-lg"
            >
              <div className="p-8 bg-zinc-900 rounded-xl h-full">
                <motion.div
                  animate={{
                    filter: [
                      "drop-shadow(0 0 0px #00F0FF)",
                      "drop-shadow(0 0 10px #00F0FF)",
                      "drop-shadow(0 0 0px #00F0FF)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="cyber-text mb-4"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">{feature.content}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-24 text-center"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full border border-cyan-400/20 bg-cyan-400/10">
            <div className="h-2 w-2 bg-cyan-400 rounded-full mr-3 animate-pulse" />
            <span className="text-cyan-400 font-mono text-sm">
              [ ACTIVE USERS: 427,921 ]
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Home;
