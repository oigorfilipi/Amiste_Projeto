import { useContext, useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import { ProfileModal } from "../components/ProfileModal";
import { Header } from "../components/Header"; // <--- IMPORTADO O HEADER
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  FileText,
  Coffee,
  UserPlus,
  Users,
  DollarSign,
  Trash2,
  Edit2,
} from "lucide-react";
import clsx from "clsx";
import logoImg from "../assets/img/logo.png";

export function DefaultLayout() {
  const location = useLocation();
  const { realProfile, permissions, isImpersonating, startImpersonation } =
    useContext(AuthContext);

  const [teamMembers, setTeamMembers] = useState([]);

  // --- ESTADOS DO MODAL (Para editar OUTROS membros da equipe) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState(null);

  useEffect(() => {
    // SÓ DEV E DONO VEEM A LISTA DE EQUIPE NA LATERAL
    if (realProfile && ["DEV", "Dono"].includes(realProfile.role)) {
      fetchTeam();
    }
  }, [realProfile, isImpersonating]);

  async function fetchTeam() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", realProfile?.id); // Não traz a si mesmo (pq edita no Header)

    if (data) setTeamMembers(data);
  }

  // --- FUNÇÕES DE AÇÃO DA LISTA ---

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

  function getRoleTag(role) {
    if (role === "DEV") return "DEV";
    if (role === "ADM") return "ADM";
    if (role === "Dono") return "BOSS";
    return role ? role.substring(0, 3).toUpperCase() : "UNK";
  }

  // --- MENU LATERAL (SÓ OPERACIONAL) ---
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
    // Histórico e Preços foram removidos daqui (foram pro Header)
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Modal para editar EQUIPE (O modal de editar a si mesmo fica no Header) */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileToEdit={profileToEdit}
        currentUserRole={realProfile?.role}
        onSave={() => fetchTeam()}
      />

      {/* --- SIDEBAR LIMPA --- */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-30">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100 bg-white p-4">
          <img src={logoImg} alt="Logo" className="h-8 w-auto object-contain" />
        </div>

        {/* Navegação Principal */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-gray-400 uppercase mb-2">
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
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-amiste-primary text-white shadow-md shadow-red-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Icon size={18} /> {item.label}
                </Link>
              );
            })}

          {/* Botão Cadastrar Equipe */}
          {permissions.canManageUsers && !isImpersonating && (
            <div className="mt-6">
              <Link
                to="/register"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 border border-dashed border-blue-200 transition-colors"
              >
                <UserPlus size={18} /> Nova Conta
              </Link>
            </div>
          )}

          {/* LISTA DE EQUIPE (Apenas DEV e Dono veem aqui) */}
          {realProfile &&
            ["DEV", "Dono"].includes(realProfile.role) &&
            !isImpersonating && (
              <div className="mt-8 pt-4 border-t border-gray-100">
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                  <Users size={12} /> Gerenciar Acesso
                </p>
                <div className="space-y-1">
                  {teamMembers.map((member) => {
                    const isVip = ["DEV", "Dono"].includes(member.role);
                    return (
                      <div
                        key={member.id}
                        className="group flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {/* Botão Testar */}
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Entrar no modo visualização como ${member.role}?`,
                              )
                            )
                              startImpersonation(member);
                          }}
                          className="flex-1 text-left flex items-center gap-2"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700 truncate w-24">
                              {member.nickname ||
                                member.full_name?.split(" ")[0]}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded w-fit ${member.role === "DEV" ? "bg-purple-100 text-purple-700 font-bold" : "bg-gray-100 text-gray-500"}`}
                            >
                              {getRoleTag(member.role)}
                            </span>
                          </div>
                        </button>

                        {/* Ações (Só aparecem no hover) */}
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleEditMember(member, e)}
                            className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar Cargo/Perfil"
                          >
                            <Edit2 size={12} />
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
                              className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Excluir"
                            >
                              <Trash2 size={12} />
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

      {/* --- ÁREA PRINCIPAL (HEADER + CONTEÚDO) --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* O NOVO HEADER AQUI NO TOPO */}
        <Header />

        {/* Onde as páginas carregam */}
        <main className="flex-1 overflow-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
