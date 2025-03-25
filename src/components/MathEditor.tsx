import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import katex from 'katex';

export const MathEditor = ({ groupId }: { groupId: string }) => {
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const handleAddEquation = () => {
    if (equation.trim()) {
      setHistory([...history, equation]);
      setEquation('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          placeholder="Enter LaTeX equation"
          className="flex-1 bg-zinc-900"
        />
        <Button onClick={handleAddEquation} className="bg-cyan-400 text-zinc-900">
          Add Equation
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {history.map((eq, index) => (
          <div key={index} className="bg-zinc-800 p-4 rounded-lg">
            <div dangerouslySetInnerHTML={{ 
              __html: katex.renderToString(eq, { displayMode: true })
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};