import { useState, useEffect } from 'react';
import { setupGroupChat, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import katex from 'katex';

export const Chat = ({ groupId, userId }: { groupId: string; userId?: string }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const unsubscribe = setupGroupChat(groupId, setMessages);
    return () => unsubscribe();
  }, [groupId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !userId) return;

    await setDoc(doc(db, "studyGroups", groupId, "messages", Date.now().toString()), {
      text: newMessage,
      senderId: userId,
      timestamp: serverTimestamp(),
    });
    setNewMessage('');
  };

  const renderMessage = (text: string) => {
    const latexRegex = /\$\$(.*?)\$\$/g;
    const parts = text.split(latexRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        try {
          return katex.renderToString(part, { throwOnError: false });
        } catch {
          return part;
        }
      }
      return part;
    });
  };

  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-zinc-800 p-4 rounded-lg">
            <div className="text-sm text-purple-400 mb-2">
              User {msg.senderId?.slice(-4)}
            </div>
            <div 
              className="text-zinc-300"
              dangerouslySetInnerHTML={{ 
                __html: renderMessage(msg.text).join('') 
              }}
            />
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type message... (Use $$ for LaTeX)"
          className="flex-1 bg-zinc-900 border-zinc-700"
        />
        <Button onClick={handleSend} className="bg-cyan-400 text-zinc-900">
          Send
        </Button>
      </div>
    </div>
  );
};