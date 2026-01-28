import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importando o Layout e Páginas
import { DefaultLayout } from "./layouts/DefaultLayout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register"; // <--- IMPORTANTE: Importar o Register
import { Home } from "./pages/Home";
import { Checklist } from "./pages/Checklist";
import { ChecklistDetails } from "./pages/ChecklistDetails";
import { Wiki } from "./pages/Wiki";
import { Portfolio } from "./pages/Portfolio";
import { Machines } from "./pages/Machines";
import { History } from "./pages/History";

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
          <Route path="/" element={<LoginLogic />} />
          {/* Rota de Cadastro (Pública para criar a primeira conta) */}
          <Route path="/register" element={<Register />} />{" "}
          {/* <--- ADICIONE ESSA LINHA */}
          {/* Rotas Protegidas (Só entra se estiver Logado) */}
          <Route
            element={
              <Private>
                <DefaultLayout />
              </Private>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/checklists" element={<Checklist />} />
            <Route path="/checklists/:id" element={<ChecklistDetails />} />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/history" element={<History />} />
          </Route>
          {/* Qualquer rota desconhecida joga para o login */}
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
