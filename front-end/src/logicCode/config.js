 // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
// TODO: Add SDKs for Firebase products that you want to use
 
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBH7CQfcGX_tBOsHTXVTvE_-7PqV7BQn9M",
  authDomain: "ayuuto-3ff02.firebaseapp.com",
  projectId: "ayuuto-3ff02",
  storageBucket: "ayuuto-3ff02.firebasestorage.app",
  messagingSenderId: "686796012153",
  appId: "1:686796012153:web:7bf2e14ec974ff094a32a8"
};

// Initialize Firebase
 const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);