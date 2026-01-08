import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase Config - iš jūsų Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAZALGVPyRA2aiAQzE-I82VSmCepY_oUwE",
  authDomain: "dbfire-36cd3.firebaseapp.com",
  projectId: "dbfire-36cd3",
  storageBucket: "dbfire-36cd3.firebasestorage.app",
  messagingSenderId: "320608562502",
  appId: "1:320608562502:web:7160fb53495d2a0f158947",
  measurementId: "G-7G6GN8WHSW"
};

// Inicijalizuoti Firebase
const app = initializeApp(firebaseConfig);

// Sukurti Firestore duomenų bazę
export const db = getFirestore(app);

console.log('✅ Firebase prijungta sėkmingai!');

