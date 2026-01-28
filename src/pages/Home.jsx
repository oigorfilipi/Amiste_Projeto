import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import {
  ClipboardList,
  Wrench,
  FileText,
  Coffee,
  Calendar,
  DollarSign,
  Lock,
  Tag, // <--- ADICIONEI O ÍCONE AQUI
} from "lucide-react";

export function Home() {
  const { permissions, userProfile } = useContext(AuthContext);
  const [recentChecklists, setRecentChecklists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      if (permissions.canCreateChecklist || permissions.canViewFinancials) {
        const { data: checklists } = await supabase
          .from("checklists")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);
        if (checklists) setRecentChecklists(checklists);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  function MenuCard({ to, icon: Icon, title, desc, color, permission }) {
    if (!permission) return null;

    return (
      <Link
        to={to}
        className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-start gap-4 hover:-translate-y-1"
      >
        <div
          className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}
        >
          <Icon size={28} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg group-hover:text-amiste-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </div>
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Olá, {userProfile?.nickname || userProfile?.full_name?.split(" ")[0]}!
        </h1>
        <p className="text-gray-500">Bem-vindo ao painel de controle Amiste.</p>
      </div>

      {/* --- GRID DE ATALHOS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* CHECKLIST */}
        <MenuCard
          to="/checklists"
          icon={ClipboardList}
          title="Checklist Digital"
          desc="Crie e gerencie ordens de serviço."
          color="red"
          permission={permissions.canCreateChecklist}
        />

        {/* FINANCEIRO */}
        <MenuCard
          to="/financial"
          icon={DollarSign}
          title="Financeiro"
          desc="Resumo de receitas e serviços."
          color="green"
          permission={permissions.canViewFinancials}
        />

        {/* MÁQUINAS */}
        <MenuCard
          to="/machines"
          icon={Coffee}
          title="Catálogo Máquinas"
          desc="Gerencie o inventário de equipamentos."
          color="orange"
          permission={permissions.canManageMachines}
        />

        {/* PORTFÓLIO */}
        <MenuCard
          to="/portfolio"
          icon={FileText}
          title="Gerador Propostas"
          desc="Crie orçamentos em PDF."
          color="blue"
          permission={permissions.canManagePortfolio}
        />

        {/* --- NOVO: TABELA DE PREÇOS --- */}
        <MenuCard
          to="/prices"
          icon={Tag}
          title="Tabela de Preços"
          desc="Consulta rápida de valores de venda."
          color="pink"
          permission={true}
        />

        {/* WIKI */}
        <MenuCard
          to="/wiki"
          icon={Wrench}
          title="Wiki Técnica"
          desc="Base de conhecimento e soluções."
          color="purple"
          permission={true}
        />
      </div>

      {/* --- TABELA RECENTES --- */}
      {(permissions.canCreateChecklist || permissions.canViewFinancials) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList className="text-amiste-primary" size={20} />
              Últimas Instalações
            </h2>
            <Link
              to="/checklists"
              className="text-sm font-bold text-amiste-primary hover:underline"
            >
              Ver tudo
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Máquina</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-400">
                      Carregando...
                    </td>
                  </tr>
                ) : recentChecklists.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-400">
                      Nenhum registro recente.
                    </td>
                  </tr>
                ) : (
                  recentChecklists.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-bold text-gray-700">
                        {item.client_name || item.event_name}
                      </td>
                      <td className="p-4 text-gray-600">{item.machine_name}</td>
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {item.install_date
                            ? new Date(item.install_date).toLocaleDateString(
                                "pt-BR",
                              )
                            : "-"}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            item.status === "Finalizado"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/checklists/${item.id}`}
                          className="text-gray-400 hover:text-amiste-primary transition-colors font-bold text-xs"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
