import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Filter,
  History as HistoryIcon,
  User,
  Calendar,
  Trash2,
  Edit2,
  Plus,
  Clock,
  ShieldAlert,
  Activity,
  Search,
} from "lucide-react";

export function History() {
  const { user, permissions } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterModule, setFilterModule] = useState("Todos");
  const [filterAction, setFilterAction] = useState("Todos");

  // VERIFICAÇÃO DE ACESSO
  const hasAccess =
    permissions?.HistoricoGeral !== "Nothing" &&
    permissions?.HistoricoGeral !== "Ghost" &&
    permissions?.HistoricoGeral !== undefined;

  useEffect(() => {
    if (!hasAccess) return;

    fetchData();

    const subscription = supabase
      .channel("realtime_history")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "app_history" },
        (payload) => {
          setLogs((current) => [payload.new, ...current]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [hasAccess]);

  async function fetchData() {
    try {
      const { data: historyData, error: historyError } = await supabase
        .from("app_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (historyError) throw historyError;

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, nickname, full_name, role");

      if (profilesError) throw profilesError;

      const map = {};
      profilesData.forEach((p) => {
        map[p.id] = p;
      });
      setUserMap(map);

      if (historyData) setLogs(historyData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar histórico de atividades.");
    } finally {
      setLoading(false);
    }
  }

  const getModuleLabel = (mod) => {
    const modules = {
      machines: "Máquina",
      checklists: "Checklist",
      portfolios: "Portfólio",
      wiki_solutions: "Manutenção",
      financial: "Financeiro",
      labels: "Etiquetas",
    };
    return modules[mod] || mod;
  };

  const getActionStyle = (action) => {
    switch (action) {
      case "Criação":
        return {
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          accent: "bg-emerald-500",
          icon: Plus,
        };
      case "Edição":
        return {
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-100",
          accent: "bg-blue-500",
          icon: Edit2,
        };
      case "Exclusão":
        return {
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-100",
          accent: "bg-red-500",
          icon: Trash2,
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-100",
          accent: "bg-gray-400",
          icon: Clock,
        };
    }
  };

  if (!hasAccess && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 animate-fade-in">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-500 mb-8 font-medium">
            Você não tem permissão para visualizar o histórico de auditoria.
          </p>
          <Link
            to="/"
            className="flex items-center justify-center w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter((log) => {
    const matchModule =
      filterModule === "Todos" || getModuleLabel(log.module) === filterModule;
    const matchAction =
      filterAction === "Todos" || log.action_type === filterAction;
    return matchModule && matchAction;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <HistoryIcon className="text-amiste-primary" size={24} />
            </div>
            Histórico Global
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Auditoria em tempo real de todas as ações realizadas no sistema.
          </p>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-stretch md:items-center mb-8">
          <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest pl-2">
            <Filter size={14} /> Filtros
          </div>

          <div className="h-6 w-px bg-gray-100 hidden md:block"></div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amiste-primary/20 outline-none transition-all cursor-pointer"
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
            >
              <option>Todos os Módulos</option>
              <option>Máquina</option>
              <option>Checklist</option>
              <option>Portfólio</option>
              <option>Manutenção</option>
              <option>Financeiro</option>
              <option>Etiquetas</option>
            </select>

            <select
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amiste-primary/20 outline-none transition-all cursor-pointer"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option>Todas as Ações</option>
              <option>Criação</option>
              <option>Edição</option>
              <option>Exclusão</option>
            </select>
          </div>

          <div className="text-[11px] font-black text-amiste-primary bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 text-center min-w-[110px]">
            {filteredLogs.length} EVENTOS
          </div>
        </div>

        {/* LISTA DE EVENTOS */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-2xl border border-gray-100"
              ></div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 mx-auto max-w-lg shadow-sm">
            <HistoryIcon size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-gray-700 font-bold text-lg">
              Nenhum registro encontrado
            </h3>
            <p className="text-gray-400 text-sm">
              Tente ajustar os filtros para encontrar o que procura.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const style = getActionStyle(log.action_type);
              const Icon = style.icon;

              const authorProfile = userMap[log.user_id];
              const authorName =
                authorProfile?.nickname ||
                authorProfile?.full_name?.split(" ")[0] ||
                "Sistema";
              const authorRole = authorProfile?.role || "Automático";

              return (
                <div
                  key={log.id}
                  className="group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center relative overflow-hidden"
                >
                  {/* Accent Line */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.accent}`}
                  ></div>

                  {/* Icon & Action Type (Mobile logic integrated) */}
                  <div className="flex w-full md:w-auto items-center gap-3 shrink-0">
                    <div
                      className={`p-3 rounded-xl ${style.bg} ${style.color} border ${style.border} shadow-sm`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="md:hidden flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${style.bg} ${style.color}`}
                        >
                          {log.action_type}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex-1 w-full">
                    <div className="hidden md:flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${style.bg} ${style.color} border ${style.border}`}
                      >
                        {log.action_type}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 border border-gray-200">
                        {getModuleLabel(log.module)}
                      </span>
                      <div className="ml-auto flex items-center gap-1.5 text-gray-400 font-bold text-[10px]">
                        <Calendar size={12} className="text-gray-300" />
                        {new Date(log.created_at).toLocaleDateString()}
                        <span className="text-gray-200 mx-1">•</span>
                        <Clock size={12} className="text-gray-300" />
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-700 text-sm md:text-[15px] leading-snug">
                      {log.description}
                    </h3>
                  </div>

                  {/* Author Section */}
                  <div className="flex items-center gap-3 w-full md:w-auto md:pl-6 md:border-l border-gray-100 min-w-[160px]">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${
                        authorProfile
                          ? "bg-gray-50 border-gray-200 text-gray-400"
                          : "bg-red-50 border-red-100 text-red-400"
                      }`}
                    >
                      {authorProfile ? (
                        <User size={18} />
                      ) : (
                        <ShieldAlert size={18} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-gray-800 truncate max-w-[100px]">
                        {log.user_id === user?.id ? "Você" : authorName}
                      </span>
                      <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">
                        {authorRole}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
