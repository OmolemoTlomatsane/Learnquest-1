import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { evaluate } from 'mathjs';

const MathSolver = () => {
  const { toast } = useToast();
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSolver, setSelectedSolver] = useState<'ai' | 'mathjs' | 'geogebra'>('ai');

  const SOLVERS = {
    ai: {
      name: 'AI Solution Engine',
      icon: '🧠',
      description: 'Step-by-step explanations using advanced AI',
      pros: ['Natural language understanding', 'Complex problem solving'],
      cons: ['Requires internet connection', 'Advanced math only']
    },
    mathjs: {
      name: 'MathJS Engine',
      icon: '➗',
      description: 'Instant arithmetic & algebraic solutions',
      pros: ['Instant results', 'Pure JavaScript execution'],
      cons: ['No explanations', 'Basic operations only']
    },
    geogebra: {
      name: 'GeoGebra Graphing',
      icon: '📐',
      description: 'Interactive graphing calculator',
      pros: ['Direct plotting', 'Real-time manipulation'],
      cons: ['Requires modern browser', 'Large interface']
    }
  };

  const cleanSolution = (text: string) => {
    return text
      .replace(/\*\*/g, '')
      .replace(/#{1,6}/g, '')
      .replace(/\\boxed{([^}]*)}/g, '$1')
      .replace(/\$/g, '')
      .replace(/\\/g, '')
      .trim();
  };

  const handleAISolution = async (problemText: string) => {
    try {
      const puter = (window as any).puter;
      if (!puter?.ai?.chat) throw new Error("AI service unavailable");

      const response = await puter.ai.chat(
        `Solve this math problem: "${problemText}".\n\n` +
        'Provide step-by-step explanation with final answer boxed in **bold**.\n' +
        'Response structure:\n1. [Step 1]\n2. [Step 2]\n**Final Answer**\n$\\boxed{[solution]}$'
      );

      return {
        success: true,
        data: cleanSolution(response.message.content)
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  };

  const handleMathJS = (expression: string) => {
    try {
      return {
        success: true,
        data: `Solution: ${evaluate(expression)}`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: 'Invalid mathematical expression'
      };
    }
  };

  const handleSolve = async () => {
    if (!problem.trim()) {
      toast({ title: 'Input field empty', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      let result;
      switch(selectedSolver) {
        case 'ai':
          result = await handleAISolution(problem);
          break;
        case 'mathjs':
          result = handleMathJS(problem);
          break;
      }

      if (!result?.success) throw new Error(result?.error);
      setSolution(result.data);
    } catch (error) {
      toast({ title: 'Solution failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-show GeoGebra when selected
  useEffect(() => {
    if (selectedSolver === 'geogebra') {
      setSolution('https://www.geogebra.org/graphing');
    }
  }, [selectedSolver]);

  return (
    <div className="container mx-auto px-4 py-8 mt-16 bg-zinc-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-clash-display bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            MATH SOLVER PRO
          </h1>
          <Link
            to="/dashboard"
            className="cyber-button-small bg-violet-500 hover:bg-violet-400"
          >
            BACK
          </Link>
        </div>

        <div className="cyber-border p-[2px] rounded-xl bg-zinc-800/50 backdrop-blur-lg">
          <div className="p-6 bg-zinc-900 rounded-xl space-y-6">
            {/* Solver Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(SOLVERS).map(([key, solver]) => (
                <div
                  key={key}
                  onClick={() => setSelectedSolver(key as keyof typeof SOLVERS)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSolver === key 
                      ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                      : 'border-zinc-700 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{solver.icon}</span>
                    <h3 className="text-lg font-clash-display text-cyan-400">
                      {solver.name}
                    </h3>
                  </div>
                  <p className="text-zinc-300 text-sm mb-2">{solver.description}</p>
                  <div className="text-sm space-y-1">
                    <div className="text-green-400">
                      {solver.pros.map((pro, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span>✓</span>
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-red-400">
                      {solver.cons.map((con, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span>✗</span>
                          <span>{con}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Conditional Input and Button */}
            {selectedSolver !== 'geogebra' && (
              <>
                <div className="cyber-border p-[2px] rounded-lg">
                  <Input
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Enter problem (e.g., 2+2, solve x^2+3x=5)"
                    className="bg-zinc-800 border-none text-zinc-100 font-mono placeholder:text-zinc-500"
                  />
                </div>

                <Button
                  onClick={handleSolve}
                  className="w-full cyber-gradient text-zinc-900 hover:text-white font-clash-display py-4 text-xl rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-3 h-6 w-6 animate-spin text-cyan-400" />
                      <span className="text-gradient">
                        {selectedSolver === 'ai' ? 'ANALYZING' : 'CALCULATING'}
                      </span>
                    </div>
                  ) : (
                    `SOLVE USING ${SOLVERS[selectedSolver].name.toUpperCase()}`
                  )}
                </Button>
              </>
            )}

            {/* Solution Display */}
            {solution && (
              <div className="cyber-border p-[2px] rounded-xl bg-zinc-800/50 mt-6">
                <div className="p-6 bg-zinc-900 rounded-xl">
                  <h2 className="text-2xl font-clash-display mb-4 text-cyan-400">
                    {selectedSolver === 'geogebra' ? 'INTERACTIVE GRAPHING' : 
                     selectedSolver === 'ai' ? 'STEP-BY-STEP SOLUTION' : 
                     'INSTANT RESULT'}
                  </h2>
                  
                  {selectedSolver === 'geogebra' ? (
                    <div className="aspect-video cyber-border rounded-xl overflow-hidden bg-black">
                      <iframe
                        src={solution}
                        className="w-full h-full"
                        title="GeoGebra Graph"
                        allow="fullscreen"
                      />
                    </div>
                  ) : (
                    <div className={`text-zinc-300 font-mono ${
                      selectedSolver === 'ai' ? 'space-y-4' : 'text-lg'
                    }`}>
                      {solution.split('\n').map((line, index) => (
                        <div key={index} className="solution-step">
                          {line.startsWith('Final Answer') ? (
                            <div className="w-full pt-4 mt-4 border-t border-cyan-400/30">
                              <span className="text-lg font-semibold text-purple-400">
                                {line.replace('Final Answer', 'FINAL ANSWER')}
                              </span>
                            </div>
                          ) : (
                            line
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathSolver;