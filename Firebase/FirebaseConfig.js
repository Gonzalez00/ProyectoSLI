import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAEBOvhip0yRJhuxk_DNfxXecCul1OTQlU",
  authDomain: "sli1-51d94.firebaseapp.com",
  projectId: "sli1-51d94",
  storageBucket: "sli1-51d94.firebasestorage.app",
  messagingSenderId: "270837641429",
  appId: "1:270837641429:web:de0fa7d2be19ec1cb0325c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const storage = getStorage(app); // Inicializar Firebase Storage

export { db, storage };