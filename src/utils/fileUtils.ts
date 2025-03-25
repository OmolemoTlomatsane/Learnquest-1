import * as PDFJS from 'pdfjs-dist';
import mammoth from 'mammoth';

// Import PDF worker dynamically to work with Vite
import 'pdfjs-dist/build/pdf.worker.mjs';

// Ensure PDF.js worker is correctly set up
PDFJS.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

/**
 * Reads a file as text, handling different file formats.
 */
export const readFileAsText = async (file: File): Promise<string> => {
  const fileType = file.type;

  if (fileType === 'text/plain') {
    return readTextFile(file);
  } 
  else if (fileType === 'application/pdf') {
    return extractTextFromPdf(file);
  } 
  else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
           fileType === 'application/msword') {
    return extractTextFromWord(file);
  } 
  else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
};

/**
 * Reads plain text files.
 */
const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

/**
 * Extracts text from a PDF file using PDF.js.
 */
const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Extracts text from a Word document using Mammoth.
 */
const extractTextFromWord = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from Word document:', error);
    throw new Error('Failed to extract text from Word document');
  }
};
