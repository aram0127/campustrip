// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "campustrip-5b014.firebaseapp.com",
  projectId: "campustrip-5b014",
  storageBucket: "campustrip-5b014.firebasestorage.app",
  messagingSenderId: "32221991236",
  appId: "1:32221991236:web:11639569794b9550020711",
  measurementId: "G-WM75P5SKRD"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };