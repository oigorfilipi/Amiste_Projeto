import { useContext, useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import { ProfileModal } from "../components/ProfileModal";
import { Header } from "../components/Header";
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  FileText,
  Coffee,
  UserPlus,
  Users, // Ícone usado no título da seção de equipe? Não, foi usado Shield. Vou manter importado caso queira trocar.
  DollarSign,
  Trash2,
  Edit2,
  Shield,
  Package,
} from "lucide-react";
import clsx from "clsx";

export function DefaultLayout() {
  const location = useLocation();
  const { realProfile, permissions, isImpersonating, startImpersonation } =
    useContext(AuthContext);

  const [teamMembers, setTeamMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState(null);

  useEffect(() => {
    if (realProfile && ["DEV", "Dono"].includes(realProfile.role)) {
      fetchTeam();
    }
  }, [realProfile, isImpersonating]);

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
      return alert(
        "Ação Bloqueada: Não é possível excluir contas de nível Superior (Dono/DEV).",
      );
    }
    if (!confirm(`Tem certeza que deseja EXCLUIR a conta de "${name}"?`))
      return;

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      alert(`Usuário excluído.`);
      fetchTeam();
    } catch (error) {
      alert("Erro: " + error.message);
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

  // --- MENU LATERAL ---
  const navItems = [
    { path: "/home", icon: LayoutDashboard, label: "Início", visible: true },
    {
      path: "/financial",
      icon: DollarSign,
      label: "Financeiro",
      visible: permissions.canViewFinancials,
    },
    {
      path: "/checklists",
      icon: ClipboardList,
      label: "Checklist",
      visible: permissions.canCreateChecklist,
    },
    { path: "/wiki", icon: Wrench, label: "Manutenção", visible: true },
    {
      path: "/portfolio",
      icon: FileText,
      label: "Portfólio",
      visible: permissions.canManagePortfolio,
    },
    {
      path: "/machines",
      icon: Coffee,
      label: "Máquinas",
      visible: permissions.canManageMachines,
    },
    {
      path: "/supplies",
      icon: Package,
      label: "Insumos",
      visible: permissions.canManageSupplies,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans text-gray-900">
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileToEdit={profileToEdit}
        currentUserRole={realProfile?.role}
        onSave={() => fetchTeam()}
      />

      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-30 transition-all duration-300">
        {/* Logo Area (Link para Home) */}
        <div className="h-20 flex items-center justify-center border-b border-gray-100 px-6">
          <Link
            to="/home"
            className="bg-amiste-primary w-full py-3 rounded-xl shadow-lg shadow-red-200 flex items-center justify-center transform hover:scale-[1.02] transition-transform cursor-pointer block text-center decoration-0"
          >
            <span className="text-white font-black tracking-[0.25em] text-xl">
              AMISTE
            </span>
          </Link>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Operacional
          </p>

          {navItems
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

          {/* Botão Cadastrar Equipe */}
          {permissions.canManageUsers && !isImpersonating && (
            <div className="pt-6 mt-2">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-blue-600 bg-blue-50 border border-dashed border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all"
              >
                <UserPlus size={18} /> Cadastrar Equipe
              </Link>
            </div>
          )}

          {/* LISTA DE EQUIPE */}
          {realProfile &&
            ["DEV", "Dono"].includes(realProfile.role) &&
            !isImpersonating && (
              <div className="mt-8 pt-6 border-t border-gray-100">
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
                            )
                              startImpersonation(member);
                          }}
                          className="flex-1 text-left flex items-center gap-3"
                        >
                          {/* Avatar */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200`}
                          >
                            {initials}
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700 truncate w-24">
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

                        {/* Ações */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleEditMember(member, e)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
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
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
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

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header />

        <main className="flex-1 overflow-auto p-6 md:p-10 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
