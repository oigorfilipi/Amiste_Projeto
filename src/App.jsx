import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importando o Layout e Páginas
import { DefaultLayout } from "./layouts/DefaultLayout";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Checklist } from "./pages/Checklist";
import { Wiki } from "./pages/Wiki";
import { Portfolio } from "./pages/Portfolio";
import { Machines } from "./pages/Machines";

// Importando o Contexto
import { AuthProvider, AuthContext } from "./contexts/AuthContext";

// Componente que verifica se está logado
const Private = ({ children }) => {
  const { signed, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        A carregar...
      </div>
    );
  }

  if (!signed) {
    return <Navigate to="/" />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota de Login (Pública) */}
          {/* Se o utilizador já estiver logado e tentar ir para login, manda para home */}
          <Route path="/" element={<LoginLogic />} />

          {/* Rotas Protegidas (Só entra se Private deixar) */}
          <Route
            element={
              <Private>
                <DefaultLayout />
              </Private>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/checklists" element={<Checklist />} />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/machines" element={<Machines />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Pequeno componente auxiliar para redirecionar quem já está logado
function LoginLogic() {
  const { signed } = useContext(AuthContext);
  if (signed) {
    return <Navigate to="/home" />;
  }
  return <Login />;
}
