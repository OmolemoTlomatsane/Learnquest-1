import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase config (Replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyA3Mj-v5OAL_Gi4G3YrZEhcWGWnPYcs12w",
    authDomain: "learnquest-44b32.firebaseapp.com",
    projectId: "learnquest-44b32",
    storageBucket: "learnquest-44b32.firebasestorage.app",
    messagingSenderId: "566560049059",
    appId: "1:566560049059:web:e394d1a63ab0698dee3c16",
    measurementId: "G-261BHRXR8J"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Study Groups Collection Reference
export const studyGroupsRef = collection(db, "studyGroups");
export const getGroupRef = (groupId: string) => doc(studyGroupsRef, groupId);

// Real-time Chat System
export const setupGroupChat = (groupId: string, callback: (messages: any[]) => void) => {
  return onSnapshot(collection(db, "studyGroups", groupId, "messages"), (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

// Collaborative Whiteboard Reference
export const getWhiteboardRef = (groupId: string) => doc(db, "whiteboards", groupId);

// Live Session Management
export const setupLiveSession = (groupId: string) => doc(db, "liveSessions", groupId);
