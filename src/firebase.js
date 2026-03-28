import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Reemplaza esto con los datos que copiaste de la consola de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "fritos-el-mono.firebaseapp.com",
  projectId: "fritos-el-mono",
  storageBucket: "fritos-el-mono.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);