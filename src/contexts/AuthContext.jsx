import { useState, useEffect, createContext } from "react";
import { supabase } from "../services/supabaseClient";

// Desativa o alerta do Vite Fast Refresh para esta constante (já que o arquivo também exporta um componente)
// eslint-disable-next-line react-refresh/only-export-components
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

    // --- NOVA VERIFICAÇÃO: BLOQUEIO DE CONTAS DESLIGADAS ---
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "Desligado") {
      await supabase.auth.signOut(); // Derruba a sessão imediatamente
      throw new Error("CONTA_DESLIGADA"); // Dispara erro para a tela de login
    }

    return data;
  }

  async function logOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // --- LÓGICA DE TESTE DO DEV ---
  const activeProfile = impersonatedProfile || realProfile;
  const isImpersonating = !!impersonatedProfile;

  function startImpersonation(profile) {
    setImpersonatedProfile(profile);
  }
  function stopImpersonation() {
    setImpersonatedProfile(null);
  }

  // =========================================================
  // A SUA MATRIZ DE PERMISSÕES (ALL, READ, NOTHING, GHOST, PARTIAL)
  // =========================================================
  const rawRole = activeProfile?.role || "Visitante";

  // Essa função garante que se no banco estiver escrito "Técnico" ou "Téc.", o sistema entende.
  function getNormalizedRole(r) {
    if (["DEV", "Dev", "Dev."].includes(r)) return "Dev.";
    if (["Dono", "Don."].includes(r)) return "Don.";
    if (["Financeiro", "Fin."].includes(r)) return "Fin.";
    if (["Comercial", "Com."].includes(r)) return "Com.";
    if (["Administrativo", "Adm.", "ADM"].includes(r)) return "Adm.";
    if (["Técnico", "Téc.", "Tecnico"].includes(r)) return "Téc.";
    return "Visitante";
  }

  const role = getNormalizedRole(rawRole);

  // MATRIZ EXATA COMO SOLICITADA
  const PERMISSIONS_MATRIX = {
    "Adm.": {
      Home: "Partial",
      Checklist: "Read",
      Portfolio: "Ghost",
      Manutencao: "Read",
      Maquinas: "Read",
      Insumos: "All",
      Wiki: "Read",
      Financeiro: "Ghost",
      Receitas: "All",
      PrecosInsumos: "All",
      PrecoMaquinas: "Read",
      Contagem: "All",
      StatusClientes: "Read",
      ConfigMaquinas: "Read",
      AdicionarOpcao: "Read",
      Etiquetas: "Partial",
      HistoricoGeral: "Ghost",
      ImprimirPDFs: "Partial",
      Perfil: "Partial",
    },
    "Com.": {
      Home: "Partial",
      Checklist: "All",
      Portfolio: "All",
      Manutencao: "Read",
      Maquinas: "All",
      Insumos: "Read",
      Wiki: "Read",
      Financeiro: "Read",
      Receitas: "Read",
      PrecosInsumos: "Read",
      PrecoMaquinas: "All",
      Contagem: "Read",
      StatusClientes: "All",
      ConfigMaquinas: "Read",
      AdicionarOpcao: "All",
      Etiquetas: "Partial",
      HistoricoGeral: "Ghost",
      ImprimirPDFs: "Partial",
      Perfil: "Partial",
    },
    "Dev.": {
      Home: "All",
      Checklist: "All",
      Portfolio: "All",
      Manutencao: "All",
      Maquinas: "All",
      Insumos: "All",
      Wiki: "All",
      Financeiro: "All",
      Receitas: "All",
      PrecosInsumos: "All",
      PrecoMaquinas: "All",
      Contagem: "All",
      StatusClientes: "All",
      ConfigMaquinas: "All",
      AdicionarOpcao: "All",
      Etiquetas: "All",
      HistoricoGeral: "All",
      ImprimirPDFs: "All",
      Perfil: "All",
    },
    "Fin.": {
      Home: "Partial",
      Checklist: "Read",
      Portfolio: "Read",
      Manutencao: "Read",
      Maquinas: "Read",
      Insumos: "Read",
      Wiki: "Read",
      Financeiro: "All",
      Receitas: "Read",
      PrecosInsumos: "Read",
      PrecoMaquinas: "Read",
      Contagem: "Read",
      StatusClientes: "Read",
      ConfigMaquinas: "Read",
      AdicionarOpcao: "Read",
      Etiquetas: "Read",
      HistoricoGeral: "All",
      ImprimirPDFs: "Partial",
      Perfil: "Partial",
    },
    "Don.": {
      Home: "Partial",
      Checklist: "All",
      Portfolio: "All",
      Manutencao: "All",
      Maquinas: "All",
      Insumos: "All",
      Wiki: "All",
      Financeiro: "All",
      Receitas: "All",
      PrecosInsumos: "All",
      PrecoMaquinas: "All",
      Contagem: "All",
      StatusClientes: "All",
      ConfigMaquinas: "All",
      AdicionarOpcao: "All",
      Etiquetas: "All",
      HistoricoGeral: "All",
      ImprimirPDFs: "Partial",
      Perfil: "All",
    },
    "Téc.": {
      Home: "Partial",
      Checklist: "All",
      Portfolio: "Ghost",
      Manutencao: "All",
      Maquinas: "All",
      Insumos: "Read",
      Wiki: "All",
      Financeiro: "Ghost",
      Receitas: "Read",
      PrecosInsumos: "Read",
      PrecoMaquinas: "Read",
      Contagem: "Read",
      StatusClientes: "Read",
      ConfigMaquinas: "All",
      AdicionarOpcao: "Read",
      Etiquetas: "Partial",
      HistoricoGeral: "Ghost",
      ImprimirPDFs: "Partial",
      Perfil: "Partial",
    },
    Visitante: {
      Home: "Nothing",
      Checklist: "Nothing",
      Portfolio: "Nothing",
      Manutencao: "Nothing",
      Maquinas: "Nothing",
      Insumos: "Nothing",
      Wiki: "Nothing",
      Financeiro: "Nothing",
      Receitas: "Nothing",
      PrecosInsumos: "Nothing",
      PrecoMaquinas: "Nothing",
      Contagem: "Nothing",
      StatusClientes: "Nothing",
      ConfigMaquinas: "Nothing",
      AdicionarOpcao: "Nothing",
      Etiquetas: "Nothing",
      HistoricoGeral: "Nothing",
      ImprimirPDFs: "Nothing",
      Perfil: "Nothing",
    },
  };

  // Pega as permissões do cargo atual baseado na matriz
  const permissions =
    PERMISSIONS_MATRIX[role] || PERMISSIONS_MATRIX["Visitante"];

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
        role: rawRole,
        permissions, // Agora você chama `permissions.Checklist` e ele retorna "All", "Read", etc.
        signIn,
        logOut,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
