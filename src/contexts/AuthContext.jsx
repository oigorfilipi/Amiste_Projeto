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

  /* CARGOS ATIVOS: 'Dono', 'ADM', 'Financeiro', 'Administrativo', 'Técnico'
     CORREÇÃO DE VENDAS: Aceita tanto 'Comercial' quanto 'Vendedor'
  */

  const permissions = {
    // 1. FINANCEIRO: Ver totais e gráficos
    canViewFinancials: ["Dono", "Financeiro", "ADM"].includes(role),

    // 2. CHECKLIST (Criar): Vendas agora incluso
    canCreateChecklist: [
      "Dono",
      "ADM",
      "Comercial",
      "Vendedor",
      "Técnico",
      "Administrativo",
    ].includes(role),

    // 3. CHECKLIST (Editar): Vendas e Técnico
    canEditChecklist: [
      "Dono",
      "ADM",
      "Técnico",
      "Comercial",
      "Vendedor",
    ].includes(role),

    // 4. CHECKLIST (Excluir): Só chefia
    canDeleteChecklist: ["Dono", "ADM"].includes(role),

    // 5. MÁQUINAS: Vendas pode ver/cadastrar? (Geralmente sim, para orçamentos)
    canManageMachines: [
      "Dono",
      "ADM",
      "Administrativo",
      "Comercial",
      "Vendedor",
      "Técnico",
    ].includes(role),

    // 6. PORTFÓLIO: Vendas OBRIGATÓRIO aqui
    canManagePortfolio: ["Dono", "ADM", "Comercial", "Vendedor"].includes(role),

    // 7. HISTÓRICO: SOMENTE DONO
    canViewHistory: ["Dono"].includes(role),

    // 8. WIKI: Todo mundo vê, mas quem edita? (Abaixo regra de visualização/edição geral)
    // Deixei genérico, se precisar restringir edição criamos canEditWiki
    canManageWiki: ["Dono", "ADM", "Técnico"].includes(role),

    // 9. USUÁRIOS: Só Dono e ADM veem a lista
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
