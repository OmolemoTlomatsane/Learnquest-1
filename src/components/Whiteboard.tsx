import { useEffect, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { getWhiteboardRef } from '@/lib/firebase';
import { onSnapshot, updateDoc } from 'firebase/firestore';

export const Whiteboard = ({ groupId }: { groupId: string }) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(getWhiteboardRef(groupId), (doc) => {
      if (doc.exists() && excalidrawAPI) {
        excalidrawAPI.updateScene(doc.data().elements);
      }
    });

    return () => unsubscribe();
  }, [groupId, excalidrawAPI]);

  const handleChange = (elements: any[]) => {
    updateDoc(getWhiteboardRef(groupId), {
      elements,
      lastUpdated: new Date().toISOString()
    });
  };

  return (
    <div className="h-[600px] bg-zinc-900 rounded-lg">
      <Excalidraw
        ref={(api) => setExcalidrawAPI(api)}
        onChange={handleChange}
        theme="dark"
      />
    </div>
  );
};