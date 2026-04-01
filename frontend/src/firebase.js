// Importing the functions we need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMA7zVq9qqZI27Jq8gDTvzIzdsLVhvINs",
  authDomain: "campuscab-f9479.firebaseapp.com",
  projectId: "campuscab-f9479",
  storageBucket: "campuscab-f9479.firebasestorage.app",
  messagingSenderId: "96584611363",
  appId: "1:96584611363:web:c0779a5b3d1c0bed19e396"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;