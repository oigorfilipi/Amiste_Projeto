import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importando o Layout
import { DefaultLayout } from "./layouts/DefaultLayout";

// Importando as Páginas
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Checklist } from "./pages/Checklist";
import { Wiki } from "./pages/Wiki";
import { Portfolio } from "./pages/Portfolio";
import { Machines } from "./pages/Machines";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de Login (Pública, fora do Layout com Sidebar) */}
        <Route path="/" element={<Login />} />

        {/* Rotas Protegidas (Dentro do Layout com Sidebar) */}
        <Route element={<DefaultLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/checklists" element={<Checklist />} />
          <Route path="/wiki" element={<Wiki />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/machines" element={<Machines />} />
        </Route>

        {/* Redireciona qualquer rota desconhecida para o login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
