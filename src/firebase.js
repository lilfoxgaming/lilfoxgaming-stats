import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAdLrN-F2icCy9xWb_RwBFXCMNwYjHmgsI",
  authDomain: "warlordzwar.firebaseapp.com",
  projectId: "warlordzwar",
  storageBucket: "warlordzwar.firebasestorage.app",
  messagingSenderId: "658146783640",
  appId: "1:658146783640:web:9ed5e1b45772e0d7b4fbed"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);