import { generateText } from "@/services/geminiService";

export interface GenerateQuizParams {
  text: string;
  questionCount: number;
  difficulty: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const generateQuiz = async ({
  text,
  questionCount = 10,
  difficulty = "medium"
}: GenerateQuizParams): Promise<QuizQuestion[]> => {
  try {
    const prompt = `Generate ${questionCount} ${difficulty} difficulty quiz questions based ONLY on this document content:
    
    "${text}"
    
    JSON format:
    {
      "questions": [
        {
          "question": "...",
          "options": ["...", "...", "...", "..."],
          "correctAnswer": "...",
          "explanation": "..."
        }
      ]
    }`;

    let response = await generateText({ text: prompt, type: "quiz" });

    // ✅ Remove unwanted text before parsing
    response = response.replace(/```json/g, "").replace(/```/g, "").trim();

    const quizData = JSON.parse(response);

    if (!quizData?.questions?.length) {
      throw new Error("Invalid quiz format generated");
    }

    return quizData.questions.map((q: any) => ({
      ...q,
      options: shuffleArray([...q.options]),
    }));
  } catch (error) {
    console.error("Quiz generation error:", error);
    throw new Error("Failed to generate document-specific quiz");
  }
};

const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);
