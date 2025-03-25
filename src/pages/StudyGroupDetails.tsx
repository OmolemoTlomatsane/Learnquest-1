import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getGroupRef, setupGroupChat, getWhiteboardRef } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Excalidraw } from '@excalidraw/excalidraw';
import katex from 'katex';

// Chat Component
const Chat = ({ groupId, userId }: { groupId: string; userId?: string }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const unsubscribe = setupGroupChat(groupId, setMessages);
    return () => unsubscribe();
  }, [groupId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !userId) return;

    try {
      await updateDoc(doc(getGroupRef(groupId), 'messages'), {
        messages: arrayUnion({
          text: newMessage,
          senderId: userId,
          timestamp: new Date().toISOString()
        })
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="bg-zinc-800 p-4 rounded-lg">
            <div className="text-sm text-purple-400 mb-2">
              User {msg.senderId?.slice(-4)}
            </div>
            <div
              className="text-zinc-300"
              dangerouslySetInnerHTML={{
                __html: msg.text.replace(/\$\$(.*?)\$\$/g, (_, eq) => {
                  try {
                    return katex.renderToString(eq);
                  } catch {
                    return eq;
                  }
                })
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type message... (Use $$ for LaTeX)"
          className="flex-1 bg-zinc-900 text-zinc-300 rounded-lg p-2 border border-zinc-700"
        />
        <Button onClick={handleSend} className="bg-cyan-400 text-zinc-900">
          Send
        </Button>
      </div>
    </div>
  );
};

// Whiteboard Component
const Whiteboard = ({ groupId }: { groupId: string }) => {
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(getWhiteboardRef(groupId), (doc) => {
      if (doc.exists()) setElements(doc.data().elements || []);
    });
    return () => unsubscribe();
  }, [groupId]);

  const handleElementsChange = async (elements: any[]) => {
    try {
      await updateDoc(getWhiteboardRef(groupId), { elements });
    } catch (error) {
      console.error('Error updating whiteboard:', error);
    }
  };

  return (
    <div className="h-[600px] bg-zinc-900 rounded-lg">
      <Excalidraw
        initialData={{ elements }}
        onChange={handleElementsChange}
        theme="dark"
      />
    </div>
  );
};

// Math Editor Component
const MathEditor = ({ groupId }: { groupId: string }) => {
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const handleAddEquation = () => {
    if (equation.trim()) {
      setHistory((prev) => [...prev, equation]);
      setEquation('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          placeholder="Enter LaTeX equation"
          className="flex-1 bg-zinc-900 text-zinc-300 rounded-lg p-2 border border-zinc-700"
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

// Main Study Group Details Component
const StudyGroupDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [group, setGroup] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(getGroupRef(id), (snapshot) => {
      if (snapshot.exists()) setGroup({ id: snapshot.id, ...snapshot.data() });
    });

    return () => unsubscribe();
  }, [id]);

  const handleJoinLeave = async () => {
    if (!group || !user) return;

    try {
      const groupRef = getGroupRef(group.id);
      await updateDoc(groupRef, {
        members: group.members.includes(user.uid)
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid)
      });
    } catch (error) {
      toast({ title: "Operation failed", variant: "destructive" });
    }
  };

  const startJitsiMeeting = () => {
    const domain = "meet.jit.si";
    const roomName = group.name;
    const width = 800;
    const height = 600;
    const options = {
      roomName,
      width,
      height,
      parentNode: document.querySelector('#jitsi-container'),
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    api.addEventListener("videoConferenceJoined", () => {
      console.log("Jitsi conference joined");
    });
  };

  if (!group) return <div className="text-cyan-400 p-8">Loading group...</div>;

  const isMember = user && group.members.includes(user.uid);
  const isOwner = user && group.ownerId === user.uid;
  const isFull = group.members.length >= group.maxMembers;

  return (
    <div className="container mx-auto px-4 py-8 mt-16 bg-zinc-900 min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <Link to="/study-groups" className="text-cyan-400 hover:text-cyan-300">
          ← Back to Groups
        </Link>
      </div>

      <div className="bg-zinc-800/40 rounded-xl p-6 border border-cyan-400/20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">{group.name}</h1>
            <p className="text-xl text-purple-400">{group.subject}</p>
          </div>
          {!isOwner && (
            <Button
              onClick={handleJoinLeave}
              className={`${isMember ? 'bg-red-400' : 'bg-cyan-400'} text-zinc-900`}
              disabled={!isMember && isFull}
            >
              {isMember ? 'Leave Group' : isFull ? 'Group Full' : 'Join Group'}
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full bg-zinc-900">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
            <TabsTrigger value="live">Live Session</TabsTrigger>
            <TabsTrigger value="math">Math Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Chat groupId={group.id} userId={user?.uid} />
          </TabsContent>

          <TabsContent value="whiteboard">
            <Whiteboard groupId={group.id} />
          </TabsContent>

          <TabsContent value="live">
            <div className="h-[600px] bg-zinc-900 rounded-lg">
              <div id="jitsi-container" className="w-full h-full"></div>
              <Button 
                onClick={startJitsiMeeting}
                className="bg-green-500 hover:bg-green-600 mt-4"
              >
                Start Live Session
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="math">
            <MathEditor groupId={group.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudyGroupDetails;
