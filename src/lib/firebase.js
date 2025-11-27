import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtw37aP1eFJ1BydVCmj5_AwulMZe--MtY",
  authDomain: "fintech-guardian.firebaseapp.com",
  projectId: "fintech-guardian",
  storageBucket: "fintech-guardian.firebasestorage.app",
  messagingSenderId: "1004195732590",
  appId: "1:1004195732590:web:1342e5c789744f032c5a7f",
  measurementId: "G-N2VDY775RX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services for use in other components
export const auth = getAuth(app);
export const db = getFirestore(app);