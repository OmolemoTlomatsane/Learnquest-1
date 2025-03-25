import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { readFileAsText } from "@/utils/fileUtils";
import { generateText } from "@/services/geminiService";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import StudyBuddy from "@/components/StudyBuddy";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import coseBilkent from "cytoscape-cose-bilkent";
import Webcam from "react-webcam";
import Tesseract, { createWorker, PSM } from 'tesseract.js';

cytoscape.use(dagre);
cytoscape.use(coseBilkent);

interface GeneratedContent {
  summary?: string;
  studyPlan?: string;
  rawText?: string;
  mindMapData?: any;
  aiNarrationUrl?: string;
}

const MindMap = ({ data }: { data: any }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    const elements: cytoscape.ElementDefinition[] = [];
    let idCounter = 0;

    const processLabel = (text: string) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        if ((currentLine + word).length <= 18) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      
      return lines.join('\n');
    };

    const traverse = (node: any, parentId: string | null = null) => {
      const currentId = `n${idCounter++}`;
      elements.push({
        group: "nodes",
        data: { 
          id: currentId, 
          label: processLabel(node.name),
          ...(parentId && { parent: parentId })
        }
      });

      node.children?.forEach((child: any) => traverse(child, currentId));
    };

    traverse(data);

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "label": "data(label)",
            "background-color": "#a855f7",
            "border-color": "#3b82f6",
            "border-width": 2,
            "color": "#e5e7eb",
            "text-valign": "center",
            "text-halign": "center",
            "font-family": "Inter, sans-serif",
            "font-size": "14px",
            "width": "label",
            "height": "label",
            "shape": "round-rectangle",
            "padding": "15px",
            "text-wrap": "wrap",
            "text-max-width": "150px",
            "text-overflow-wrap": "anywhere",
            "line-height": 1.4
          }
        },
        {
          selector: "edge",
          style: {
            "width": 2,
            "line-color": "#00ffff",
            "opacity": 0.6,
            "curve-style": "taxi",
            "target-arrow-color": "#00ffff",
            "target-arrow-shape": "triangle-backcurve",
            "arrow-scale": 1.2
          }
        }
      ],
      layout: {
        name: "cose-bilkent",
        animate: true,
        animationDuration: 1000,
        idealEdgeLength: 150,
        nodeRepulsion: 5000,
        nestingFactor: 0.7,
        nodeDimensionsIncludeLabels: true
      },
      minZoom: 0.2,
      maxZoom: 4,
      wheelSensitivity: 0.15
    });

    return () => cyRef.current?.destroy();
  }, [data]);

  return (
    <div 
      ref={containerRef} 
      className="h-[600px] bg-zinc-800/40 rounded-lg border border-purple-400/20 p-4"
    />
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({});
  const [showAudioPopup, setShowAudioPopup] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [isOCRReady, setIsOCRReady] = useState(false);
  const [ocrProgress, setOCRProgress] = useState(0);
  const synth = useRef<SpeechSynthesis | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const tesseractWorker = useRef<Tesseract.Worker | null>(null);

  // Tesseract Initialization
  // In the Dashboard component's useEffect
useEffect(() => {
  synth.current = window.speechSynthesis;
  
  const initializeTesseract = async () => {
    try {
      setIsOCRReady(false);
      toast({ title: "Initializing OCR Engine...", variant: "default" });

      tesseractWorker.current = await createWorker({
        logger: 'warn', // Only allow string log levels
        workerPath: '/js/tesseract-worker.min.js',
        corePath: '/js/tesseract-core.wasm.js',
        langPath: 'https://cdn.jsdelivr.net/npm/tesseract.js-data@4.0.0/'
      });

      // Add native progress handler
      tesseractWorker.current.worker.on('progress', (status) => {
        if (status.status === 'initializing tesseract') {
          setOCRProgress(Math.floor(status.progress * 50));
        }
        if (status.status === 'loading traineddata') {
          setOCRProgress(50 + Math.floor(status.progress * 50));
        }
      });

      await tesseractWorker.current.loadLanguage('eng');
      await tesseractWorker.current.initialize('eng');
      setIsOCRReady(true);
      toast({ title: "OCR Engine Ready", variant: "success" });

    } catch (error) {
      console.error('OCR Initialization Failed:', error);
      setIsOCRReady(false);
      toast({
        title: "OCR Initialization Failed",
        description: error instanceof Error ? error.message : 'Failed to initialize text recognition',
        variant: "destructive"
      });
    }
  };

  initializeTesseract();

  return () => {
    if (tesseractWorker.current) {
      tesseractWorker.current.terminate();
      tesseractWorker.current = null;
    }
    setIsOCRReady(false);
  };
}, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large (max 10MB)", variant: "destructive" });
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      setGeneratedContent({});
      toast({ title: `${file.name} selected` });
    }
  };

  const captureImage = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc || !tesseractWorker.current) return;

    setIsProcessingOCR(true);
    try {
      // Validate image
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Invalid image data"));
      });

      // OCR Processing with retries
      let result;
      let retries = 3;
      
      while (retries > 0) {
        try {
          result = await tesseractWorker.current.recognize(imageSrc, {
            tessedit_pageseg_mode: PSM.AUTO,
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.,!?;:\'\"()%&/\\@#$€£¥ ',
            preserve_interword_spaces: '1',
          });
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      const processedText = result.data.text
        .replace(/(\r\n|\n|\r){3,}/gm, '\n\n')
        .replace(/[^\S\n]+/g, ' ')
        .replace(/[^\w\s.,!?;:'"()%&\/\\@#$€£¥-]/g, '')
        .trim();

      if (!processedText) throw new Error("No readable text found in image");
      
      analyzeContent(processedText);
    } catch (error) {
      console.error('OCR Processing Failed:', error);
      toast({
        title: "OCR Failed",
        description: error instanceof Error ? error.message : 'Failed to extract text from image',
        variant: "destructive"
      });
    } finally {
      setIsProcessingOCR(false);
      setShowCamera(false);
    }
  };

  const analyzeContent = async (text: string) => {
    setIsLoading(true);
    try {
      const [summary, studyPlan, mindMapData] = await Promise.all([
        generateText({ 
          text, 
          type: "summary",
          prompt: "Generate professional summary with clear paragraphs (NO markdown):"
        }),
        generateText({ 
          text,
          type: "study_plan",
          prompt: `Create structured study plan WITHOUT markdown:
          Week 1: Core Concepts
          Day 1: Introduction
          Key definition 1
          Foundational theory
          Day 2: Applications
          Practical example 1
          Case study`
        }),
        generateMindMapData(text)
      ]);

      setGeneratedContent({
        summary,
        studyPlan,
        rawText: text,
        mindMapData
      });
      setShowAudioPopup(true);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'Failed to process content',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile) return;
    try {
      const text = await readFileAsText(selectedFile);
      analyzeContent(text);
    } catch (error) {
      toast({
        title: "Document Processing Failed",
        description: error instanceof Error ? error.message : 'Failed to read file',
        variant: "destructive"
      });
    }
  };

  const textToMindMapData = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const root = { name: "Main Topic", children: [] };
    let currentParent = root;
    let lastLevel = 1;

    lines.forEach(line => {
      const match = line.match(/^(#+)\s*(.*)/);
      if (match) {
        const level = match[1].length;
        const name = match[2].trim().split(/\s+/).slice(0, 4).join(' ');

        if (level === 1) {
          root.name = name;
        } else if (level === 2) {
          const node = { name, children: [] };
          root.children.push(node);
          currentParent = node;
          lastLevel = 2;
        } else if (level === 3 && lastLevel === 2) {
          currentParent.children.push({ name });
        }
      }
    });

    return root;
  };

  const extractValidJSON = (response: string) => {
    try {
      return JSON.parse(response);
    } catch {
      const jsonMatch = response.match(/{[\s\S]*}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : textToMindMapData(response);
    }
  };

  const generateMindMapData = async (text: string) => {
    try {
      const response = await generateText({
        text,
        type: "mindmap",
        prompt: `Generate strict hierarchical JSON mind map:
        {
          "name": "Main Topic (3-5 words)",
          "children": [
            { 
              "name": "Sub Topic (2-4 complete words)",
              "children": [
                {"name": "Key Detail (complete phrase)"}
              ]
            }
          ]
        }
        RULES:
        1. Complete English phrases only
        2. Max 4 words per node
        3. No markdown/special characters
        4. Valid JSON only`
      });
      return extractValidJSON(response);
    } catch (error) {
      console.error('Mind Map Generation Failed:', error);
      toast({
        title: "Mind Map Generation Failed",
        description: "Creating basic structure from content",
        variant: "destructive"
      });
      return textToMindMapData(text);
    }
  };

  const generateAudio = async (text: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!synth.current) return reject('Speech synthesis unavailable');

      const utterance = new SpeechSynthesisUtterance(text);
      const audioChunks: Blob[] = [];
      
      try {
        const mediaRecorder = new MediaRecorder(new MediaStream());
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          resolve(URL.createObjectURL(audioBlob));
        };

        utterance.onend = () => setTimeout(() => mediaRecorder.stop(), 500);
        utterance.onerror = (e) => reject(e.error);
        
        mediaRecorder.start();
        synth.current.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  };

  const cleanTextContent = (text: string) => {
    return text
      .replace(/[#*\-_]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const formatSummary = (text: string) => {
    return cleanTextContent(text)
      .split('\n')
      .map((paragraph, index) => (
        <p key={index} className="text-zinc-300 leading-relaxed mb-4">
          {paragraph}
        </p>
      ));
  };

  const formatStudyPlan = (text: string) => {
    const cleaned = cleanTextContent(text);
    const sections = cleaned.split(/(Week \d+:|Day \d+:)/i);
    
    let currentSection = '';
    return sections.reduce((acc: JSX.Element[], section, index) => {
      if (index % 2 === 1) {
        currentSection = section;
        return acc;
      }
      
      const isWeek = currentSection.match(/Week \d+/i);
      const isDay = currentSection.match(/Day \d+/i);
      
      const content = section.split('\n').filter(line => line.trim()).map((line, lineIndex) => (
        <div key={lineIndex} className="flex items-start gap-2 ml-4 mb-2">
          <div className="w-2 h-2 mt-2 bg-cyan-400 rounded-full flex-shrink-0" />
          <span className="text-zinc-300">{line}</span>
        </div>
      ));

      acc.push(
        <div key={index} className="mb-6">
          {isWeek && (
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">
              {currentSection}
            </h3>
          )}
          {isDay && (
            <h4 className="text-lg font-medium text-purple-300 mb-2">
              {currentSection}
            </h4>
          )}
          <div className="space-y-2">{content}</div>
        </div>
      );
      
      return acc;
    }, []);
  };

  const handleAudioConfirmation = async (confirm: boolean) => {
    setShowAudioPopup(false);
    if (confirm && generatedContent.summary) {
      try {
        const narrationUrl = await generateAudio(generatedContent.summary);
        setGeneratedContent(prev => ({ ...prev, aiNarrationUrl: narrationUrl }));
        new Audio(narrationUrl).play();
      } catch (error) {
        toast({
          title: "Audio Generation Failed",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16 bg-zinc-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        KNOWLEDGE ANALYZER PRO
      </h1>

      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800/90 rounded-xl p-6 border border-cyan-400/20 w-full max-w-2xl">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4">Document Scanner</h3>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-96 object-contain rounded-lg mb-4"
              videoConstraints={{ facingMode: "environment" }}
            />
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={captureImage}
                className="bg-cyan-400 text-zinc-900 hover:bg-cyan-300"
                disabled={isProcessingOCR || !isOCRReady}
              >
                {isProcessingOCR ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing ({Math.round(ocrProgress)}%)
                  </>
                ) : (
                  <span>📸 Capture & Analyze</span>
                )}
              </Button>
              <Button 
                onClick={() => setShowCamera(false)}
                variant="outline" 
                className="text-cyan-400 border-cyan-400"
              >
                Cancel
              </Button>
            </div>
            <p className="text-zinc-400 text-sm mt-4 text-center">
              Position document in camera view and ensure clear lighting
            </p>
          </div>
        </div>
      )}

      <div className="bg-zinc-800/50 rounded-xl border border-cyan-400/20 p-6 mb-8">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                className="cursor-pointer bg-zinc-900 border-none file:text-cyan-400 file:bg-zinc-800 file:border file:border-cyan-400/20 file:rounded-lg file:font-mono hover:file:bg-cyan-400/10"
              />
              <p className="text-zinc-400 text-sm mt-2 text-center">
                Supported formats: PDF, DOC, DOCX, TXT
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-zinc-400 mb-2">or</span>
              <Button 
                onClick={() => {
                  if (!isOCRReady) {
                    toast({
                      title: "Scanner Initializing",
                      description: "Please wait while we prepare the OCR engine",
                      variant: "default"
                    });
                    return;
                  }
                  setShowCamera(true);
                }}
                className="w-full bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 border border-cyan-400/20 py-8"
                disabled={!isOCRReady}
              >
                {isOCRReady ? (
                  <>
                    <span className="text-2xl">📷</span>
                    <span className="ml-2">Scan Physical Document</span>
                  </>
                ) : (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Initializing Scanner...
                  </div>
                )}
              </Button>
            </div>
          </div>

          <Button 
            onClick={analyzeDocument}
            className="w-full bg-gradient-to-r from-cyan-400 to-purple-400 text-zinc-900 hover:text-white font-bold py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-cyan-400" />
                ANALYZING...
              </div>
            ) : "START ANALYSIS"}
          </Button>
        </div>
      </div>

      {showAudioPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800/50 rounded-xl border border-cyan-400/20 p-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Audio Summary</h3>
            <div className="flex gap-4">
              <Button onClick={() => handleAudioConfirmation(true)} className="bg-cyan-400 text-zinc-900">
                Enable
              </Button>
              <Button onClick={() => handleAudioConfirmation(false)} variant="outline" className="text-cyan-400">
                Skip
              </Button>
            </div>
          </div>
        </div>
      )}

      {generatedContent.summary && (
        <div className="space-y-8">
          <div className="bg-zinc-800/40 rounded-xl p-6 border border-cyan-400/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Key Summary</h2>
            <div className="space-y-4">
              {formatSummary(generatedContent.summary)}
            </div>
          </div>

          <div className="bg-zinc-800/40 rounded-xl p-6 border border-purple-400/20">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Concept Map</h2>
            <MindMap data={generatedContent.mindMapData} />
          </div>

          <div className="bg-zinc-800/40 rounded-xl p-6 border border-cyan-400/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">Learning Plan</h2>
            <div className="space-y-6">
              {formatStudyPlan(generatedContent.studyPlan || '')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-800/40 rounded-xl p-6 border border-cyan-400/20">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-xl font-bold text-cyan-400 mb-2">Quiz Generator</h2>
                  <p className="text-zinc-400 text-sm">Test your understanding</p>
                </div>
                <Link
                  to="/quiz"
                  state={{ documentText: generatedContent.rawText }}
                  className="mt-4 inline-flex items-center bg-cyan-400 text-zinc-900 px-6 py-3 rounded-lg hover:bg-cyan-300 transition-colors"
                >
                  Start Quiz
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="bg-zinc-800/40 rounded-xl p-6 border border-purple-400/20">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-xl font-bold text-purple-400 mb-2">Discussion Simulator</h2>
                  <p className="text-zinc-400 text-sm">Practice conversations</p>
                </div>
                <Link
                  to="/argument"
                  state={{ documentText: generatedContent.rawText }}
                  className="mt-4 inline-flex items-center bg-purple-400 text-zinc-900 px-6 py-3 rounded-lg hover:bg-purple-300 transition-colors"
                >
                  Start Discussion
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16.5c-.83 0-1.5-.67-1.5-1.5h3c0 .83-.67 1.5-1.5 1.5zm3-4.5H9V15h6v-1.5zm-.75-4.5v1.5h-4.5V9.75H8.5V8.25h6v1.5zm3.44 1.06l-.56.56-.56-.56c-.29-.29-.29-.77 0-1.06.29-.29.77-.29 1.06 0l.56.56.56-.56c.29-.29.77-.29 1.06 0 .29.29.29.77 0 1.06z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {generatedContent.aiNarrationUrl && (
            <div className="bg-zinc-800/40 rounded-xl p-6 border border-cyan-400/20">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">Audio Summary</h2>
              <audio controls src={generatedContent.aiNarrationUrl} className="w-full" />
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-6 right-6 flex gap-4">
        <Link
          to="/math-solver"
          className="p-3 bg-cyan-400 text-zinc-900 rounded-full shadow-lg hover:bg-cyan-300 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"  // Fixed
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
        </svg>
        </Link>
        <Link
  to="/study-groups"
  className="p-3 bg-purple-400 text-zinc-900 rounded-full shadow-lg hover:bg-purple-300 transition-colors"
>
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"  // Fixed
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
      </svg>
    </Link>
        <div className="ml-12">
          <StudyBuddy />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;