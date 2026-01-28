import { useState, useEffect, createContext } from "react";
import { supabase } from "../services/supabaseClient";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Guarda Cargo, Nome, etc.
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Verificar sessão ao abrir
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoadingAuth(false);
    });

    // Escutar mudanças (Login/Logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else {
          setUserProfile(null);
          setLoadingAuth(false);
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) setUserProfile(data);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    } finally {
      setLoadingAuth(false);
    }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function logOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setUserProfile(null);
  }

  // --- SISTEMA DE PERMISSÕES ---
  const role = userProfile?.role || "Visitante";

  const permissions = {
    // Checklist
    canCreateChecklist: ["Vendedor", "ADM", "Dono", "Técnico"].includes(role),
    canEditChecklist: ["Vendedor", "Técnico", "ADM", "Dono"].includes(role),
    canDeleteChecklist: ["Dono", "ADM"].includes(role),

    // Máquinas e Wiki
    canManageMachines: ["ADM", "Dono"].includes(role), // Criar/Editar/Excluir

    // Usuários
    canRegisterUsers: ["ADM", "Dono"].includes(role), // Só chefe cria contas
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        userProfile, // Disponível para mostrar nome na sidebar
        role,
        permissions,
        signIn,
        logOut,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
