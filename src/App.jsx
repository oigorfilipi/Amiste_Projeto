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

// Páginas Secundárias e Novas
import { Supplies } from "./pages/Supplies";
import { Recipes } from "./pages/Recipes";
import { SupplyPriceList } from "./pages/SupplyPriceList";
import { MachineConfigs } from "./pages/MachineConfigs";
import { PrintBlankChecklist } from "./pages/PrintBlankChecklist";
import { SystemSettings } from "./pages/SystemSettings";
import { Stock } from "./pages/Stock";
import { ClientStatus } from "./pages/ClientStatus";
import { Labels } from "./pages/Labels";
import { DeactivatedAccounts } from "./pages/DeactivatedAccounts"; // <-- IMPORTAÇÃO DA TELA NOVA

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

// 2. Rota Protegida por Permissão (A nova lógica com moduleName)
const ProtectedRoute = ({ children, moduleName }) => {
  const { permissions, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return null;

  // Se a página pede um módulo e o usuário tem permissão "Nothing" ou "Ghost", manda pra home
  if (
    moduleName &&
    permissions &&
    ["Nothing", "Ghost"].includes(permissions[moduleName])
  ) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* --- CONFIGURAÇÃO DAS NOTIFICAÇÕES --- */}
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
            {/* Páginas Gerais protegidas pelos seus respectivos módulos */}
            <Route
              path="/home"
              element={
                <ProtectedRoute moduleName="Home">
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wiki"
              element={
                <ProtectedRoute moduleName="Wiki">
                  <Wiki />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute moduleName="HistoricoGeral">
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prices"
              element={
                <ProtectedRoute moduleName="PrecosMaquinas">
                  <PriceList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/supply-prices"
              element={
                <ProtectedRoute moduleName="PrecosInsumos">
                  <SupplyPriceList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipes"
              element={
                <ProtectedRoute moduleName="Receitas">
                  <Recipes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-settings"
              element={
                <ProtectedRoute moduleName="AdicionarOpcao">
                  <SystemSettings />
                </ProtectedRoute>
              }
            />

            {/* Novas Páginas */}
            <Route
              path="/stock"
              element={
                <ProtectedRoute moduleName="Contagem">
                  <Stock />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client-status"
              element={
                <ProtectedRoute moduleName="StatusClientes">
                  <ClientStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/labels"
              element={
                <ProtectedRoute moduleName="Etiquetas">
                  <Labels />
                </ProtectedRoute>
              }
            />

            {/* Checklists */}
            <Route
              path="/checklists"
              element={
                <ProtectedRoute moduleName="Checklist">
                  <Checklist />
                </ProtectedRoute>
              }
            />
            {/* Detalhes do checklist herdam a mesma permissão da lista principal */}
            <Route
              path="/checklists/:id"
              element={
                <ProtectedRoute moduleName="Checklist">
                  <ChecklistDetails />
                </ProtectedRoute>
              }
            />
            {/* O PDF Manual tem a sua própria permissão */}
            <Route
              path="/print-blank-checklist"
              element={
                <ProtectedRoute moduleName="ImprimirPDFs">
                  <PrintBlankChecklist />
                </ProtectedRoute>
              }
            />

            {/* Portfólio */}
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute moduleName="Portfolio">
                  <Portfolio />
                </ProtectedRoute>
              }
            />

            {/* Máquinas */}
            <Route
              path="/machines"
              element={
                <ProtectedRoute moduleName="Maquinas">
                  <Machines />
                </ProtectedRoute>
              }
            />
            <Route
              path="/machine-configs"
              element={
                <ProtectedRoute moduleName="ConfigMaquinas">
                  <MachineConfigs />
                </ProtectedRoute>
              }
            />

            {/* Insumos */}
            <Route
              path="/supplies"
              element={
                <ProtectedRoute moduleName="Insumos">
                  <Supplies />
                </ProtectedRoute>
              }
            />

            {/* Financeiro */}
            <Route
              path="/financial"
              element={
                <ProtectedRoute moduleName="Financeiro">
                  <Financial />
                </ProtectedRoute>
              }
            />

            {/* --- ROTA DE EX-FUNCIONÁRIOS (Acesso apenas DEV/Dono) --- */}
            <Route
              path="/deactivated"
              element={
                /* Como essa tela é super sensível, a gente deixou a trava de DEV/Dono 
                   dentro do próprio componente (DeactivatedAccounts.jsx), 
                   então basta envolver com o <Private> pra garantir que tá logado */
                <DeactivatedAccounts />
              }
            />
          </Route>

          {/* Rota 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
