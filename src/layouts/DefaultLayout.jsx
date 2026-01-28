import { useContext } from "react"; // <--- Importe o useContext
import { Outlet, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext"; // <--- Importe o AuthContext
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  FileText,
  Coffee,
  LogOut,
  History,
  UserPlus, // Icone para cadastro
} from "lucide-react";
import clsx from "clsx";
import logoImg from "../assets/img/logo.png";

export function DefaultLayout() {
  const location = useLocation();
  const { userProfile, logOut, permissions } = useContext(AuthContext); // <--- Use os dados reais

  const navItems = [
    { path: "/home", icon: LayoutDashboard, label: "Início" },
    { path: "/checklists", icon: ClipboardList, label: "Checklist" },
    { path: "/wiki", icon: Wrench, label: "Manutenção" },
    { path: "/portfolio", icon: FileText, label: "Portfólio" },
    { path: "/machines", icon: Coffee, label: "Máquinas" },
    { path: "/history", icon: History, label: "Histórico" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-21 flex items-center justify-center border-b border-gray-100 bg-amiste-primary p-4">
          <img
            src={logoImg}
            alt="Logo Amiste"
            className="h-full w-auto object-contain"
          />
        </div>

        {/* PERFIL DINÂMICO */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <p className="text-sm font-bold text-gray-900">
            {userProfile?.nickname || userProfile?.full_name || "Usuário"}
          </p>
          <p className="text-xs text-gray-500">
            Cargo: {userProfile?.role || "Carregando..."}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-50 text-amiste-primary"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}

          {/* Botão Extra para ADM: Cadastrar Usuário */}
          {permissions?.canRegisterUsers && (
            <Link
              to="/register"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 mt-4 border border-dashed border-blue-200"
            >
              <UserPlus size={20} />
              Cadastrar Equipe
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logOut}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-amiste-primary transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
