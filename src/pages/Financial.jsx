import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { DollarSign, FileText, ClipboardList, TrendingUp } from "lucide-react";

export function Financial() {
  const [metrics, setMetrics] = useState({
    totalPortfolioValue: 0,
    totalChecklistService: 0,
    countPortfolios: 0,
    countChecklists: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Somar Portfólios
      const { data: portfolios } = await supabase
        .from("portfolios")
        .select("total_value");
      const totalP =
        portfolios?.reduce((acc, curr) => acc + (curr.total_value || 0), 0) ||
        0;

      // 2. Somar Checklists (Serviços + Extras)
      // O Supabase retorna JSON, então a soma precisa ser feita no JS se não tivermos uma função SQL
      const { data: checklists } = await supabase
        .from("checklists")
        .select("financials");
      const totalC =
        checklists?.reduce((acc, curr) => {
          const machine = curr.financials?.machine || 0;
          const supplies = curr.financials?.supplies || 0;
          const services = curr.financials?.services || 0;
          const extras = curr.financials?.extras || 0;
          return acc + machine + supplies + services + extras;
        }, 0) || 0;

      setMetrics({
        totalPortfolioValue: totalP,
        totalChecklistService: totalC,
        countPortfolios: portfolios?.length || 0,
        countChecklists: checklists?.length || 0,
      });
      setLoading(false);
    }
    fetchData();
  }, []);

  const formatMoney = (val) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading)
    return (
      <div className="p-8 text-gray-500">Carregando dados financeiros...</div>
    );

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-display font-bold text-gray-800 mb-2">
        Painel Financeiro
      </h1>
      <p className="text-gray-500 mb-8">
        Visão geral de valores de propostas e serviços técnicos.
      </p>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase">
                Total em Propostas
              </p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {formatMoney(metrics.totalPortfolioValue)}
              </h3>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <FileText size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {metrics.countPortfolios} propostas geradas
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase">
                Total Serviços (Checklist)
              </p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {formatMoney(metrics.totalChecklistService)}
              </h3>
            </div>
            <div className="bg-green-50 p-2 rounded-lg text-green-600">
              <ClipboardList size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {metrics.countChecklists} serviços finalizados
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase">
                Receita Estimada
              </p>
              <h3 className="text-2xl font-bold text-amiste-primary mt-1">
                {formatMoney(
                  metrics.totalPortfolioValue + metrics.totalChecklistService,
                )}
              </h3>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-amiste-primary">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-400">Soma de Propostas + Serviços</p>
        </div>
      </div>

      {/* GRÁFICO VISUAL (Simulado com CSS puro para não instalar lib agora) */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp size={20} /> Comparativo de Receita
        </h3>

        <div className="flex items-end gap-12 h-64 border-b border-gray-200 pb-4">
          {/* Barra 1 */}
          <div className="flex flex-col items-center gap-2 w-24">
            <div className="text-xs font-bold text-blue-600">
              {formatMoney(metrics.totalPortfolioValue)}
            </div>
            <div
              className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
              style={{ height: "80%" }} // Valor ilustrativo, idealmente calcular %
            ></div>
            <span className="text-xs font-bold text-gray-500 uppercase">
              Vendas
            </span>
          </div>

          {/* Barra 2 */}
          <div className="flex flex-col items-center gap-2 w-24">
            <div className="text-xs font-bold text-green-600">
              {formatMoney(metrics.totalChecklistService)}
            </div>
            <div
              className="w-full bg-green-500 rounded-t-lg transition-all hover:bg-green-600"
              style={{ height: "40%" }} // Valor ilustrativo
            ></div>
            <span className="text-xs font-bold text-gray-500 uppercase">
              Técnico
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
