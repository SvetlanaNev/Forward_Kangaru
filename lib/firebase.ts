import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCSB7-0i_eKz3iozGXRhKubdgPu0f-ogSQ",
  authDomain: "forward-2e9b1.firebaseapp.com",
  projectId: "forward-2e9b1",
  storageBucket: "forward-2e9b1.firebasestorage.app",
  messagingSenderId: "454349221539",
  appId: "1:454349221539:web:project-454349221539"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 