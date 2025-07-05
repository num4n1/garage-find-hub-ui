// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7u5SynPPaCvXxoEmVQImDsvQDSeBMetQ",
  authDomain: "garagefinder-c36fa.firebaseapp.com",
  projectId: "garagefinder-c36fa",
  storageBucket: "garagefinder-c36fa.firebasestorage.app",
  messagingSenderId: "914695740489",
  appId: "1:914695740489:web:e0c214b918d7fb8b2bb398",
  measurementId: "G-WJQ304TC9S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };