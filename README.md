Knowledge Analyzer Pro
Knowledge Analyzer Pro is a web-based application that leverages Optical Character Recognition (OCR) and AI-driven text processing to help users extract, analyze, and generate summaries, study plans, and mind maps from documents. Additionally, it can convert summaries into audio for easy listening. Users can either upload documents or capture images using the webcam for text extraction.

Features
OCR Engine: Powered by Tesseract.js, it converts text from images and scanned documents into machine-readable text.

AI Text Analysis: Summarizes the text, creates a study plan, and generates a mind map from the content.

Audio Summary: Converts the generated summary into speech for auditory learners.

File Upload: Supports uploading of various document types such as .pdf, .docx, .txt.

Webcam Scanning: Capture images from physical documents using the webcam for OCR processing.

Quiz Generator: Generate quizzes from the analyzed text to test understanding.

Discussion Simulator: Create a simulated discussion environment to practice communication on the analyzed content.

Prerequisites
To get started, ensure you have the following:

A modern browser that supports the Web Speech API and the MediaRecorder API.

Access to documents in .pdf, .docx, .txt format or a camera for scanning physical documents.

Setup Instructions
Tesseract.js Initialization
The application initializes Tesseract.js in the useEffect hook of the Dashboard component. Here's the core logic used to initialize and configure Tesseract:

javascript
Copy
useEffect(() => {
  synth.current = window.speechSynthesis;
  
  const initializeTesseract = async () => {
    try {
      setIsOCRReady(false);
      toast({ title: "Initializing OCR Engine...", variant: "default" });

      tesseractWorker.current = await createWorker({
        logger: 'warn',
        workerPath: '/js/tesseract-worker.min.js',
        corePath: '/js/tesseract-core.wasm.js',
        langPath: 'https://cdn.jsdelivr.net/npm/tesseract.js-data@4.0.0/'
      });

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
File Handling
The component also handles file uploads, ensuring that files are not too large and provides feedback when a file is selected:

javascript
Copy
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
OCR Image Capture
The webcam is used to capture an image for OCR processing. Once captured, the image is processed, and the extracted text is analyzed.

javascript
Copy
const captureImage = async () => {
  const imageSrc = webcamRef.current?.getScreenshot();
  if (!imageSrc || !tesseractWorker.current) return;

  setIsProcessingOCR(true);
  try {
    const img = new Image();
    img.src = imageSrc;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("Invalid image data"));
    });

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
      .replace(/[^\w\s.,!?;:'"()%&\/\\@#$€£¥-]/g, ' ')
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
Generating Audio
Once the summary is created, the text is converted to audio using the SpeechSynthesisUtterance and MediaRecorder:

javascript
Copy
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
User Interface
The UI allows for seamless interaction with the OCR engine, document uploading, image scanning, and the display of the generated content. Key UI elements include:

File Upload: For uploading documents.

Scan with Webcam: Captures an image for OCR processing.

OCR Progress: Displays the progress of the OCR engine initialization and text recognition.

Generated Content: Displays the summary, study plan, mind map, and audio summary.

Example UI Flow:
Upload a Document or Capture an Image: Upload a file or use the webcam to capture an image for OCR processing.

Analyze the Document: The app processes the content and generates a summary, study plan, and mind map.

Review the Results: The results are displayed, and the user can listen to an audio summary or start a quiz/discussion based on the content.

Conclusion
Knowledge Analyzer Pro is an advanced tool for anyone looking to extract, analyze, and generate content from documents. With its powerful OCR capabilities, AI-based text analysis, and the ability to convert summaries into audio, it offers an efficient and user-friendly experience for learning and content processing.



