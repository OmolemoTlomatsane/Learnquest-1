// components/QuizSetupForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuizSetupFormProps {
  onSubmit: (config: { 
    questionCount: number;
    difficulty: string;
    quizName: string;
  }) => void;
}

export const QuizSetupForm = ({ onSubmit }: QuizSetupFormProps) => {
  const [config, setConfig] = useState({
    questionCount: 10,
    difficulty: "medium",
    quizName: ""
  });

  return (
    <div className="glass-card p-6 rounded-lg space-y-4">
      <h2 className="text-2xl font-bold mb-4">Customize Your Quiz</h2>
      
      <div className="space-y-2">
        <Label>Quiz Name</Label>
        <Input
          value={config.quizName}
          onChange={(e) => setConfig({ ...config, quizName: e.target.value })}
          placeholder="Enter quiz name"
        />
      </div>

      <div className="space-y-2">
        <Label>Number of Questions</Label>
        <Select
          value={config.questionCount.toString()}
          onValueChange={(v) => setConfig({ ...config, questionCount: parseInt(v) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select question count" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 Questions</SelectItem>
            <SelectItem value="10">10 Questions</SelectItem>
            <SelectItem value="15">15 Questions</SelectItem>
            <SelectItem value="20">20 Questions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Difficulty Level</Label>
        <Select
          value={config.difficulty}
          onValueChange={(v) => setConfig({ ...config, difficulty: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        className="w-full mt-4"
        onClick={() => onSubmit(config)}
      >
        Start Quiz
      </Button>
    </div>
  );
};