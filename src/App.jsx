import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

// Contexto
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

// 1. Verifica se está logado
const Private = ({ children }) => {
  const { signed, loadingAuth } = useContext(AuthContext);
  if (loadingAuth)
    return (
      <div className="h-screen flex items-center justify-center">
        A carregar...
      </div>
    );
  if (!signed) return <Navigate to="/" />;
  return children;
};

// 2. Verifica se tem PERMISSÃO ESPECÍFICA (Novo)
const ProtectedRoute = ({ children, allowed }) => {
  const { permissions, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return null;

  // Se a permissão 'allowed' for falsa, chuta pra Home
  if (!allowed) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginLogic />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <Private>
                <DefaultLayout />
              </Private>
            }
          >
            {/* Home é liberada pra todos logados */}
            <Route path="/home" element={<Home />} />
            {/* Rota liberada para todos os logados */}
            <Route path="/prices" element={<PriceList />} />

            {/* Rotas BLINDADAS por Cargo */}
            <Route
              path="/checklists"
              element={
                <ProtectedRouteRouteWrapper permissionKey="canCreateChecklist">
                  <Checklist />
                </ProtectedRouteRouteWrapper>
              }
            />

            <Route
              path="/checklists/:id"
              element={
                <ProtectedRouteRouteWrapper permissionKey="canCreateChecklist">
                  <ChecklistDetails />
                </ProtectedRouteRouteWrapper>
              }
            />

            <Route
              path="/portfolio"
              element={
                <ProtectedRouteRouteWrapper permissionKey="canManagePortfolio">
                  <Portfolio />
                </ProtectedRouteRouteWrapper>
              }
            />

            <Route
              path="/machines"
              element={
                <ProtectedRouteRouteWrapper permissionKey="canManageMachines">
                  <Machines />
                </ProtectedRouteRouteWrapper>
              }
            />

            <Route
              path="/financial"
              element={
                <ProtectedRouteRouteWrapper permissionKey="canViewFinancials">
                  <Financial />
                </ProtectedRouteRouteWrapper>
              }
            />

            {/* Wiki e Histórico (Regras no próprio componente ou liberado leitura) */}
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/history" element={<History />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Pequeno Wrapper para pegar o contexto dentro da rota
function ProtectedRouteRouteWrapper({ children, permissionKey }) {
  const { permissions } = useContext(AuthContext);
  // Se a permissão for true, renderiza. Se não, volta pra home.
  return permissions[permissionKey] ? children : <Navigate to="/home" />;
}

function LoginLogic() {
  const { signed } = useContext(AuthContext);
  if (signed) return <Navigate to="/home" />;
  return <Login />;
}
