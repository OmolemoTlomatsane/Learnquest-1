import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  ownerId: string;
  members: string[];
  maxMembers: number;
  createdAt: string;
}

const StudyGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    maxMembers: 4
  });

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "studyGroups"));
        const groupsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as StudyGroup[];

        setGroups(groupsData);
      } catch (error) {
        console.error("Error loading groups:", error);
        toast({ title: "Error loading groups", variant: "destructive" });
      }
      setIsLoading(false);
    };

    loadGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, "studyGroups"), {
        ...formData,
        ownerId: user.uid,
        members: [user.uid],
        createdAt: new Date().toISOString(),
      });

      const newGroup: StudyGroup = {
        id: docRef.id,
        ...formData,
        ownerId: user.uid,
        members: [user.uid],
        createdAt: new Date().toISOString(),
      };

      setGroups((prev) => [...prev, newGroup]);

      setFormData({ name: "", description: "", subject: "", maxMembers: 4 });
      toast({ title: "Study group created!" });
    } catch (error) {
      console.error("Error creating group:", error);
      toast({ title: "Error creating group", variant: "destructive" });
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const groupRef = doc(db, "studyGroups", groupId);
      const groupDoc = await getDoc(groupRef);
      if (!groupDoc.exists()) return;

      const group = groupDoc.data() as StudyGroup;

      if (group.members.length < group.maxMembers && !group.members.includes(user.uid)) {
        await updateDoc(groupRef, {
          members: [...group.members, user.uid],
        });

        const updatedGroups = groups.map((g) =>
          g.id === groupId ? { ...g, members: [...g.members, user.uid] } : g
        );
        setGroups(updatedGroups);

        toast({ title: "Joined group successfully!" });
      } else {
        toast({ title: "Group is full or you're already a member", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error joining group:", error);
      toast({ title: "Error joining group", variant: "destructive" });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const groupRef = doc(db, "studyGroups", groupId);
      const groupDoc = await getDoc(groupRef);
      if (!groupDoc.exists()) return;

      const group = groupDoc.data() as StudyGroup;

      if (group.members.includes(user.uid)) {
        await updateDoc(groupRef, {
          members: group.members.filter((id) => id !== user.uid),
        });

        const updatedGroups = groups.map((g) =>
          g.id === groupId
            ? { ...g, members: g.members.filter((id) => id !== user.uid) }
            : g
        );
        setGroups(updatedGroups);

        toast({ title: "Left group successfully!" });
      }
    } catch (error) {
      console.error("Error leaving group:", error);
      toast({ title: "Error leaving group", variant: "destructive" });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const groupRef = doc(db, "studyGroups", groupId);
      const groupDoc = await getDoc(groupRef);
      if (!groupDoc.exists()) return;

      const group = groupDoc.data() as StudyGroup;

      if (group.ownerId === user.uid) {
        await deleteDoc(groupRef);

        const updatedGroups = groups.filter((group) => group.id !== groupId);
        setGroups(updatedGroups);

        toast({ title: "Group deleted successfully!" });
      } else {
        toast({ title: "You are not the owner of this group", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({ title: "Error deleting group", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16 bg-zinc-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Study Groups
        </h1>
        <Link to="/dashboard" className="text-cyan-400 hover:text-cyan-300">
          Back to Dashboard
        </Link>
      </div>

      {/* Create Group Form */}
      <div className="bg-zinc-800/40 rounded-xl p-6 border border-purple-400/20 mb-8">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Create New Group</h2>
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Input
            required
            label="Group Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            required
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
          <Input
            required
            label="Description"
            as="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-300 block mb-2">Max Members</label>
              <select
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: Number(e.target.value) })}
                className="w-full bg-zinc-900 text-zinc-300 rounded-lg p-2 border border-cyan-400/20"
              >
                {[2, 4, 6, 8, 10].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end justify-end">
              <Button
                type="submit"
                className="bg-cyan-400 text-zinc-900 hover:bg-cyan-300"
                disabled={!user}
              >
                Create Group
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const isMember = user && group.members.includes(user.uid);
          const isOwner = user && group.ownerId === user.uid;
          const isFull = group.members.length >= group.maxMembers;

          return (
            <div key={group.id} className="bg-zinc-800/40 rounded-xl p-6 border border-cyan-400/20">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-cyan-400">{group.name}</h3>
                {isOwner && (
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-zinc-300 mb-4">{group.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-purple-400">{group.subject}</span>
                <span className={`text-sm ${isFull ? 'text-red-400' : 'text-green-400'}`}>
                  {group.members.length}/{group.maxMembers} members
                </span>
              </div>
              <div className="flex gap-2">
                {!isOwner && (
                  <>
                    {isMember ? (
                      <Button
                        onClick={() => handleLeaveGroup(group.id)}
                        className="w-full bg-red-400/10 text-red-400 hover:bg-red-400/20"
                      >
                        Leave
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleJoinGroup(group.id)}
                        className="w-full bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20"
                        disabled={isFull || !user}
                      >
                        {isFull ? 'Full' : 'Join'}
                      </Button>
                    )}
                  </>
                )}
                <Link
                  to={`/study-groups/${group.id}`}
                  className="w-full bg-purple-400/10 text-purple-400 hover:bg-purple-400/20 text-center py-2 rounded-lg"
                >
                  View
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {groups.length === 0 && (
        <div className="text-center text-zinc-400 py-12">
          No study groups found. Create the first one!
        </div>
      )}
    </div>
  );
};

export default StudyGroups;
