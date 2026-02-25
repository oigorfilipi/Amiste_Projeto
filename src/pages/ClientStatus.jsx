import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  User,
  Coffee,
  Calendar,
  DollarSign,
  ShieldAlert,
  Clock,
  Filter,
} from "lucide-react";

export function ClientStatus() {
  const { permissions } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");

  // VERIFICAÇÃO DE ACESSO
  const hasAccess =
    permissions?.StatusClientes !== "Nothing" &&
    permissions?.StatusClientes !== "Ghost" &&
    permissions?.StatusClientes !== undefined;

  useEffect(() => {
    if (hasAccess) {
      fetchClients();
    } else {
      setLoading(false);
    }
  }, [hasAccess]);

  async function fetchClients() {
    try {
      // Busca todas as propostas (portfólios) para extrair o status dos clientes
      const { data, error } = await supabase
        .from("portfolios")
        .select(
          "id, customer_name, total_value, created_at, status, machine_data, negotiation_type",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar o status dos clientes.");
    } finally {
      setLoading(false);
    }
  }

  // Se o usuário não tiver acesso, renderiza o fallback de bloqueio
  if (!hasAccess && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-500 mb-6">
            Você não tem permissão para visualizar o status dos clientes.
          </p>
          <Link
            to="/"
            className="block w-full bg-gray-900 hover:bg-gray-800 transition-colors text-white py-3 rounded-xl font-bold"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const filteredClients = clients.filter((client) => {
    const matchSearch = client.customer_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "Todos" || client.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formatMoney = (val) =>
    val
      ? val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 0,00";

  const getStatusConfig = (st) => {
    switch (st) {
      case "Concluido":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          icon: CheckCircle,
        };
      case "Cancelado":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: XCircle,
        };
      default:
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: Clock,
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
              <CheckCircle className="text-green-600" /> Status de Clientes
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Acompanhamento de propostas e fechamentos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all text-sm"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative w-full sm:w-48">
              <Filter
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <select
                className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-amiste-primary outline-none transition-all text-sm appearance-none cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="Todos">Todos os Status</option>
                <option value="Concluido">Concluídos</option>
                <option value="Aguardando">Aguardando</option>
                <option value="Cancelado">Cancelados</option>
              </select>
            </div>
          </div>
        </div>

        {/* CONTEÚDO */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 flex flex-col items-center">
            <Clock size={48} className="mb-4 opacity-20 animate-spin" />
            Carregando base de clientes...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center mx-auto mt-4">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <User size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              Nenhum cliente encontrado
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm px-4">
              Não há registros que correspondam a esta busca ou filtro.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredClients.map((client) => {
              const statusConf = getStatusConfig(client.status || "Aguardando");
              const StatusIcon = statusConf.icon;

              return (
                <div
                  key={client.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-amiste-primary group-hover:text-white transition-colors">
                      <User size={24} />
                    </div>
                    <span
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                    >
                      <StatusIcon size={12} /> {client.status || "Aguardando"}
                    </span>
                  </div>

                  <h3
                    className="font-bold text-gray-800 text-lg leading-tight mb-1 truncate"
                    title={client.customer_name}
                  >
                    {client.customer_name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-medium uppercase tracking-wide">
                    <Coffee size={14} className="text-amiste-primary" />
                    <span className="truncate">
                      {client.machine_data?.name || "Máquina não informada"}
                    </span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-50 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar size={14} /> Criado em:
                      </span>
                      <span className="font-bold text-gray-700">
                        {new Date(client.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <DollarSign size={14} /> Valor:
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatMoney(client.total_value)}
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
