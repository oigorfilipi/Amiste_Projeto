import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Wrench,
  FileText,
  Coffee,
  DollarSign,
  ArrowRight,
  Clock,
  Package,
  Calendar,
  ChevronRight,
} from "lucide-react";

export function Home() {
  const { permissions, userProfile } = useContext(AuthContext);
  const [recentChecklists, setRecentChecklists] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- MAPEAMENTO DE ACESSO DA NOVA MATRIZ ---
  const hasChecklistAccess =
    permissions?.Checklist !== "Nothing" && permissions?.Checklist !== "Ghost";
  const hasFinanceiroAccess =
    permissions?.Financeiro !== "Nothing" &&
    permissions?.Financeiro !== "Ghost";
  const hasMaquinasAccess =
    permissions?.Maquinas !== "Nothing" && permissions?.Maquinas !== "Ghost";
  const hasPortfolioAccess =
    permissions?.Portfolio !== "Nothing" && permissions?.Portfolio !== "Ghost";
  const hasInsumosAccess =
    permissions?.Insumos !== "Nothing" && permissions?.Insumos !== "Ghost";
  const hasWikiAccess =
    permissions?.Wiki !== "Nothing" && permissions?.Wiki !== "Ghost";

  useEffect(() => {
    fetchDashboardData();
  }, [hasChecklistAccess]);

  async function fetchDashboardData() {
    try {
      if (hasChecklistAccess) {
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

  // Helper para formatar status
  const getStatusBadge = (status) => {
    const isFinished = status === "Finalizado";
    return (
      <span
        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
          isFinished
            ? "bg-green-50 text-green-600 border-green-100"
            : "bg-amber-50 text-amber-600 border-amber-100"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 animate-fade-in pb-20">
      {/* HEADER BOAS VINDAS */}
      <div className="max-w-7xl mx-auto mb-8 px-4 md:px-8 pt-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">
          Olá, {firstName}!
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Bem-vindo ao painel de controle Amiste.
        </p>
      </div>

      {/* --- GRID DE ATALHOS --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-10">
        <MenuCard
          to="/checklists"
          icon={ClipboardList}
          title="Checklist Digital"
          desc="Crie e gerencie ordens de serviço."
          colorClass="red"
          permission={hasChecklistAccess}
        />

        <MenuCard
          to="/financial"
          icon={DollarSign}
          title="Financeiro"
          desc="Resumo de receitas e serviços."
          colorClass="green"
          permission={hasFinanceiroAccess}
        />

        <MenuCard
          to="/machines"
          icon={Coffee}
          title="Catálogo Máquinas"
          desc="Inventário de equipamentos."
          colorClass="orange"
          permission={hasMaquinasAccess}
        />

        <MenuCard
          to="/portfolio"
          icon={FileText}
          title="Gerador Propostas"
          desc="Crie orçamentos em PDF."
          colorClass="blue"
          permission={hasPortfolioAccess}
        />

        <MenuCard
          to="/supplies"
          icon={Package}
          title="Insumos"
          desc="Gestão de produtos e estoque."
          colorClass="pink"
          permission={hasInsumosAccess}
        />

        <MenuCard
          to="/wiki"
          icon={Wrench}
          title="Wiki Técnica"
          desc="Base de conhecimento."
          colorClass="purple"
          permission={hasWikiAccess}
        />
      </div>

      {/* --- ATIVIDADES RECENTES --- */}
      {hasChecklistAccess && (
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-bold text-gray-700 text-lg flex items-center gap-2">
              <Clock size={20} className="text-gray-400" /> Atividades Recentes
            </h2>
            <Link
              to="/checklists"
              className="text-sm font-bold text-amiste-primary hover:text-red-700 transition-colors"
            >
              Ver tudo
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100">
              Carregando...
            </div>
          ) : recentChecklists.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-100 italic">
              Nenhuma instalação recente encontrada.
            </div>
          ) : (
            <>
              {/* VERSÃO MOBILE: CARDS (Visível apenas em telas pequenas) */}
              <div className="md:hidden space-y-3">
                {recentChecklists.map((item) => (
                  <Link
                    key={item.id}
                    to={`/checklists/${item.id}`}
                    className="block bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">
                          {item.client_name || item.event_name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Coffee size={12} />
                          {item.machine_name || "N/A"}
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={12} />
                        {item.install_date
                          ? new Date(item.install_date).toLocaleDateString(
                              "pt-BR",
                            )
                          : "-"}
                      </div>
                      <div className="text-amiste-primary text-xs font-bold flex items-center gap-1">
                        Detalhes <ChevronRight size={14} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* VERSÃO DESKTOP: TABELA (Visível apenas em telas médias pra cima) */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                      {recentChecklists.map((item) => (
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
                          <td className="p-5">{getStatusBadge(item.status)}</td>
                          <td className="p-5 pr-6 text-right">
                            <Link
                              to={`/checklists/${item.id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-amiste-primary transition-colors bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                            >
                              Detalhes <ArrowRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
