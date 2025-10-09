// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth'; // Added GoogleAuthProvider import
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKagd1JqhXx6FlgtklrJqYvzQOOTqzwo0",
  authDomain: "my-amrita-eec28.firebaseapp.com",
  projectId: "my-amrita-eec28",
  storageBucket: "my-amrita-eec28.firebasestorage.app",
  messagingSenderId: "908754249346",
  appId: "1:908754249346:web:2ce2013e26ed933b07f69b",
  measurementId: "G-YSK735ND1H"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check ASAP (before using other services)
export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Ld75-MrAAAAAKsvA99UfXcJTt0kHBOZpycAkhsI'),
  isTokenAutoRefreshEnabled: true,
});

// Firebase services (after App Check init)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // Export GoogleAuthProvider for Google authentication
export const db = getFirestore(app);
export const analytics = getAnalytics(app);