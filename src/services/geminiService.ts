export interface GenerateTextParams {
  text: string;
  type: "summary" | "study_plan";
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Unified AI service handler for text generation
 */
export const generateText = async ({ text, type }: GenerateTextParams): Promise<string> => {
  const systemPrompts = {
    summary: "Create a concise summary of the following text:",
    study_plan: "Create a comprehensive study plan based on the following content:"
  };

  console.log(`Initiating ${type} generation with Puter.js AI...`);

  const puter = (window as any).puter;
  
  if (!puter?.ai?.chat) {
    throw new Error("Puter.js AI engine unavailable - check network connection");
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await puter.ai.chat(
        `${systemPrompts[type]}\n\n${text}\n\n` +
        "Response requirements:\n" +
        "- Clean markdown formatting\n" +
        "- No JSON wrappers\n" +
        "- Avoid technical jargon"
      );

      // Handle both string and object responses
      const content = typeof response === 'string' 
        ? JSON.parse(response).message?.content
        : response.message?.content;

      if (!content) throw new Error("Empty AI response");

      return content
        .replace(/^#+\s*/, '')
        .replace(/```json/g, '')
        .trim();

    } catch (error) {
      console.error(`Generation attempt ${attempt} failed:`, error);
      
      if (attempt === MAX_RETRIES) {
        throw new Error(`Final attempt failed: ${error.message}`);
      }
      
      await sleep(RETRY_DELAY * attempt);
    }
  }

  throw new Error("AI service unavailable after multiple attempts");
};

/**
 * Specialized math problem solver with enhanced error handling
 */
export const generateMathSolution = async (problem: string) => {
  const puter = (window as any).puter;
  
  if (!puter?.ai?.chat) {
    throw new Error("Puter.js computational engine not initialized");
  }

  try {
    const response = await puter.ai.chat(
      `Solve this math problem: "${problem}"\n\n` +
      "Required format:\n" +
      "1. Numbered steps in plain text\n" +
      "2. Final answer boxed in **bold**\n" +
      "3. LaTeX math expressions wrapped in $\n" +
      "4. Avoid markdown headings\n\n" +
      "Example:\n" +
      "1. First step explanation\n" +
      "2. Second step explanation\n" +
      "**Final Answer**\n" +
      "$\\boxed{42}$"
    );

    return response.message.content
      .replace(/\\boxed{([^}]*)}/g, '**$1**')
      .replace(/\$\$/g, '$');
      
  } catch (error) {
    console.error('Math resolution failure:', error);
    throw new Error(`Computational error: ${error.message}`);
  }
};