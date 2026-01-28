import { useContext, useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  FileText,
  Coffee,
  LogOut,
  History,
  UserPlus,
  Users,
  Eye,
  XCircle,
  DollarSign,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import logoImg from "../assets/img/logo.png";

export function DefaultLayout() {
  const location = useLocation();
  const {
    userProfile,
    realProfile,
    permissions,
    logOut,
    isImpersonating,
    startImpersonation,
    stopImpersonation,
  } = useContext(AuthContext);

  const [teamMembers, setTeamMembers] = useState([]);

  // Buscar lista de membros (Só se for ADM/Dono e NÃO estiver testando outro usuário)
  useEffect(() => {
    if (realProfile && ["ADM", "Dono"].includes(realProfile.role)) {
      fetchTeam();
    }
  }, [realProfile, isImpersonating]); // Recarrega se sair do modo teste

  async function fetchTeam() {
    // Busca todos que NÃO são o próprio usuário logado (para não se excluir)
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", realProfile?.id);

    if (data) setTeamMembers(data);
  }

  // --- NOVA FUNÇÃO DE DELETAR ---
  async function handleDeleteMember(id, name) {
    if (
      !confirm(
        `Tem certeza que deseja EXCLUIR a conta de "${name}"?\n\nEssa ação é irreversível.`,
      )
    )
      return;

    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);

      if (error) throw error;

      alert(`Usuário "${name}" excluído com sucesso.`);
      fetchTeam(); // Atualiza a lista na hora
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir: " + error.message);
    }
  }

  // --- ITENS DO MENU ---
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
      path: "/history",
      icon: History,
      label: "Histórico",
      visible: permissions.canViewHistory,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="h-21 flex items-center justify-center border-b border-gray-100 bg-amiste-primary p-4 sticky top-0 z-10">
          <img
            src={logoImg}
            alt="Logo"
            className="h-full w-auto object-contain"
          />
        </div>

        {/* --- CABEÇALHO DO PERFIL --- */}
        <div
          className={`p-6 border-b border-gray-100 transition-colors ${isImpersonating ? "bg-amber-50" : "bg-gray-50"}`}
        >
          {isImpersonating && (
            <div className="mb-2 text-xs font-bold text-amber-600 flex items-center gap-1 uppercase tracking-wider">
              <Eye size={12} /> Visualizando como:
            </div>
          )}
          <p className="text-sm font-bold text-gray-900 truncate">
            {userProfile?.nickname || userProfile?.full_name || "Carregando..."}
          </p>
          <p className="text-xs text-gray-500">
            Cargo: <span className="font-bold">{userProfile?.role}</span>
          </p>

          {isImpersonating && (
            <button
              onClick={stopImpersonation}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold py-1.5 rounded transition-colors"
            >
              <XCircle size={14} /> Sair do Teste
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
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
                      ? "bg-red-50 text-amiste-primary"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <Icon size={20} /> {item.label}
                </Link>
              );
            })}

          {/* Botão Cadastro */}
          {permissions.canManageUsers && !isImpersonating && (
            <Link
              to="/register"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 mt-4 border border-dashed border-blue-200"
            >
              <UserPlus size={20} /> Cadastrar Equipe
            </Link>
          )}

          {/* --- LISTA DE EQUIPE (COM OPÇÃO DE EXCLUIR) --- */}
          {realProfile &&
            ["ADM", "Dono"].includes(realProfile.role) &&
            !isImpersonating && (
              <div className="mt-8 pt-4 border-t border-gray-100">
                <p className="px-3 text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
                  <Users size={12} /> Gerenciar Acesso
                </p>
                <div className="space-y-1">
                  {teamMembers.length === 0 && (
                    <p className="text-xs text-gray-400 px-3">
                      Nenhum membro encontrado.
                    </p>
                  )}

                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="group flex items-center justify-between px-2 py-1 hover:bg-gray-100 rounded-lg"
                    >
                      {/* Botão para Testar (Lado Esquerdo) */}
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Entrar no modo visualização como ${member.role}?`,
                            )
                          ) {
                            startImpersonation(member);
                          }
                        }}
                        className="flex-1 text-left flex items-center gap-2 py-1"
                        title="Clique para testar este perfil"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700 truncate w-24">
                            {member.nickname || member.full_name?.split(" ")[0]}
                          </span>
                          <span className="text-[9px] text-gray-400 bg-gray-200 px-1 rounded w-fit">
                            {member.role
                              ? member.role.substring(0, 3).toUpperCase()
                              : "UNK"}
                          </span>
                        </div>
                      </button>

                      {/* Botão Excluir (Só aparece no Hover) */}
                      <button
                        onClick={() =>
                          handleDeleteMember(member.id, member.full_name)
                        }
                        className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                        title="Excluir Colaborador"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logOut}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-amiste-primary transition-colors"
          >
            <LogOut size={20} /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {isImpersonating && (
          <div className="bg-amber-100 text-amber-800 text-xs font-bold text-center py-1 border-b border-amber-200 animate-pulse">
            ⚠️ MODO TESTE ATIVO: Você está visualizando o sistema como{" "}
            {userProfile.role.toUpperCase()}
          </div>
        )}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
