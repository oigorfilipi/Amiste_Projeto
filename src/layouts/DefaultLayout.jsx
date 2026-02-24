import { useContext, useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import { ProfileModal } from "../components/ProfileModal";
import { Header } from "../components/Header";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Wrench,
  FileText,
  Coffee,
  UserPlus,
  Trash2,
  Edit2,
  Shield,
  Package,
  X,
  Tag,
  ChefHat,
  Settings,
  History,
  Database,
  CheckCircle,
  Bookmark,
} from "lucide-react";
import clsx from "clsx";

export function DefaultLayout() {
  const location = useLocation();
  const { realProfile, permissions, isImpersonating, startImpersonation } =
    useContext(AuthContext);

  const [teamMembers, setTeamMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (realProfile && ["DEV", "Dono"].includes(realProfile.role)) {
      fetchTeam();
    }
  }, [realProfile, isImpersonating]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  async function fetchTeam() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", realProfile?.id)
      .order("full_name");
    if (data) setTeamMembers(data);
  }

  function handleEditMember(member, e) {
    e.stopPropagation();
    setProfileToEdit(member);
    setIsModalOpen(true);
  }

  async function handleDeleteMember(id, name, role, e) {
    e.stopPropagation();
    if (["DEV", "Dono"].includes(role)) {
      return toast.error(
        "Ação Bloqueada: Não é possível excluir contas de nível Superior.",
      );
    }
    if (!confirm(`Tem certeza que deseja EXCLUIR a conta de "${name}"?`))
      return;

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      toast.success(`Usuário "${name}" excluído com sucesso.`);
      fetchTeam();
    } catch (error) {
      toast.error("Erro ao excluir usuário: " + error.message);
    }
  }

  function getRoleStyle(role) {
    if (role === "DEV")
      return "bg-purple-100 text-purple-700 border-purple-200";
    if (role === "Dono") return "bg-amber-100 text-amber-700 border-amber-200";
    if (role === "Comercial")
      return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-gray-100 text-gray-500 border-gray-200";
  }

  // --- NAVEGAÇÃO PRINCIPAL (Fica na Lateral) ---
  const primaryNavItems = [
    {
      path: "/machines",
      icon: Coffee,
      label: "Catálogo de Máquinas",
      visible: permissions?.canManageMachines || true,
    },
    {
      path: "/checklists",
      icon: ClipboardList,
      label: "Checklists",
      visible: permissions?.canCreateChecklist || true,
    },
    {
      path: "/supplies",
      icon: Package,
      label: "Catálogo de Insumos",
      visible: permissions?.canManageSupplies || true,
    },
    { path: "/wiki", icon: Wrench, label: "Wiki de Manutenção", visible: true },
    {
      path: "/portfolio",
      icon: FileText,
      label: "Portfólio",
      visible: permissions?.canManagePortfolio || true,
    },
  ];

  // --- NAVEGAÇÃO SECUNDÁRIA (Aparece no Menu Mobile) ---
  const secondaryNavItems = [
    { path: "/recipes", icon: ChefHat, label: "Receitas", visible: true },
    { path: "/prices", icon: Tag, label: "Preços Máquinas", visible: true },
    {
      path: "/supply-prices",
      icon: Package,
      label: "Preços Insumos",
      visible: true,
    },
    { path: "/stock", icon: Database, label: "Contagem", visible: true },
    {
      path: "/client-status",
      icon: CheckCircle,
      label: "Status Clientes",
      visible: true,
    },
    {
      path: "/machine-configs",
      icon: Settings,
      label: "Config. Máquinas",
      visible: permissions?.canConfigureMachines || true,
    },
    {
      path: "/system-settings",
      icon: Settings,
      label: "Adicionar Opções",
      visible: true,
    },
    { path: "/labels", icon: Bookmark, label: "Etiquetas", visible: true },
    {
      path: "/history",
      icon: History,
      label: "Histórico Geral",
      visible: permissions?.canViewHistory || true,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans text-gray-900 overflow-hidden">
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileToEdit={profileToEdit}
        currentUserRole={realProfile?.role}
        onSave={() => fetchTeam()}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 transform shadow-2xl lg:shadow-none",
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="h-20 flex items-center justify-between border-b border-gray-100 px-6 shrink-0">
          <Link
            to="/machines"
            className="bg-amiste-primary w-full py-3 rounded-xl shadow-lg shadow-red-200 flex items-center justify-center"
          >
            <span className="text-white font-black tracking-[0.25em] text-xl">
              AMISTE
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden ml-2 p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          {/* PRIMÁRIOS */}
          <div>
            <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Principal
            </p>
            <div className="space-y-1">
              {primaryNavItems
                .filter((i) => i.visible)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group",
                        isActive
                          ? "bg-amiste-primary text-white shadow-lg shadow-amiste-primary/30"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1",
                      )}
                    >
                      <Icon
                        size={20}
                        className={clsx(
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-gray-600 transition-colors",
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* SECUNDÁRIOS (Mobile) */}
          <div className="pt-2 border-t border-gray-100 lg:hidden">
            <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-4">
              Menu Secundário
            </p>
            <div className="space-y-1">
              {secondaryNavItems
                .filter((i) => i.visible)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                        isActive
                          ? "bg-red-50 text-amiste-primary"
                          : "text-gray-500 hover:bg-gray-50",
                      )}
                    >
                      <Icon
                        size={20}
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

          {/* ÁREA DEV / GESTÃO */}
          {permissions?.canManageUsers && !isImpersonating && (
            <div className="pt-4 mt-2">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-blue-600 bg-blue-50 border border-dashed border-blue-200 hover:bg-blue-100 transition-all"
              >
                <UserPlus size={18} /> Cadastrar Equipe
              </Link>
            </div>
          )}

          {realProfile &&
            ["DEV", "Dono"].includes(realProfile.role) &&
            !isImpersonating && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Shield size={12} /> Controle de Acesso
                </p>
                <div className="space-y-2">
                  {teamMembers.map((member) => {
                    const isVip = ["DEV", "Dono"].includes(member.role);
                    const initials = member.full_name
                      ? member.full_name.substring(0, 2).toUpperCase()
                      : "??";
                    return (
                      <div
                        key={member.id}
                        className="group flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100"
                      >
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Entrar no modo visualização como ${member.role}?`,
                              )
                            ) {
                              startImpersonation(member);
                              toast.success(
                                `Visualizando como ${member.full_name}`,
                              );
                            }
                          }}
                          className="flex-1 text-left flex items-center gap-3 overflow-hidden"
                        >
                          <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 overflow-hidden">
                            {member.avatar_url ? (
                              <img
                                src={member.avatar_url}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-bold text-gray-700 truncate">
                              {member.nickname ||
                                member.full_name?.split(" ")[0]}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded border w-fit font-bold ${getRoleStyle(member.role)}`}
                            >
                              {member.role}
                            </span>
                          </div>
                        </button>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleEditMember(member, e)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 size={14} />
                          </button>
                          {!isVip && (
                            <button
                              onClick={(e) =>
                                handleDeleteMember(
                                  member.id,
                                  member.full_name,
                                  member.role,
                                  e,
                                )
                              }
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL E HEADER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-10 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
