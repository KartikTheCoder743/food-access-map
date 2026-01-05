import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAR7IK9Y23YB8kUFq9HHEwEKwAGySpkkHQ",
  authDomain: "food-29918.firebaseapp.com",
  projectId: "food-29918",
  storageBucket: "food-29918.firebasestorage.app",
  messagingSenderId: "880916594289",
  appId: "1:880916594289:web:d13728793d07eddab065d0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };