import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast"; // <--- Import do Toast
import {
  ClipboardList,
  Wrench,
  FileText,
  Coffee,
  DollarSign,
  ArrowRight,
  Clock,
  Package,
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
      // Só busca dados se tiver permissão de ver checklist ou financeiro
      if (permissions.canCreateChecklist || permissions.canViewFinancials) {
        const { data: checklists, error } = await supabase
          .from("checklists")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        if (checklists) setRecentChecklists(checklists);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados do painel.");
      setLoading(false);
    }
  }

  function MenuCard({ to, icon: Icon, title, desc, colorClass, permission }) {
    // Se a permissão for undefined ou false, não renderiza o card
    if (!permission) return null;

    const colorStyles = {
      red: "bg-red-50 text-red-600 group-hover:bg-red-100",
      green: "bg-green-50 text-green-600 group-hover:bg-green-100",
      orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
      blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
      pink: "bg-pink-50 text-pink-600 group-hover:bg-pink-100",
      purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
      teal: "bg-teal-50 text-teal-600 group-hover:bg-teal-100",
    };

    const style = colorStyles[colorClass] || colorStyles.red;

    return (
      <Link
        to={to}
        className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-start gap-4 hover:-translate-y-1 overflow-hidden"
      >
        <div
          className={`p-3.5 rounded-2xl transition-colors duration-300 ${style}`}
        >
          <Icon size={28} strokeWidth={1.5} />
        </div>

        <div className="z-10">
          <h3 className="font-bold text-gray-800 text-lg group-hover:text-gray-900 transition-colors flex items-center justify-between w-full">
            {title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mt-1">{desc}</p>
        </div>

        {/* Indicador de "Ir" (Seta) que aparece no hover */}
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 text-gray-300">
          <ArrowRight size={24} />
        </div>
      </Link>
    );
  }

  const firstName =
    userProfile?.nickname ||
    userProfile?.full_name?.split(" ")[0] ||
    "Visitante";

  return (
    <div className="min-h-screen bg-gray-50/50 animate-fade-in pb-20">
      {/* HEADER BOAS VINDAS */}
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Olá, {firstName}!
        </h1>
        <p className="text-gray-500 mt-1">
          Bem-vindo ao painel de controle Amiste.
        </p>
      </div>

      {/* --- GRID DE ATALHOS --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        <MenuCard
          to="/checklists"
          icon={ClipboardList}
          title="Checklist Digital"
          desc="Crie e gerencie ordens de serviço."
          colorClass="red"
          permission={permissions.canCreateChecklist}
        />

        <MenuCard
          to="/financial"
          icon={DollarSign}
          title="Financeiro"
          desc="Resumo de receitas e serviços."
          colorClass="green"
          permission={permissions.canViewFinancials}
        />

        <MenuCard
          to="/machines"
          icon={Coffee}
          title="Catálogo Máquinas"
          desc="Inventário de equipamentos."
          colorClass="orange"
          permission={permissions.canManageMachines}
        />

        <MenuCard
          to="/portfolio"
          icon={FileText}
          title="Gerador Propostas"
          desc="Crie orçamentos em PDF."
          colorClass="blue"
          permission={permissions.canManagePortfolio}
        />

        <MenuCard
          to="/supplies"
          icon={Package}
          title="Insumos"
          desc="Gestão de produtos e estoque."
          colorClass="pink"
          permission={permissions.canManageSupplies}
        />

        <MenuCard
          to="/wiki"
          icon={Wrench}
          title="Wiki Técnica"
          desc="Base de conhecimento."
          colorClass="purple"
          permission={true}
        />
      </div>

      {/* --- TABELA RECENTES --- */}
      {(permissions.canCreateChecklist || permissions.canViewFinancials) && (
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="font-bold text-gray-700 text-lg flex items-center gap-2">
              <Clock size={20} className="text-gray-400" /> Atividades Recentes
            </h2>
            <Link
              to="/checklists"
              className="text-sm font-bold text-amiste-primary hover:text-red-700 transition-colors"
            >
              Ver histórico completo
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-5 pl-6">Cliente / Evento</th>
                    <th className="p-5">Equipamento</th>
                    <th className="p-5">Data</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right pr-6">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">
                        Carregando...
                      </td>
                    </tr>
                  ) : recentChecklists.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-gray-400 italic"
                      >
                        Nenhuma instalação recente encontrada.
                      </td>
                    </tr>
                  ) : (
                    recentChecklists.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        <td className="p-5 pl-6 font-bold text-gray-700">
                          {item.client_name || item.event_name}
                        </td>
                        <td className="p-5 text-gray-600 flex items-center gap-2">
                          <Coffee size={14} className="text-gray-300" />
                          {item.machine_name || "N/A"}
                        </td>
                        <td className="p-5 text-gray-500">
                          {item.install_date
                            ? new Date(item.install_date).toLocaleDateString(
                                "pt-BR",
                              )
                            : "-"}
                        </td>
                        <td className="p-5">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                              item.status === "Finalizado"
                                ? "bg-green-50 text-green-600 border-green-100"
                                : "bg-amber-50 text-amber-600 border-amber-100"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-5 pr-6 text-right">
                          <Link
                            to={`/checklists/${item.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-amiste-primary transition-colors bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                          >
                            Detalhes <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
