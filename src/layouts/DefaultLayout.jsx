import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  FileText,
  Coffee,
  LogOut,
} from "lucide-react";
import clsx from "clsx"; // Biblioteca para ajudar nas classes condicionais

export function DefaultLayout() {
  const location = useLocation();

  // Itens do Menu
  const navItems = [
    { path: "/home", icon: LayoutDashboard, label: "Início" },
    { path: "/checklists", icon: ClipboardList, label: "Checklist" },
    { path: "/wiki", icon: Wrench, label: "Manutenção" },
    { path: "/portfolio", icon: FileText, label: "Portfólio" },
    { path: "/machines", icon: Coffee, label: "Máquinas" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo / Topo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-2xl font-display font-bold text-amiste-primary">
            AMISTE
          </span>
        </div>

        {/* Perfil do Usuário (Simplificado por enquanto) */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <p className="text-sm font-bold text-gray-900">Usuário Logado</p>
          <p className="text-xs text-gray-500">Cargo: Administrador</p>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Verifica se a rota atual é a deste item para marcar em vermelho
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
        </nav>

        {/* Botão Sair */}
        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-amiste-primary transition-colors">
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* O Outlet é onde as páginas (Home, Checklist, etc) serão renderizadas */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
