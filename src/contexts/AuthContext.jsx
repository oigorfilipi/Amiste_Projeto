import { useState, useEffect, createContext } from "react";
import { auth } from "../services/firebaseConnection";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { Navigate } from "react-router-dom";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Para não mostrar a tela antes de saber se tá logado

  useEffect(() => {
    // Fica a "ouvir" se o utilizador logou ou deslogou no Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
        });
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Função de Login
  async function signIn(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O onAuthStateChanged lá em cima vai detetar a mudança automaticamente
    } catch (error) {
      console.log(error);
      throw error; // Lança o erro para a tela de login tratar (ex: senha errada)
    }
  }

  // Função de Logout
  async function logOut() {
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user, // Converte o objeto user para verdadeiro/falso
        user,
        signIn,
        logOut,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
