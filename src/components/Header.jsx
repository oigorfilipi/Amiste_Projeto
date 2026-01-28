import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { ProfileModal } from "./ProfileModal";
import {
  History,
  Tag,
  LogOut,
  User,
  Eye,
  XCircle,
  Menu,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";

export function Header() {
  const location = useLocation();
  const {
    userProfile,
    realProfile,
    permissions,
    logOut,
    isImpersonating,
    stopImpersonation,
  } = useContext(AuthContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Para dropdown mobile se precisar

  // Itens que ficarão no TOPO (Consulta)
  const topNavItems = [
    {
      path: "/prices",
      icon: Tag,
      label: "Tabela Preços",
      visible: true,
    },
    {
      path: "/history",
      icon: History,
      label: "Histórico",
      visible: permissions.canViewHistory,
    },
  ];

  function handleOpenProfile() {
    if (isImpersonating) {
      alert("Saia do Modo Teste para editar seu perfil.");
      return;
    }
    setIsModalOpen(true);
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* 1. LADO ESQUERDO: Navegação Secundária (Abas) */}
      <div className="flex items-center gap-6">
        {/* Título da Página Atual (Opcional, ou deixa só os links) */}
        <div className="hidden md:flex items-center gap-4">
          {topNavItems
            .filter((i) => i.visible)
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                    isActive
                      ? "bg-amiste-primary text-white border-amiste-primary"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-amiste-primary hover:text-amiste-primary",
                  )}
                >
                  <Icon size={14} /> {item.label}
                </Link>
              );
            })}
        </div>
      </div>

      {/* 2. LADO DIREITO: Perfil e Ações */}
      <div className="flex items-center gap-4">
        {/* Aviso de Modo Teste (Se estiver ativo) */}
        {isImpersonating && (
          <div className="hidden md:flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <Eye size={14} />
            <span>Vendo como: {userProfile?.role}</span>
            <button onClick={stopImpersonation} title="Sair do Teste">
              <XCircle size={14} className="hover:text-red-600" />
            </button>
          </div>
        )}

        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

        {/* Botão do Perfil (Dropdown Trigger) */}
        <div className="relative group">
          <button className="flex items-center gap-3 focus:outline-none">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800 leading-none">
                {userProfile?.nickname || userProfile?.full_name?.split(" ")[0]}
              </p>
              <p className="text-[10px] text-gray-500 font-medium mt-1">
                {userProfile?.role}
              </p>
            </div>
            <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 border border-gray-200 group-hover:border-amiste-primary group-hover:text-amiste-primary transition-colors">
              <User size={18} />
            </div>
          </button>

          {/* Dropdown Menu (Hover ou Click) */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right z-50">
            <div className="p-2">
              <button
                onClick={handleOpenProfile}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
              >
                <User size={14} /> Editar Perfil
              </button>
              {isImpersonating && (
                <button
                  onClick={stopImpersonation}
                  className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 rounded-lg flex items-center gap-2"
                >
                  <XCircle size={14} /> Sair do Teste
                </button>
              )}
              <div className="h-px bg-gray-100 my-1"></div>
              <button
                onClick={logOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
              >
                <LogOut size={14} /> Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO (Auto-contido no Header para editar a si mesmo) */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileToEdit={realProfile} // Sempre edita o perfil REAL
        currentUserRole={realProfile?.role}
        onSave={() => window.location.reload()}
      />
    </header>
  );
}
