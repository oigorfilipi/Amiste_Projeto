import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { ProfileModal } from "./ProfileModal";
import { Package } from "lucide-react";
import {
  History,
  Tag,
  LogOut,
  User,
  Eye,
  XCircle,
  Settings,
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

  // Itens que ficarão no TOPO (Consulta)
  const topNavItems = [
    {
      path: "/prices",
      icon: Tag,
      label: "Tabela Preços",
      visible: true,
    },
    {
      path: "/supply-prices", // <--- NOVO
      icon: Package,
      label: "Preços Insumos",
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

  // Gera as iniciais para o avatar
  const initials = userProfile?.full_name
    ? userProfile.full_name.substring(0, 2).toUpperCase()
    : userProfile?.nickname?.substring(0, 2).toUpperCase() || "US";

  return (
    <header className="bg-white border-b border-gray-100 h-20 px-8 flex items-center justify-between sticky top-0 z-20 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] transition-all">
      {/* 1. LADO ESQUERDO: Navegação Secundária (Abas) */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-3">
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
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    isActive
                      ? "bg-red-50 text-amiste-primary border-red-100 shadow-sm"
                      : "bg-white text-gray-500 border-transparent hover:bg-gray-50 hover:border-gray-200",
                  )}
                >
                  <Icon
                    size={16}
                    className={
                      isActive ? "text-amiste-primary" : "text-gray-400"
                    }
                  />
                  {item.label}
                </Link>
              );
            })}
        </div>
      </div>

      {/* 2. LADO DIREITO: Perfil e Ações */}
      <div className="flex items-center gap-6">
        {/* Aviso de Modo Teste (Se estiver ativo) */}
        {isImpersonating && (
          <div className="hidden md:flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold border border-amber-100 animate-pulse shadow-sm">
            <Eye size={14} />
            <span>Modo Visualização: {userProfile?.role}</span>
            <button
              onClick={stopImpersonation}
              title="Sair do Teste"
              className="ml-1 hover:text-amber-900"
            >
              <XCircle size={14} />
            </button>
          </div>
        )}

        <div className="h-8 w-px bg-gray-100 hidden md:block"></div>

        {/* Botão do Perfil (Dropdown Trigger) */}
        <div className="relative group">
          <button className="flex items-center gap-3 focus:outline-none p-1 pr-3 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="h-10 w-10 bg-amiste-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md shadow-red-100">
              {initials}
            </div>

            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800 leading-none">
                {userProfile?.nickname || userProfile?.full_name?.split(" ")[0]}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wide">
                {userProfile?.role}
              </p>
            </div>
            <ChevronDown
              size={14}
              className="text-gray-300 group-hover:text-gray-500 transition-colors"
            />
          </button>

          {/* Dropdown Menu (Hover ou Click) */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right z-50 p-2">
            <div className="px-4 py-3 border-b border-gray-50 mb-1">
              <p className="text-xs font-bold text-gray-400 uppercase">Conta</p>
              <p className="text-sm font-bold text-gray-800 truncate">
                {userProfile?.email}
              </p>
            </div>

            <button
              onClick={handleOpenProfile}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-amiste-primary rounded-xl flex items-center gap-3 transition-colors font-medium"
            >
              <Settings size={16} /> Editar Perfil
            </button>

            {isImpersonating && (
              <button
                onClick={stopImpersonation}
                className="w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 rounded-xl flex items-center gap-3 transition-colors font-medium"
              >
                <Eye size={16} /> Sair do Modo Teste
              </button>
            )}

            <div className="h-px bg-gray-100 my-1 mx-2"></div>

            <button
              onClick={logOut}
              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors font-bold"
            >
              <LogOut size={16} /> Sair do Sistema
            </button>
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
