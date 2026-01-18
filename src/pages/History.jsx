import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import {
  ClipboardList,
  FileText,
  Filter,
  Calendar,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

export function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos"); // Todos, Checklist, Portfolio

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setLoading(true);
    try {
      // 1. Buscar Checklists
      const { data: checklists } = await supabase
        .from("checklists")
        .select(
          "id, created_at, client_name, event_name, install_type, machine_name, status",
        )
        .order("created_at", { ascending: false });

      // 2. Buscar Portfólios
      const { data: portfolios } = await supabase
        .from("portfolios")
        .select(
          "id, created_at, customer_name, machine_data, total_value, status",
        )
        .order("created_at", { ascending: false });

      // 3. Unificar e Padronizar os dados
      const listChecklists = (checklists || []).map((i) => ({
        type: "Checklist",
        id: i.id,
        date: i.created_at,
        title: i.client_name || i.event_name,
        subtitle: `${i.install_type} - ${i.machine_name}`,
        status: i.status,
        value: null,
      }));

      const listPortfolios = (portfolios || []).map((i) => ({
        type: "Portfolio",
        id: i.id,
        date: i.created_at,
        title: i.customer_name,
        subtitle: `Proposta: ${i.machine_data?.name}`,
        status: i.status,
        value: i.total_value,
      }));

      // 4. Juntar e Ordenar por Data (Mais recente primeiro)
      const combined = [...listChecklists, ...listPortfolios].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );

      setItems(combined);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filtragem local
  const filteredItems =
    filter === "Todos" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="min-h-screen pb-20">
      {/* CABEÇALHO */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Histórico Global
        </h1>
        <p className="text-gray-500">
          Auditoria de todas as movimentações do sistema.
        </p>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Filter size={20} />
          <span className="font-bold text-sm uppercase">Filtrar por:</span>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {["Todos", "Checklist", "Portfolio"].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                filter === opt
                  ? "bg-amiste-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* TIMELINE / LISTA */}
      <div className="space-y-4 animate-fade-in">
        {loading ? (
          <p className="text-center text-gray-400 py-10">
            Carregando eventos...
          </p>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
            <Search size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Nenhum registro encontrado.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-amiste-primary transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Ícone e Infos Principais */}
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${item.type === "Checklist" ? "bg-red-50 text-amiste-primary" : "bg-green-50 text-green-600"}`}
                >
                  {item.type === "Checklist" ? (
                    <ClipboardList size={24} />
                  ) : (
                    <FileText size={24} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">{item.subtitle}</p>

                  {/* Data Mobile */}
                  <p className="text-xs text-gray-400 md:hidden mt-1 flex items-center gap-1">
                    <Calendar size={12} />{" "}
                    {new Date(item.date).toLocaleDateString()} às{" "}
                    {new Date(item.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Status e Valores */}
              <div className="flex flex-col items-end gap-1 min-w-[120px]">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    item.status === "Finalizado" || item.status === "Gerado"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status}
                </span>

                {item.value && (
                  <span className="font-bold text-gray-800">
                    R${" "}
                    {item.value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                )}
              </div>

              {/* Botão Ação */}
              <div className="hidden md:block text-right">
                <p className="text-xs text-gray-400 mb-2 flex items-center justify-end gap-1">
                  <Calendar size={12} />{" "}
                  {new Date(item.date).toLocaleDateString()}
                </p>
                {item.type === "Checklist" && (
                  <Link
                    to={`/checklists/${item.id}`}
                    className="text-xs font-bold text-amiste-primary hover:underline"
                  >
                    Ver Detalhes
                  </Link>
                )}
                {/* Para portfólio não temos tela de detalhes, só o PDF na lista, então deixamos sem link ou link pra lista */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
