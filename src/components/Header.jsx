import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { ProfileModal } from "./ProfileModal";
import toast from "react-hot-toast";
import {
  History,
  Tag,
  LogOut,
  Eye,
  XCircle,
  Settings,
  ChevronDown,
  Package,
  ChefHat,
  Menu,
  Database,
  CheckCircle,
  Bookmark,
} from "lucide-react";
import clsx from "clsx";

export function Header({ onOpenSidebar }) {
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

  // --- FUNÇÃO PARA VERIFICAR SE O MENU DEVE APARECER ---
  const isVisible = (moduleName) => {
    if (!permissions) return false;
    return !["Ghost", "Nothing"].includes(permissions[moduleName]);
  };

  // --- NAVEGAÇÃO SECUNDÁRIA (Aparece no Topo no Desktop) ---
  const topNavItems = [
    {
      path: "/recipes",
      icon: ChefHat,
      label: "Receitas",
      visible: isVisible("Receitas"),
    },
    {
      path: "/prices",
      icon: Tag,
      label: "Preços Máquinas",
      visible: isVisible("PrecosMaquinas"),
    },
    {
      path: "/supply-prices",
      icon: Package,
      label: "Preços Insumos",
      visible: isVisible("PrecosInsumos"),
    },
    {
      path: "/stock",
      icon: Database,
      label: "Contagem",
      visible: isVisible("Contagem"),
    },
    {
      path: "/client-status",
      icon: CheckCircle,
      label: "Status Clientes",
      visible: isVisible("StatusCliente"),
    },
    {
      path: "/system-settings",
      icon: Settings,
      label: "Adicionar Opções",
      visible: isVisible("AdicionarOpcao"),
    },
    {
      path: "/labels",
      icon: Bookmark,
      label: "Etiquetas",
      visible: isVisible("Etiquetas"),
    },
    {
      path: "/history",
      icon: History,
      label: "Histórico Geral",
      visible: isVisible("HistoricoGeral"),
    },
  ];

  function handleOpenProfile() {
    if (isImpersonating) {
      return toast.error(
        "Saia do Modo de Visualização para editar seu perfil.",
      );
    }
    setIsModalOpen(true);
  }

  function handleStopImpersonation() {
    stopImpersonation();
    toast.success("Modo de visualização encerrado.");
  }

  async function handleLogout() {
    try {
      await logOut();
      toast.success("Você saiu do sistema.");
    } catch (error) {
      toast.error("Erro ao sair: " + error.message);
    }
  }

  const initials = userProfile?.full_name
    ? userProfile.full_name.substring(0, 2).toUpperCase()
    : userProfile?.nickname?.substring(0, 2).toUpperCase() || "US";

  return (
    <header className="bg-white border-b border-gray-100 h-16 md:h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] transition-all">
      {/* --- LADO ESQUERDO e SCROLL DE MENUS --- */}
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        {/* MOBILE: Botão Menu + Logo */}
        <div className="flex items-center gap-3 lg:hidden shrink-0">
          <button
            onClick={onOpenSidebar}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform"
          >
            <Menu size={24} />
          </button>
          <span className="text-amiste-primary font-black tracking-[0.15em] text-lg">
            AMISTE
          </span>
        </div>

        {/* DESKTOP: Navegação Secundária em Scroll Horizontal */}
        <div className="hidden lg:flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
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
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border whitespace-nowrap",
                    isActive
                      ? "bg-red-50 text-amiste-primary border-red-100 shadow-sm"
                      : "bg-white text-gray-500 border-transparent hover:bg-gray-50 hover:border-gray-200",
                  )}
                >
                  <Icon
                    size={14}
                    className={
                      isActive ? "text-amiste-primary" : "text-gray-400"
                    }
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </div>
      </div>

      {/* --- LADO DIREITO: Perfil e Ações --- */}
      <div className="flex items-center gap-3 md:gap-6 ml-4 shrink-0">
        {isImpersonating && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold border border-amber-100 animate-pulse shadow-sm">
            <Eye size={14} />
            <span className="hidden md:inline">
              Modo Visualização: {userProfile?.role}
            </span>
            <span className="md:hidden">{userProfile?.role}</span>
            <button
              onClick={handleStopImpersonation}
              title="Sair do Teste"
              className="ml-1 hover:text-amber-900"
            >
              <XCircle size={14} />
            </button>
          </div>
        )}

        <div className="h-8 w-px bg-gray-100 hidden md:block"></div>

        <div className="relative group">
          <button className="flex items-center gap-2 md:gap-3 focus:outline-none p-1 pr-2 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="h-8 w-8 md:h-10 md:w-10 bg-amiste-primary text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md shadow-red-100 overflow-hidden shrink-0">
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
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
              className="text-gray-300 group-hover:text-gray-500 transition-colors hidden md:block"
            />
          </button>

          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right z-50 p-2">
            <div className="px-4 py-3 border-b border-gray-50 mb-1">
              <p className="text-xs font-bold text-gray-400 uppercase">Conta</p>
              <p className="text-sm font-bold text-gray-800 truncate">
                {userProfile?.email}
              </p>
              <p className="md:hidden text-[10px] text-amiste-primary font-bold uppercase mt-1">
                {userProfile?.role}
              </p>
            </div>
            {/* Como combinado, "Perfil" será ajustado no ProfileModal depois, mas o botão existe para quem não tem Nothing/Ghost */}
            {permissions?.Perfil !== "Nothing" &&
              permissions?.Perfil !== "Ghost" && (
                <button
                  onClick={handleOpenProfile}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-amiste-primary rounded-xl flex items-center gap-3 transition-colors font-medium"
                >
                  <Settings size={16} /> Editar Perfil
                </button>
              )}
            {isImpersonating && (
              <button
                onClick={handleStopImpersonation}
                className="w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 rounded-xl flex items-center gap-3 transition-colors font-medium"
              >
                <Eye size={16} /> Sair do Modo Teste
              </button>
            )}
            <div className="h-px bg-gray-100 my-1 mx-2"></div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors font-bold"
            >
              <LogOut size={16} /> Sair do Sistema
            </button>
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileToEdit={realProfile}
        currentUserRole={realProfile?.role}
        onSave={() => window.location.reload()}
      />
    </header>
  );
}
