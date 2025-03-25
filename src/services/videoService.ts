// src/services/videoService.ts
import { generateText } from "./geminiService";

// src/services/videoService.ts
interface VideoConfig {
  text: string;
  onProgress?: (progress: number) => void;
}

export const generateVideo = async ({ text, onProgress }: VideoConfig): Promise<Blob> => {
  try {
    const response = await fetch('/api/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt: text,
        config: {
          provider: 'gpt4js',
          videoClipDuration: 30,
          subtitleMaxWidth: 40,
          voiceName: 'en-US-JennyNeural',
          bgMusicVolume: 0.3,
          lineBreakForce: true
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];
    let receivedLength = 0;
    const contentLength = parseInt(response.headers.get('Content-Length') || '0');

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      if (contentLength > 0 && onProgress) {
        onProgress(receivedLength / contentLength);
      }
    }

    return new Blob(chunks, { type: 'video/mp4' });
  } catch (error) {
    console.error("Video generation failed:", error);
    throw error;
  }
};

// Existing prompt generator (keep this if still needed)
export const generateVideoPrompt = async (text: string): Promise<string> => {
  // ... existing implementation ...
  try {
    const response = await generateText({
      text: VIDEO_PROMPT_TEMPLATE(text),
      type: "video_prompt"
    });
    
    return response
      .replace(/"/g, '')
      .replace(/\n/g, ' ')
      .trim();
  } catch (error) {
    console.error("Video prompt generation failed:", error);
    return `Style: abstract animation, Scene: Dynamic visualization of concepts from: ${text.substring(0, 50)}`;
  }
};

const VIDEO_PROMPT_TEMPLATE = (text: string) => `
Generate a concise video scene description based on this text: "${text}"

Guidelines:
- Focus on visualizing key concepts
- Include symbolic representations
- Specify visual style (e.g., "3D animation", "watercolor", "cyberpunk")
- Keep under 50 words
- Format: "Style: [STYLE], Scene: [DESCRIPTION]"

Example response:
"Style: isometric 3D animation, Scene: Floating knowledge nodes connected by glowing neural networks in a futuristic digital landscape"
`;
