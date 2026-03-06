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
  Inbox,
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
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar atividades recentes.");
    } finally {
      setLoading(false);
    }
  }

  function MenuCard({ to, icon, title, desc, colorClass, permission }) {
    if (!permission) return null;

    const IconComponent = icon;

    const colorStyles = {
      red: "bg-red-50 text-red-600 group-hover:bg-red-100",
      green: "bg-green-50 text-green-600 group-hover:bg-green-100",
      orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-100",
      blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
      pink: "bg-pink-50 text-pink-600 group-hover:bg-pink-100",
      purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
    };

    const style = colorStyles[colorClass] || colorStyles.red;

    return (
      <Link
        to={to}
        className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 p-6 flex flex-col items-start gap-4 hover:-translate-y-1 overflow-hidden"
      >
        <div
          className={`p-3.5 rounded-2xl transition-colors duration-300 ${style}`}
        >
          <IconComponent size={28} strokeWidth={1.75} />
        </div>
        <div className="z-10 w-full">
          <h3 className="font-bold text-gray-800 text-lg group-hover:text-gray-900 transition-colors w-full">
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

  const getStatusBadge = (status) => {
    const isFinished = status === "Finalizado";
    return (
      <span
        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${isFinished ? "bg-green-50 text-green-600 border-green-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 animate-fade-in pb-20">
      <div className="max-w-7xl mx-auto mb-8 px-4 md:px-8 pt-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 tracking-tight">
          Olá, {firstName}!
        </h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Bem-vindo ao painel de controle operacional.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-10">
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

      {hasChecklistAccess && (
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-5">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Clock size={20} className="text-amiste-primary" /> Atividades
              Recentes
            </h2>
            <Link
              to="/checklists"
              className="text-sm font-bold text-gray-500 hover:text-amiste-primary transition-colors flex items-center gap-1"
            >
              Ver tudo <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((skeleton) => (
                <div
                  key={skeleton}
                  className="w-full h-20 bg-white rounded-xl border border-gray-100 flex items-center p-4 animate-pulse"
                >
                  <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                  <div className="w-1/4 h-4 bg-gray-100 rounded ml-auto"></div>
                </div>
              ))}
            </div>
          ) : recentChecklists.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 flex flex-col items-center justify-center text-gray-400 border border-gray-100 border-dashed">
              <div className="bg-gray-50 p-4 rounded-full mb-3">
                <Inbox size={32} className="text-gray-300" />
              </div>
              <p className="font-medium text-sm">
                Nenhuma instalação recente encontrada.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden space-y-3">
                {recentChecklists.map((item) => (
                  <Link
                    key={item.id}
                    to={`/checklists/${item.id}`}
                    className="block bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">
                          {item.client_name || item.event_name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mt-1">
                          <Coffee size={12} className="text-gray-400" />{" "}
                          {item.machine_name || "N/A"}
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Calendar size={12} />{" "}
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

              {/* DESKTOP */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-4 px-6">Cliente / Evento</th>
                        <th className="py-4 px-5">Equipamento</th>
                        <th className="py-4 px-5">Data</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-6 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentChecklists.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/80 transition-colors group"
                        >
                          <td className="py-4 px-6 font-bold text-gray-700">
                            {item.client_name || item.event_name}
                          </td>
                          <td className="py-4 px-5 text-gray-600 flex items-center gap-2 font-medium">
                            <Coffee size={14} className="text-gray-400" />{" "}
                            {item.machine_name || "N/A"}
                          </td>
                          <td className="py-4 px-5 text-gray-500 font-medium">
                            {item.install_date
                              ? new Date(item.install_date).toLocaleDateString(
                                  "pt-BR",
                                )
                              : "-"}
                          </td>
                          <td className="py-4 px-5">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Link
                              to={`/checklists/${item.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-amiste-primary bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all"
                            >
                              Ver Detalhes <ArrowRight size={14} />
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
