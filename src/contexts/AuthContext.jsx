import { useState, useEffect, createContext } from "react";
import { supabase } from "../services/supabaseClient";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [realProfile, setRealProfile] = useState(null);
  const [impersonatedProfile, setImpersonatedProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoadingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else {
          setRealProfile(null);
          setImpersonatedProfile(null);
          setLoadingAuth(false);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    try {
      const { data } = await supabase
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

  // --- LOGICA DE TESTE ---
  const activeProfile = impersonatedProfile || realProfile;
  const isImpersonating = !!impersonatedProfile;

  function startImpersonation(profile) {
    setImpersonatedProfile(profile);
  }
  function stopImpersonation() {
    setImpersonatedProfile(null);
  }

  // --- PERMISSÕES ---
  const role = activeProfile?.role || "Visitante";

  const permissions = {
    // 1. FINANCEIRO: Ver totais e gráficos
    canViewFinancials: ["Dono", "Financeiro", "DEV"].includes(role),

    // 2. CHECKLIST (Criar): Todo mundo operacional
    canCreateChecklist: [
      "Dono",
      "DEV",
      "ADM",
      "Comercial",
      "Vendedor",
      "Técnico",
    ].includes(role),

    // 3. CHECKLIST (Editar): Quem põe a mão na massa
    canEditChecklist: [
      "Dono",
      "DEV",
      "ADM",
      "Técnico",
      "Comercial",
      "Vendedor",
    ].includes(role),

    // 4. CHECKLIST (Excluir): Só os Chefes Supremos
    canDeleteChecklist: ["Dono", "DEV"].includes(role),

    // 5. MÁQUINAS: ADM REMOVIDO DAQUI
    canManageMachines: [
      "Dono",
      "DEV",
      "Comercial",
      "Vendedor",
      "Técnico", // Técnico geralmente precisa ver/editar detalhes técnicos
    ].includes(role),

    // 6. PORTFÓLIO: Vendas, Chefia e ADM
    canManagePortfolio: [
      "Dono",
      "DEV",
      "Comercial",
      "Vendedor",
      "ADM",
    ].includes(role),

    // 7. HISTÓRICO: Só Chefia Suprema
    canViewHistory: ["Dono", "DEV"].includes(role),

    // 8. WIKI: Todo mundo vê, edição restrita a técnicos e chefia
    canManageWiki: ["Dono", "DEV", "Técnico"].includes(role),

    // 9. USUÁRIOS: Só Chefia Suprema
    canManageUsers: ["Dono", "DEV"].includes(role),

    // 10. INSUMOS: ADM TEM ACESSO
    canManageSupplies: ["Dono", "DEV", "ADM", "Comercial", "Vendedor"].includes(
      role,
    ),

    // 11. CONFIGURAÇÃO DE MÁQUINAS: DEV, Dono e Técnico
    canConfigureMachines: ["Dono", "DEV", "Técnico", "Tecnico"].includes(role),
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        userProfile: activeProfile,
        realProfile,
        isImpersonating,
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
