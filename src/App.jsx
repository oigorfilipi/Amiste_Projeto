import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // <--- 1. IMPORTAR O TOASTER
import { Coffee } from "lucide-react";

// Layout e Páginas
import { DefaultLayout } from "./layouts/DefaultLayout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from "./pages/Home";
import { Checklist } from "./pages/Checklist"; // O arquivo principal da página Checklist
import { ChecklistDetails } from "./pages/ChecklistDetails";
import { Wiki } from "./pages/Wiki";
import { Portfolio } from "./pages/Portfolio";
import { Machines } from "./pages/Machines"; // O arquivo principal da página Machines
import { History } from "./pages/History";
import { Financial } from "./pages/Financial";
import { PriceList } from "./pages/PriceList";

// --- NOVAS PÁGINAS ---
import { Supplies } from "./pages/Supplies";
import { Recipes } from "./pages/Recipes";
import { SupplyPriceList } from "./pages/SupplyPriceList";
import { MachineConfigs } from "./pages/MachineConfigs";
import { PrintBlankChecklist } from "./pages/PrintBlankChecklist";

// Contexto
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

// 1. Verifica se está logado
const Private = ({ children }) => {
  const { signed, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="bg-amiste-primary p-4 rounded-full">
            <Coffee size={40} className="text-white animate-bounce" />
          </div>
          <p className="text-gray-400 font-bold text-sm">
            Carregando Sistema...
          </p>
        </div>
      </div>
    );
  }

  return signed ? children : <Navigate to="/" />;
};

// 2. Rota Protegida por Permissão (RBAC)
const ProtectedRoute = ({ children, permissionKey }) => {
  const { permissions, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return null; // Ou um spinner

  // Se não tiver a permissão, redireciona para Home
  if (!permissions || !permissions[permissionKey]) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* --- 2. CONFIGURAÇÃO GLOBAL DAS NOTIFICAÇÕES --- */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            // Configurações padrão
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "14px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },
            // Estilo para Sucesso
            success: {
              style: {
                background: "#DEF7EC", // Verde bem clarinho
                color: "#03543F", // Verde escuro
                border: "1px solid #84E1BC",
                fontWeight: "600",
              },
              iconTheme: {
                primary: "#0E9F6E",
                secondary: "#EAFBF4",
              },
            },
            // Estilo para Erro
            error: {
              style: {
                background: "#FDE8E8", // Vermelho bem clarinho
                color: "#9B1C1C", // Vermelho escuro
                border: "1px solid #F8B4B4",
                fontWeight: "600",
              },
              iconTheme: {
                primary: "#F05252",
                secondary: "#FBD5D5",
              },
            },
          }}
        />

        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas Privadas com Layout */}
          <Route
            element={
              <Private>
                <DefaultLayout />
              </Private>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/checklists/:id" element={<ChecklistDetails />} />
            <Route
              path="/checklists/print-blank"
              element={<PrintBlankChecklist />}
            />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/history" element={<History />} />
            <Route path="/prices" element={<PriceList />} />
            <Route path="/supply-prices" element={<SupplyPriceList />} />
            <Route path="/recipes" element={<Recipes />} />

            {/* Rotas com Permissões Específicas */}

            {/* CHECKLISTS (Técnico/Comercial/Dono/DEV) */}
            <Route
              path="/checklists"
              element={
                <ProtectedRoute permissionKey="canCreateChecklist">
                  <Checklist />
                </ProtectedRoute>
              }
            />

            {/* PORTFÓLIO (Comercial/Vendas/Dono/DEV) */}
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute permissionKey="canManagePortfolio">
                  <Portfolio />
                </ProtectedRoute>
              }
            />

            {/* MÁQUINAS (Quem gerencia máquinas) */}
            <Route
              path="/machines"
              element={
                <ProtectedRoute permissionKey="canManageMachines">
                  <Machines />
                </ProtectedRoute>
              }
            />

            {/* CONFIGURAÇÃO DE MÁQUINAS (Só Técnico/Dono/DEV) */}
            <Route
              path="/machine-configs"
              element={
                <ProtectedRoute permissionKey="canConfigureMachines">
                  <MachineConfigs />
                </ProtectedRoute>
              }
            />

            {/* INSUMOS (Comercial/ADM/Dono/DEV) */}
            <Route
              path="/supplies"
              element={
                <ProtectedRoute permissionKey="canManageSupplies">
                  <Supplies />
                </ProtectedRoute>
              }
            />

            {/* FINANCEIRO (Só quem pode ver financeiro) */}
            <Route
              path="/financial"
              element={
                <ProtectedRoute permissionKey="canViewFinancials">
                  <Financial />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Rota 404 - Redireciona para login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
