import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import {
  Filter,
  History as HistoryIcon,
  User,
  Calendar,
  Trash2,
  Edit,
  PlusCircle,
  Clock,
  ShieldAlert,
} from "lucide-react";

export function History() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [userMap, setUserMap] = useState({}); // <--- NOVO: Mapa de Usuários
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterModule, setFilterModule] = useState("Todos");
  const [filterAction, setFilterAction] = useState("Todos");

  useEffect(() => {
    fetchData();

    // Atualizar em tempo real (Histórico)
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
      // 1. Buscar Histórico
      const { data: historyData, error: historyError } = await supabase
        .from("app_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (historyError) throw historyError;

      // 2. Buscar Perfis (Para saber os nomes)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, nickname, full_name, role");

      if (profilesError) throw profilesError;

      // 3. Criar um "Dicionário" de usuários para acesso rápido
      // Ex: { "id-123": { name: "Carlos", role: "Vendedor" } }
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

  // Helpers de Tradução Visual
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
        return { color: "text-green-600", bg: "bg-green-50", icon: PlusCircle };
      case "Edição":
        return { color: "text-blue-600", bg: "bg-blue-50", icon: Edit };
      case "Exclusão":
        return { color: "text-red-600", bg: "bg-red-50", icon: Trash2 };
      default:
        return { color: "text-gray-600", bg: "bg-gray-50", icon: Clock };
    }
  };

  // Filtragem local
  const filteredLogs = logs.filter((log) => {
    const matchModule =
      filterModule === "Todos" || getModuleLabel(log.module) === filterModule;
    const matchAction =
      filterAction === "Todos" || log.action_type === filterAction;
    return matchModule && matchAction;
  });

  return (
    <div className="min-h-screen pb-20 bg-gray-50 animate-fade-in">
      {/* CABEÇALHO */}
      <div className="p-8 pb-4">
        <h1 className="text-3xl font-display font-bold text-gray-800 mb-2">
          Histórico Global
        </h1>
        <p className="text-gray-500">
          Linha do tempo de todas as atividades do sistema.
        </p>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="px-8 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase">
            <Filter size={18} /> Filtros:
          </div>

          {/* Filtro Módulo */}
          <select
            className="p-2 border rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-amiste-primary"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            <option>Todos</option>
            <option>Máquina</option>
            <option>Checklist</option>
            <option>Portfólio</option>
            <option>Manutenção</option>
          </select>

          {/* Filtro Ação */}
          <select
            className="p-2 border rounded-lg bg-gray-50 text-sm focus:outline-none focus:border-amiste-primary"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option>Todos</option>
            <option>Criação</option>
            <option>Edição</option>
            <option>Exclusão</option>
          </select>

          <div className="ml-auto text-xs text-gray-400">
            Mostrando {filteredLogs.length} eventos
          </div>
        </div>
      </div>

      {/* LISTA DE EVENTOS (TIMELINE) */}
      <div className="px-8 max-w-5xl">
        {loading ? (
          <p className="text-center text-gray-400 py-10">
            Carregando auditoria...
          </p>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <HistoryIcon size={48} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">
              Nenhum registro encontrado para os filtros.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const style = getActionStyle(log.action_type);
              const Icon = style.icon;

              // Recupera os dados do autor baseado no ID
              const authorProfile = userMap[log.user_id];
              const authorName =
                authorProfile?.nickname ||
                authorProfile?.full_name?.split(" ")[0] ||
                "Desconhecido";
              const authorRole = authorProfile?.role || "Sistema";

              return (
                <div
                  key={log.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4 hover:border-amiste-primary/30 transition-all animate-fade-in group"
                >
                  {/* Ícone da Ação */}
                  <div
                    className={`p-3 rounded-full ${style.bg} ${style.color}`}
                  >
                    <Icon size={20} />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-800 text-base">
                        {log.description}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(log.created_at).toLocaleDateString()} às{" "}
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border ${style.bg} ${style.color} border-current opacity-70`}
                      >
                        {log.action_type}
                      </span>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wide">
                        {getModuleLabel(log.module)}
                      </span>
                    </div>
                  </div>

                  {/* USUÁRIO QUE FEZ A AÇÃO (ATUALIZADO) */}
                  <div className="border-l pl-4 ml-2 flex flex-col items-center justify-center min-w-[100px] text-center">
                    <div
                      className={`p-1.5 rounded-full mb-1 ${authorProfile ? "bg-gray-100" : "bg-red-50"}`}
                    >
                      {authorProfile ? (
                        <User size={16} className="text-gray-500" />
                      ) : (
                        <ShieldAlert size={16} className="text-red-400" />
                      )}
                    </div>

                    <span
                      className="text-xs font-bold text-gray-700 truncate max-w-[100px]"
                      title={authorProfile?.full_name}
                    >
                      {log.user_id === user?.id ? "Você" : authorName}
                    </span>

                    <span className="text-[9px] text-gray-400 uppercase tracking-wide">
                      {authorRole}
                    </span>
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
