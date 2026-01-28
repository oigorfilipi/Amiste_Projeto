import { useState, useEffect, createContext } from "react";
import { supabase } from "../services/supabaseClient";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Usuário real do Supabase
  const [realProfile, setRealProfile] = useState(null); // Perfil real do banco
  const [impersonatedProfile, setImpersonatedProfile] = useState(null); // Perfil "Teste"
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // 1. Verifica sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoadingAuth(false);
    });

    // 2. Escuta mudanças
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else {
          setRealProfile(null);
          setImpersonatedProfile(null); // Reseta teste ao sair
          setLoadingAuth(false);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) setRealProfile(data);
    } catch (error) {
      console.error("Erro perfil:", error);
    } finally {
      setLoadingAuth(false);
    }
  }

  // --- FUNÇÕES DE LOGIN/LOGOUT ---
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
  }

  // --- SISTEMA DE "GOD MODE" (TESTE DE USUÁRIO) ---

  // Perfil Ativo: Se tiver um "impersonated", usa ele. Senão, usa o real.
  const activeProfile = impersonatedProfile || realProfile;
  const isImpersonating = !!impersonatedProfile;

  // Função para ativar o modo teste
  function startImpersonation(profileToTest) {
    setImpersonatedProfile(profileToTest);
  }

  // Função para sair do modo teste
  function stopImpersonation() {
    setImpersonatedProfile(null);
  }

  // --- PERMISSÕES (Baseadas no activeProfile) ---
  const role = activeProfile?.role || "Visitante";

  /* CARGOS: 'Dono', 'Financeiro', 'Administrativo', 'Comercial', 'Técnico', 'ADM' (Você)
   */

  const permissions = {
    // Quem vê o Painel Financeiro
    canViewFinancials: ["Dono", "Financeiro", "ADM"].includes(role),

    // Quem cria/edita Checklists
    canManageChecklists: [
      "Dono",
      "Administrativo",
      "Comercial",
      "Técnico",
      "ADM",
    ].includes(role),

    // Quem cadastra Máquinas
    canManageMachines: [
      "Dono",
      "Administrativo",
      "Comercial",
      "Técnico",
      "ADM",
    ].includes(role),

    // Quem mexe no Portfólio
    canManagePortfolio: ["Dono", "Comercial", "Financeiro", "ADM"].includes(
      role,
    ),

    // Quem mexe na Wiki (Soluções)
    canManageWiki: ["Dono", "Técnico", "ADM"].includes(role),

    // Quem exclui coisas críticas (Segurança extra)
    canDeleteCritical: ["Dono", "ADM"].includes(role),

    // Quem pode ver a lista de usuários para testar (Só VOCÊ e o Dono)
    canManageUsers: ["Dono", "ADM"].includes(role),
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        userProfile: activeProfile, // O resto do app vai "achar" que esse é o usuário
        realProfile, // Acesso ao perfil original se precisar
        isImpersonating, // Para mostrar o botão de sair
        startImpersonation,
        stopImpersonation,
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
