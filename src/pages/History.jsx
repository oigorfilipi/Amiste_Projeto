import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
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
} from "lucide-react";

export function History() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterModule, setFilterModule] = useState("Todos");
  const [filterAction, setFilterAction] = useState("Todos");

  useEffect(() => {
    fetchData();

    // Atualizar em tempo real
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
  }, []);

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
    } finally {
      setLoading(false);
    }
  }

  // Helpers Visuais
  const getModuleLabel = (mod) => {
    switch (mod) {
      case "machines":
        return "Máquina";
      case "checklists":
        return "Checklist";
      case "portfolios":
        return "Portfólio";
      case "wiki_solutions":
        return "Manutenção";
      case "financial":
        return "Financeiro";
      default:
        return mod;
    }
  };

  const getActionStyle = (action) => {
    switch (action) {
      case "Criação":
        return {
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-100",
          icon: Plus,
        };
      case "Edição":
        return {
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-100",
          icon: Edit2,
        };
      case "Exclusão":
        return {
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-100",
          icon: Trash2,
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-100",
          icon: Clock,
        };
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchModule =
      filterModule === "Todos" || getModuleLabel(log.module) === filterModule;
    const matchAction =
      filterAction === "Todos" || log.action_type === filterAction;
    return matchModule && matchAction;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      {/* CABEÇALHO */}
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Histórico Global
          </h1>
          <p className="text-gray-500 mt-1">
            Linha do tempo de atividades e auditoria do sistema.
          </p>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center mb-8">
          <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider pl-2">
            <Filter size={16} /> Filtros
          </div>

          <div className="h-8 w-px bg-gray-100 hidden md:block"></div>

          <select
            className="flex-1 p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amiste-primary outline-none transition-all cursor-pointer"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            <option>Todos</option>
            <option>Máquina</option>
            <option>Checklist</option>
            <option>Portfólio</option>
            <option>Manutenção</option>
          </select>

          <select
            className="flex-1 p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amiste-primary outline-none transition-all cursor-pointer"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option>Todos</option>
            <option>Criação</option>
            <option>Edição</option>
            <option>Exclusão</option>
          </select>

          <div className="ml-auto text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            {filteredLogs.length} Eventos
          </div>
        </div>

        {/* LISTA DE EVENTOS */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <Activity
              size={48}
              className="mx-auto mb-4 opacity-20 animate-pulse"
            />
            <p>Carregando histórico...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <HistoryIcon
              size={48}
              className="mx-auto text-gray-300 mb-2 opacity-50"
            />
            <p className="text-gray-500 font-medium">
              Nenhum registro encontrado.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const style = getActionStyle(log.action_type);
              const Icon = style.icon;

              const authorProfile = userMap[log.user_id];
              const authorName =
                authorProfile?.nickname ||
                authorProfile?.full_name?.split(" ")[0] ||
                "Desconhecido";
              const authorRole = authorProfile?.role || "Sistema";

              return (
                <div
                  key={log.id}
                  className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-amiste-primary/30 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center relative overflow-hidden"
                >
                  {/* Linha colorida lateral (opcional, estilo Jira) */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${style.bg.replace("bg-", "bg-").replace("50", "500")}`}
                  ></div>

                  {/* Ícone */}
                  <div
                    className={`p-3 rounded-xl ${style.bg} ${style.color} border ${style.border} shrink-0 ml-2`}
                  >
                    <Icon size={20} />
                  </div>

                  {/* Info Principal */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.bg} ${style.color} ${style.border}`}
                      >
                        {log.action_type}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
                        {getModuleLabel(log.module)}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto md:ml-2">
                        <Calendar size={12} />
                        {new Date(log.created_at).toLocaleDateString()}
                        <span className="text-gray-300">|</span>
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight">
                      {log.description}
                    </h3>
                  </div>

                  {/* Divisor Mobile */}
                  <div className="w-full h-px bg-gray-50 md:hidden"></div>

                  {/* Autor */}
                  <div className="flex items-center gap-3 md:pl-6 md:border-l border-gray-100 min-w-[140px]">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border ${authorProfile ? "bg-gray-50 border-gray-200 text-gray-500" : "bg-red-50 border-red-100 text-red-400"}`}
                    >
                      {authorProfile ? (
                        <User size={14} />
                      ) : (
                        <ShieldAlert size={14} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700">
                        {log.user_id === user?.id ? "Você" : authorName}
                      </span>
                      <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wide">
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
