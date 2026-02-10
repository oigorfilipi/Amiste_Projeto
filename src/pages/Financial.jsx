import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import toast from "react-hot-toast";
import {
  DollarSign,
  FileText,
  ClipboardList,
  TrendingUp,
  Filter,
  Clock,
  CheckCircle,
  Calendar,
  ChevronDown,
} from "lucide-react";

export function Financial() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Filtros
  const [timeRange, setTimeRange] = useState("month"); // 'today', 'month', 'total'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all', 'proposal', 'service'

  // Métricas
  const [metrics, setMetrics] = useState({
    realizedSales: 0,
    realizedServices: 0,
    totalRealized: 0,
    projected: 0,
    countRealized: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, timeRange, typeFilter]);

  async function fetchData() {
    try {
      // 1. Portfólios (Propostas)
      const { data: portfolios, error: portError } = await supabase
        .from("portfolios")
        .select(
          "id, customer_name, total_value, created_at, status, description",
        )
        .order("created_at", { ascending: false });

      if (portError) throw portError;

      // 2. Checklists (Serviços)
      const { data: checklists, error: checkError } = await supabase
        .from("checklists")
        .select(
          "id, client_name, event_name, financials, created_at, status, machine_name",
        )
        .order("created_at", { ascending: false });

      if (checkError) throw checkError;

      // 3. Normalizar
      const normPortfolios = (portfolios || []).map((p) => ({
        id: `p-${p.id}`,
        type: "proposal",
        client: p.customer_name,
        value: p.total_value || 0,
        date: new Date(p.created_at),
        status: p.status || "Aguardando",
        details: "Venda de Equipamento",
      }));

      const normChecklists = (checklists || []).map((c) => {
        const f = c.financials || {};
        const total =
          (f.machine || 0) +
          (f.supplies || 0) +
          (f.services || 0) +
          (f.extras || 0);
        return {
          id: `c-${c.id}`,
          type: "service",
          client: c.client_name || c.event_name,
          value: total,
          date: new Date(c.created_at),
          status: c.status || "Rascunho",
          details: `Serviço: ${c.machine_name || "N/A"}`,
        };
      });

      const all = [...normPortfolios, ...normChecklists].sort(
        (a, b) => b.date - a.date,
      );
      setTransactions(all);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados financeiros.");
      setLoading(false);
    }
  }

  function filterTransactions() {
    const now = new Date();
    let timeFiltered = transactions.filter((t) => {
      if (timeRange === "total") return true;
      const isSameDay =
        t.date.getDate() === now.getDate() &&
        t.date.getMonth() === now.getMonth() &&
        t.date.getFullYear() === now.getFullYear();
      const isSameMonth =
        t.date.getMonth() === now.getMonth() &&
        t.date.getFullYear() === now.getFullYear();
      return timeRange === "today" ? isSameDay : isSameMonth;
    });

    const newMetrics = {
      realizedSales: 0,
      realizedServices: 0,
      totalRealized: 0,
      projected: 0,
      countRealized: 0,
    };

    timeFiltered.forEach((t) => {
      const isReal = t.status === "Concluido" || t.status === "Finalizado";
      const isProjected = t.status === "Aguardando" || t.status === "Rascunho";

      if (isReal) {
        if (t.type === "proposal") newMetrics.realizedSales += t.value;
        else newMetrics.realizedServices += t.value;
        newMetrics.totalRealized += t.value;
        newMetrics.countRealized += 1;
      }

      if (isProjected) {
        newMetrics.projected += t.value;
      }
    });

    setMetrics(newMetrics);

    if (typeFilter === "realized") {
      timeFiltered = timeFiltered.filter(
        (t) => t.status === "Concluido" || t.status === "Finalizado",
      );
    } else if (typeFilter !== "all") {
      timeFiltered = timeFiltered.filter((t) => t.type === typeFilter);
    }

    setFilteredData(timeFiltered);
  }

  const formatMoney = (val) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* HEADER & FILTROS */}
        <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">
              Painel Financeiro
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Fluxo de caixa realizado e previsões.
            </p>
          </div>

          {/* Botões de Período (Scroll horizontal no mobile) */}
          <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm flex overflow-x-auto shrink-0 no-scrollbar">
            {[
              { id: "today", label: "Hoje" },
              { id: "month", label: "Este Mês" },
              { id: "total", label: "Acumulado" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
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
          <div className="text-center py-20 text-gray-400 flex flex-col items-center">
            <Clock size={48} className="mb-4 opacity-20 animate-spin" />
            Carregando dados financeiros...
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {/* --- KPI CARDS (Responsivo) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              {/* Card Receita Total (Destaque) */}
              <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <DollarSign size={120} />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Receita Confirmada
                  </p>
                  <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                    {formatMoney(metrics.totalRealized)}
                  </h3>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/5 flex-1 min-w-[120px]">
                    <p className="text-[10px] uppercase text-gray-300 font-bold">
                      Vendas
                    </p>
                    <p className="text-base md:text-lg font-bold text-blue-300">
                      {formatMoney(metrics.realizedSales)}
                    </p>
                  </div>
                  <div className="bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/5 flex-1 min-w-[120px]">
                    <p className="text-[10px] uppercase text-gray-300 font-bold">
                      Serviços
                    </p>
                    <p className="text-base md:text-lg font-bold text-green-300">
                      {formatMoney(metrics.realizedServices)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Previsão */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative group overflow-hidden">
                <div className="absolute -right-4 -top-4 bg-amber-50 rounded-full w-24 h-24 blur-xl group-hover:bg-amber-100 transition-colors"></div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <Clock size={20} />
                    </div>
                    <span className="text-xs font-bold text-amber-600 uppercase">
                      Em Negociação
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {formatMoney(metrics.projected)}
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Potencial em "Aguardando" e "Rascunho".
                </p>
              </div>

              {/* Card Eficiência */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <CheckCircle size={20} />
                    </div>
                    <span className="text-xs font-bold text-green-600 uppercase">
                      Conclusões
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {metrics.countRealized}
                  </h3>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Operações finalizadas no período.
                </p>
              </div>
            </div>

            {/* --- EXTRATO DE MOVIMENTAÇÕES --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 md:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                  <TrendingUp size={20} className="text-amiste-primary" />
                  Extrato
                </h3>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                  {["all", "proposal", "service"].map((ft) => (
                    <button
                      key={ft}
                      onClick={() => setTypeFilter(ft)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors whitespace-nowrap ${
                        typeFilter === ft
                          ? "bg-gray-800 text-white"
                          : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {ft === "all"
                        ? "Tudo"
                        : ft === "proposal"
                          ? "Vendas"
                          : "Serviços"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {filteredData.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Filter size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Nenhuma transação encontrada.</p>
                  </div>
                ) : (
                  <>
                    {/* --- VERSÃO MOBILE: LISTA DE CARDS --- */}
                    <div className="md:hidden divide-y divide-gray-50">
                      {filteredData.map((item) => {
                        const isReal =
                          item.status === "Concluido" ||
                          item.status === "Finalizado";
                        const isCancel = item.status === "Cancelado";
                        return (
                          <div
                            key={item.id}
                            className={`p-4 ${!isReal ? "bg-gray-50/50 opacity-80" : "bg-white"}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`p-2 rounded-lg ${item.type === "proposal" ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"}`}
                                >
                                  {item.type === "proposal" ? (
                                    <FileText size={16} />
                                  ) : (
                                    <ClipboardList size={16} />
                                  )}
                                </div>
                                <span className="text-xs font-bold text-gray-400">
                                  {item.date.toLocaleDateString()}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                  isReal
                                    ? "bg-green-50 text-green-700 border-green-100"
                                    : isCancel
                                      ? "bg-red-50 text-red-700 border-red-100"
                                      : "bg-amber-50 text-amber-700 border-amber-100"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>

                            <div className="mb-2">
                              <p className="font-bold text-gray-800 text-sm">
                                {item.client}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.details}
                              </p>
                            </div>

                            <div className="text-right">
                              <span
                                className={`font-bold text-lg ${isReal ? "text-gray-800" : "text-gray-400 line-through decoration-gray-300"}`}
                              >
                                {formatMoney(item.value)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* --- VERSÃO DESKTOP: TABELA --- */}
                    <table className="hidden md:table w-full text-left text-sm">
                      <thead className="bg-white sticky top-0 z-10 text-gray-400 font-bold uppercase text-[10px] tracking-wider shadow-sm">
                        <tr>
                          <th className="p-5 pl-8">Data</th>
                          <th className="p-5">Cliente / Origem</th>
                          <th className="p-5">Status</th>
                          <th className="p-5 text-right pr-8">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredData.map((item) => {
                          const isReal =
                            item.status === "Concluido" ||
                            item.status === "Finalizado";
                          const isCancel = item.status === "Cancelado";

                          return (
                            <tr
                              key={item.id}
                              className={`hover:bg-gray-50 transition-colors group ${!isReal ? "opacity-60 bg-gray-50/50" : ""}`}
                            >
                              <td className="p-5 pl-8 text-gray-500 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {item.type === "proposal" ? (
                                    <FileText
                                      size={16}
                                      className="text-blue-400"
                                    />
                                  ) : (
                                    <ClipboardList
                                      size={16}
                                      className="text-green-400"
                                    />
                                  )}
                                  <span className="font-medium text-gray-700">
                                    {item.date.toLocaleDateString()}
                                  </span>
                                </div>
                              </td>
                              <td className="p-5">
                                <p className="font-bold text-gray-800">
                                  {item.client}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {item.details}
                                </p>
                              </td>
                              <td className="p-5">
                                <span
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                    isReal
                                      ? "bg-green-50 text-green-700 border-green-100"
                                      : isCancel
                                        ? "bg-red-50 text-red-700 border-red-100"
                                        : "bg-amber-50 text-amber-700 border-amber-100"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="p-5 pr-8 text-right">
                                <span
                                  className={`font-bold text-base ${isReal ? "text-gray-800" : "text-gray-400 line-through decoration-gray-300"}`}
                                >
                                  {formatMoney(item.value)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
