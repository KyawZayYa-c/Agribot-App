// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfK_FA0_31IQTMXD2ou5GtuxD5eOK19iM",
  authDomain: "agribot-4f1c4.firebaseapp.com",
  projectId: "agribot-4f1c4",
  storageBucket: "agribot-4f1c4.firebasestorage.app",
  messagingSenderId: "512156289625",
  appId: "1:512156289625:web:c315b10cc83acd7340bf48",
  measurementId: "G-PJLY16TP4R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Analytics - Only initialize if supported (fixes Expo warning)
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('✅ Firebase Analytics initialized');
    } else {
      console.log('ℹ️ Firebase Analytics not supported in this environment');
    }
  }).catch(() => {
    console.log('ℹ️ Firebase Analytics not available');
  });
}

// ✅ Firestore
export const db = getFirestore(app);

// ✅ Export analytics for use if needed
export { analytics };