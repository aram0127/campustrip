<<<<<<< HEAD
// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBeR1mpi5rndVSmyZAGf846yXbu8J4G9no",
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
=======
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFcmToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const registration = await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("알림 권한 거부됨");
      return null;
    }
  } catch (error) {
    console.error("FCM 토큰 발급 오류:", error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
>>>>>>> d56d7f4bb82081862dbf8805a21f095f464437fc
