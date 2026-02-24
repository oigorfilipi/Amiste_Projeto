import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Coffee } from "lucide-react";

// Layout e Páginas
import { DefaultLayout } from "./layouts/DefaultLayout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from "./pages/Home";
import { Checklist } from "./pages/Checklist";
import { ChecklistDetails } from "./pages/ChecklistDetails";
import { Wiki } from "./pages/Wiki";
import { Portfolio } from "./pages/Portfolio";
import { Machines } from "./pages/Machines";
import { History } from "./pages/History";
import { Financial } from "./pages/Financial";
import { PriceList } from "./pages/PriceList";

// Páginas Secundárias
import { Supplies } from "./pages/Supplies";
import { Recipes } from "./pages/Recipes";
import { SupplyPriceList } from "./pages/SupplyPriceList";
import { MachineConfigs } from "./pages/MachineConfigs";
import { PrintBlankChecklist } from "./pages/PrintBlankChecklist";
import { SystemSettings } from "./pages/SystemSettings";

// --- NOVAS PÁGINAS (Fase 1) ---
import { Stock } from "./pages/Stock";
import { ClientStatus } from "./pages/ClientStatus";
import { Labels } from "./pages/Labels";

// Contexto
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

// 1. Verifica se está logado
const Private = ({ children }) => {
  // Alterado de "signed" para "user" para refletir o seu AuthContext real
  const { user, loadingAuth } = useContext(AuthContext);

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

  return user ? children : <Navigate to="/" />;
};

// 2. Rota Protegida por Permissão (RBAC)
const ProtectedRoute = ({ children, permissionKey }) => {
  const { permissions, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return null;

  // Se existir uma chave de permissão obrigatória e o usuário não a tiver, bloqueia.
  if (permissionKey && permissions && permissions[permissionKey] === false) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* --- CONFIGURAÇÃO DAS NOTIFICAÇÕES (Mantidas do seu código original) --- */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "14px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },
            success: {
              style: {
                background: "#DEF7EC",
                color: "#03543F",
                border: "1px solid #84E1BC",
                fontWeight: "600",
              },
              iconTheme: {
                primary: "#0E9F6E",
                secondary: "#EAFBF4",
              },
            },
            error: {
              style: {
                background: "#FDE8E8",
                color: "#9B1C1C",
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
            {/* Páginas Gerais */}
            <Route path="/home" element={<Home />} />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/history" element={<History />} />
            <Route path="/prices" element={<PriceList />} />
            <Route path="/supply-prices" element={<SupplyPriceList />} />
            <Route path="/recipes" element={<Recipes />} />

            {/* Corrigido o caminho para bater certinho com o Menu DefaultLayout */}
            <Route path="/system-settings" element={<SystemSettings />} />

            {/* --- NOVAS ROTAS FASE 1 --- */}
            <Route path="/stock" element={<Stock />} />
            <Route path="/client-status" element={<ClientStatus />} />
            <Route path="/labels" element={<Labels />} />

            {/* Checklists */}
            <Route
              path="/checklists"
              element={
                <ProtectedRoute permissionKey="canCreateChecklist">
                  <Checklist />
                </ProtectedRoute>
              }
            />
            <Route path="/checklists/:id" element={<ChecklistDetails />} />
            {/* Corrigida a rota do PDF de impressão manual para não bater em conflito com /:id */}
            <Route
              path="/print-blank-checklist"
              element={<PrintBlankChecklist />}
            />

            {/* Portfólio */}
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute permissionKey="canManagePortfolio">
                  <Portfolio />
                </ProtectedRoute>
              }
            />

            {/* Máquinas */}
            <Route
              path="/machines"
              element={
                <ProtectedRoute permissionKey="canManageMachines">
                  <Machines />
                </ProtectedRoute>
              }
            />
            <Route
              path="/machine-configs"
              element={
                <ProtectedRoute permissionKey="canConfigureMachines">
                  <MachineConfigs />
                </ProtectedRoute>
              }
            />

            {/* Insumos */}
            <Route
              path="/supplies"
              element={
                <ProtectedRoute permissionKey="canManageSupplies">
                  <Supplies />
                </ProtectedRoute>
              }
            />

            {/* Financeiro */}
            <Route
              path="/financial"
              element={
                <ProtectedRoute permissionKey="canViewFinancials">
                  <Financial />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Rota 404 - Qualquer URL inválida volta para a base */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
