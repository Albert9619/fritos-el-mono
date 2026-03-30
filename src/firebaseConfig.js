import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Datos reales de Fritos El Mono extraídos de tu consola
const firebaseConfig = {
  apiKey: "AIzaSyAIbKCPKMOauqkSB9UPt0GeslVEXetN2VA",
  authDomain: "fritos-el-mono.firebaseapp.com",
  projectId: "fritos-el-mono",
  storageBucket: "fritos-el-mono.firebasestorage.app",
  messagingSenderId: "697130752446",
  appId: "1:697130752446:web:fae140a69d06e40cf201ef",
  measurementId: "G-5423R2PQ0Y"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);