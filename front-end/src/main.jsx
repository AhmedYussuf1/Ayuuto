import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';

import './index.css'
import App from './App.jsx'
// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUBT-07wT6_ck8lpTstz_wbmyZOfgCq9I",
  authDomain: "ayuuto-7a506.firebaseapp.com",
  projectId: "ayuuto-7a506",
  storageBucket: "ayuuto-7a506.firebasestorage.app",
  messagingSenderId: "656679263279",
  appId: "1:656679263279:web:f7e2d382090f971249bada"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
