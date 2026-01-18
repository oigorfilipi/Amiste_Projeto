import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Cole aqui as configurações que você copiou do site do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCQueKTMpiCYbegZoLhccz5ihwbQwkfdT0",
  authDomain: "sistema-amiste.firebaseapp.com",
  projectId: "sistema-amiste",
  storageBucket: "sistema-amiste.firebasestorage.app",
  messagingSenderId: "327059069405",
  appId: "1:327059069405:web:205ef9ca1d7aba4826fe34",
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Exportando as ferramentas que vamos usar no projeto
const auth = getAuth(app); // Para Login
const db = getFirestore(app); // Para Banco de Dados

export { auth, db };
