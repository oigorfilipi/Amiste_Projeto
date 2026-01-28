import { useState, useEffect, createContext } from "react";
import { supabase } from "../services/supabaseClient";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [realProfile, setRealProfile] = useState(null);
  const [impersonatedProfile, setImpersonatedProfile] = useState(null); // Perfil "Teste"
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

  // --- LOGICA DE TESTE (IMPERSONATION) ---
  const activeProfile = impersonatedProfile || realProfile;
  const isImpersonating = !!impersonatedProfile;

  function startImpersonation(profile) {
    setImpersonatedProfile(profile);
  }
  function stopImpersonation() {
    setImpersonatedProfile(null);
  }

  // --- PERMISSÕES (Regras do Jogo) ---
  const role = activeProfile?.role || "Visitante";

  /* CARGOS: 'Dono', 'Financeiro', 'Administrativo', 'Comercial', 'Técnico', 'ADM'
   */

  const permissions = {
    // 1. FINANCEIRO: Ver totais e gráficos
    canViewFinancials: ["Dono", "Financeiro", "ADM"].includes(role),

    // 2. CHECKLIST (Criar): Dono, Adm, Comercial, Técnico, Administrativo (Todos menos Financeiro)
    canCreateChecklist: [
      "Dono",
      "ADM",
      "Comercial",
      "Técnico",
      "Administrativo",
    ].includes(role),

    // 3. CHECKLIST (Editar/Excluir): Regras mais restritas
    canEditChecklist: ["Dono", "ADM", "Técnico", "Comercial"].includes(role),
    canDeleteChecklist: ["Dono", "ADM"].includes(role),

    // 4. MÁQUINAS (Cadastro): Todos menos Financeiro
    canManageMachines: [
      "Dono",
      "ADM",
      "Administrativo",
      "Comercial",
      "Técnico",
    ].includes(role),

    // 5. PORTFÓLIO: Comercial, Dono, ADM
    canManagePortfolio: ["Dono", "ADM", "Comercial"].includes(role),

    // 6. HISTÓRICO: SOMENTE O DONO (E você ADM se quiser debugar, mas deixei só Dono conforme pedido)
    // Se você (ADM) quiser ver também, adicione 'ADM' na lista abaixo.
    canViewHistory: ["Dono"].includes(role),

    // 7. WIKI: Técnico, Dono, ADM
    canManageWiki: ["Dono", "ADM", "Técnico"].includes(role),

    // 8. USUÁRIOS (Ver lista de teste): Só Dono e ADM
    canManageUsers: ["Dono", "ADM"].includes(role),
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
        permissions, // Exportando as regras
        signIn,
        logOut,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
