import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Coffee } from "lucide-react"; // Import para o loading

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

// --- NOVAS PÁGINAS ---
import { Supplies } from "./pages/Supplies";
import { Recipes } from "./pages/Recipes";
import { SupplyPriceList } from "./pages/SupplyPriceList";
import { MachineConfigs } from "./pages/MachineConfigs";

// Contexto
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

// 1. Verifica se está logado
const Private = ({ children }) => {
  const { signed, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <Coffee size={48} className="mb-4 animate-bounce opacity-20" />
        <span className="font-bold text-sm">Carregando sistema...</span>
      </div>
    );
  }

  if (!signed) return <Navigate to="/" />;

  return children;
};

// 2. Lógica de Login (Se já logado, vai pra home)
function LoginLogic() {
  const { signed } = useContext(AuthContext);
  if (signed) return <Navigate to="/home" />;
  return <Login />;
}

// 3. Wrapper de Permissão (Protege rotas específicas)
function ProtectedRoute({ children, permissionKey }) {
  const { permissions, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return null; // Espera carregar permissões

  // Se permissionKey for passado e o usuário não tiver a permissão, redireciona
  if (permissionKey && !permissions[permissionKey]) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<LoginLogic />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas Protegidas (Layout Padrão) */}
          <Route
            element={
              <Private>
                <DefaultLayout />
              </Private>
            }
          >
            {/* Home é liberada pra todos logados */}
            <Route path="/home" element={<Home />} />

            {/* Tabelas de Preço (Liberadas leitura geral) */}
            <Route path="/prices" element={<PriceList />} />
            <Route path="/supply-prices" element={<SupplyPriceList />} />

            {/* Wiki e Receitas (Liberadas leitura geral) */}
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/history" element={<History />} />

            {/* Rotas BLINDADAS por Cargo */}
            <Route
              path="/checklists"
              element={
                <ProtectedRoute permissionKey="canCreateChecklist">
                  <Checklist />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checklists/:id"
              element={
                <ProtectedRoute permissionKey="canCreateChecklist">
                  <ChecklistDetails />
                </ProtectedRoute>
              }
            />

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

            <Route
              path="/financial"
              element={
                <ProtectedRoute permissionKey="canViewFinancials">
                  <Financial />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Rota 404 - Redireciona para login/home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
