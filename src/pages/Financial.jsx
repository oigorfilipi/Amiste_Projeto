import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import {
  DollarSign,
  FileText,
  ClipboardList,
  TrendingUp,
  Calendar,
  Filter,
  ArrowRight,
  Search,
} from "lucide-react";

export function Financial() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]); // Todos os dados brutos
  const [filteredData, setFilteredData] = useState([]); // Dados exibidos na lista

  // Filtros
  const [timeRange, setTimeRange] = useState("month"); // 'today', 'month', 'total'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'proposal', 'service'

  // Métricas do período selecionado
  const [metrics, setMetrics] = useState({
    proposal: 0,
    service: 0,
    total: 0,
    countP: 0,
    countS: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Recalcula métricas e lista quando os filtros mudam
  useEffect(() => {
    filterTransactions();
  }, [transactions, timeRange, typeFilter]);

  async function fetchData() {
    try {
      // 1. Buscar Portfólios (Propostas)
      const { data: portfolios } = await supabase
        .from("portfolios")
        .select("id, customer_name, total_value, created_at, description")
        .order("created_at", { ascending: false });

      // 2. Buscar Checklists (Serviços)
      const { data: checklists } = await supabase
        .from("checklists")
        .select(
          "id, client_name, event_name, financials, created_at, service_type",
        )
        .order("created_at", { ascending: false });

      // 3. Normalizar dados em um único array de "Transações"
      const normalizedPortfolios = (portfolios || []).map((p) => ({
        id: `p-${p.id}`,
        originalId: p.id,
        type: "proposal",
        client: p.customer_name,
        value: p.total_value || 0,
        date: new Date(p.created_at),
        details: "Proposta Comercial",
      }));

      const normalizedChecklists = (checklists || []).map((c) => {
        const f = c.financials || {};
        const total =
          (f.machine || 0) +
          (f.supplies || 0) +
          (f.services || 0) +
          (f.extras || 0);
        return {
          id: `c-${c.id}`,
          originalId: c.id,
          type: "service",
          client: c.client_name || c.event_name,
          value: total,
          date: new Date(c.created_at),
          details: `Serviço Técnico`,
        };
      });

      const all = [...normalizedPortfolios, ...normalizedChecklists].sort(
        (a, b) => b.date - a.date,
      );
      setTransactions(all);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  function filterTransactions() {
    const now = new Date();

    // 1. Filtro de Tempo
    let timeFiltered = transactions.filter((t) => {
      if (timeRange === "total") return true;

      const isSameDay =
        t.date.getDate() === now.getDate() &&
        t.date.getMonth() === now.getMonth() &&
        t.date.getFullYear() === now.getFullYear();

      const isSameMonth =
        t.date.getMonth() === now.getMonth() &&
        t.date.getFullYear() === now.getFullYear();

      if (timeRange === "today") return isSameDay;
      if (timeRange === "month") return isSameMonth;
      return true;
    });

    // 2. Calcular Métricas baseadas no Tempo (antes de filtrar por tipo na lista)
    const newMetrics = timeFiltered.reduce(
      (acc, curr) => {
        if (curr.type === "proposal") {
          acc.proposal += curr.value;
          acc.countP += 1;
        } else {
          acc.service += curr.value;
          acc.countS += 1;
        }
        acc.total += curr.value;
        return acc;
      },
      { proposal: 0, service: 0, total: 0, countP: 0, countS: 0 },
    );

    setMetrics(newMetrics);

    // 3. Filtro de Tipo (Para a lista abaixo)
    if (typeFilter !== "all") {
      timeFiltered = timeFiltered.filter((t) => t.type === typeFilter);
    }

    setFilteredData(timeFiltered);
  }

  const formatMoney = (val) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Cores dinâmicas para os cards selecionados
  const getCardStyle = (type) => {
    const base = "cursor-pointer transition-all duration-300 transform border";
    if (typeFilter === type) {
      return `${base} ring-2 ring-offset-2 scale-[1.02] shadow-lg`;
    }
    return `${base} hover:shadow-md hover:-translate-y-1 opacity-80 hover:opacity-100`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* HEADER & CONTROLES DE TEMPO */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-800">
              Painel Financeiro
            </h1>
            <p className="text-gray-500 mt-1">
              Gestão de receitas e fluxo de caixa.
            </p>
          </div>

          {/* Abas de Tempo (Estilo iOS Segmented Control) */}
          <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm flex">
            {[
              { id: "today", label: "Hoje" },
              { id: "month", label: "Este Mês" },
              { id: "total", label: "Total Geral" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  timeRange === tab.id
                    ? "bg-gray-900 text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Carregando dados...
          </div>
        ) : (
          <div className="space-y-8">
            {/* --- CARDS DE KPI (Clicáveis para filtrar) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Vendas (Azul) */}
              <div
                onClick={() =>
                  setTypeFilter(typeFilter === "proposal" ? "all" : "proposal")
                }
                className={`bg-white p-6 rounded-2xl border-gray-100 ${getCardStyle("proposal")} ${typeFilter === "proposal" ? "ring-blue-500 border-blue-500" : ""}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <FileText size={24} />
                  </div>
                  {typeFilter === "proposal" && (
                    <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      FILTRADO
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Propostas
                </p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {formatMoney(metrics.proposal)}
                </h3>
                <p className="text-xs text-blue-500 mt-2 font-medium bg-blue-50 inline-block px-2 py-1 rounded">
                  {metrics.countP} registros{" "}
                  {timeRange === "today" ? "hoje" : ""}
                </p>
              </div>

              {/* Card Serviços (Verde) */}
              <div
                onClick={() =>
                  setTypeFilter(typeFilter === "service" ? "all" : "service")
                }
                className={`bg-white p-6 rounded-2xl border-gray-100 ${getCardStyle("service")} ${typeFilter === "service" ? "ring-green-500 border-green-500" : ""}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <ClipboardList size={24} />
                  </div>
                  {typeFilter === "service" && (
                    <div className="bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      FILTRADO
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Serviços Técnicos
                </p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {formatMoney(metrics.service)}
                </h3>
                <p className="text-xs text-green-600 mt-2 font-medium bg-green-50 inline-block px-2 py-1 rounded">
                  {metrics.countS} registros{" "}
                  {timeRange === "today" ? "hoje" : ""}
                </p>
              </div>

              {/* Card Total (Amiste) - Não filtra, apenas mostra soma */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/10 text-white rounded-lg backdrop-blur-sm">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Receita Total (
                    {timeRange === "today"
                      ? "Hoje"
                      : timeRange === "month"
                        ? "Mês"
                        : "Geral"}
                    )
                  </p>
                  <h3 className="text-4xl font-bold text-white tracking-tight mt-2">
                    {formatMoney(metrics.total)}
                  </h3>
                </div>
              </div>
            </div>

            {/* --- TABELA DE DETALHES (Extrato) --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <DollarSign size={20} className="text-amiste-primary" />
                  Extrato Detalhado
                  {typeFilter !== "all" && (
                    <span className="text-xs font-normal text-gray-400">
                      (Filtrado)
                    </span>
                  )}
                </h3>
                <div className="text-xs text-gray-400 font-medium">
                  {filteredData.length} transações encontradas
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {filteredData.length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    <Filter size={40} className="mx-auto mb-3 opacity-20" />
                    <p>Nenhuma movimentação neste período.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white sticky top-0 z-10 shadow-sm text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-5 pl-8">Data</th>
                        <th className="p-5">Cliente / Origem</th>
                        <th className="p-5">Tipo</th>
                        <th className="p-5 text-right pr-8">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredData.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="p-5 pl-8 text-gray-500 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-300" />
                              {item.date.toLocaleDateString()}
                              <span className="text-xs text-gray-300 px-1">
                                |
                              </span>
                              {item.date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="p-5">
                            <p className="font-bold text-gray-700">
                              {item.client}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.details}
                            </p>
                          </td>
                          <td className="p-5">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                item.type === "proposal"
                                  ? "bg-blue-50 text-blue-600 border-blue-100"
                                  : "bg-green-50 text-green-600 border-green-100"
                              }`}
                            >
                              {item.type === "proposal" ? "Venda" : "Serviço"}
                            </span>
                          </td>
                          <td className="p-5 pr-8 text-right">
                            <span
                              className={`font-bold text-base ${item.type === "proposal" ? "text-blue-600" : "text-green-600"}`}
                            >
                              + {formatMoney(item.value)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
