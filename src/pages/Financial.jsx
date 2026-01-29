import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import {
  DollarSign,
  FileText,
  ClipboardList,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

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

      // 2. Somar Checklists
      const { data: checklists } = await supabase
        .from("checklists")
        .select("financials");
      const totalC =
        checklists?.reduce((acc, curr) => {
          const {
            machine = 0,
            supplies = 0,
            services = 0,
            extras = 0,
          } = curr.financials || {};
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

  // Cálculo para o gráfico (altura proporcional)
  const total =
    metrics.totalPortfolioValue + metrics.totalChecklistService || 1; // Evita divisão por 0
  const pHeight = Math.max((metrics.totalPortfolioValue / total) * 100, 5); // Mínimo 5% pra não sumir
  const cHeight = Math.max((metrics.totalChecklistService / total) * 100, 5);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Painel Financeiro
          </h1>
          <p className="text-gray-500 mt-1">
            Visão consolidada de receitas comerciais e técnicas.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Carregando indicadores...
          </div>
        ) : (
          <div className="space-y-8">
            {/* CARDS DE KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Vendas */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FileText size={100} className="text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Propostas
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 tracking-tight">
                    {formatMoney(metrics.totalPortfolioValue)}
                  </h3>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">
                    {metrics.countPortfolios} orçamentos gerados
                  </span>
                  <span className="text-green-500 font-bold bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                    <ArrowUpRight size={12} /> Ativo
                  </span>
                </div>
              </div>

              {/* Card Serviços */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ClipboardList size={100} className="text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <ClipboardList size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Serviços Técnicos
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 tracking-tight">
                    {formatMoney(metrics.totalChecklistService)}
                  </h3>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">
                    {metrics.countChecklists} ordens finalizadas
                  </span>
                  <span className="text-green-500 font-bold bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                    <ArrowUpRight size={12} /> Estável
                  </span>
                </div>
              </div>

              {/* Card Total */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/10 text-white rounded-lg backdrop-blur-sm">
                      <DollarSign size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Receita Total Estimada
                    </span>
                  </div>
                  <h3 className="text-4xl font-bold text-white tracking-tight mt-2">
                    {formatMoney(
                      metrics.totalPortfolioValue +
                        metrics.totalChecklistService,
                    )}
                  </h3>
                </div>
                <div className="mt-4 text-xs text-gray-400 font-medium">
                  Soma consolidada de todas as operações ativas.
                </div>
              </div>
            </div>

            {/* GRÁFICO VISUAL (CSS PURO) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-amiste-primary" />{" "}
                  Distribuição de Receita
                </h3>
              </div>

              <div className="flex items-end justify-center gap-16 h-64 border-b border-gray-100 pb-0 relative">
                {/* Linhas de Grade (Decorativo) */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="w-full h-px bg-gray-50"></div>
                  <div className="w-full h-px bg-gray-50"></div>
                  <div className="w-full h-px bg-gray-50"></div>
                  <div className="w-full h-px bg-gray-50"></div>
                </div>

                {/* Barra Vendas */}
                <div className="flex flex-col items-center gap-3 w-32 z-10 group">
                  <div className="text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 group-hover:translate-y-0 transform duration-300">
                    {formatMoney(metrics.totalPortfolioValue)}
                  </div>
                  <div
                    className="w-full bg-blue-500 rounded-t-xl transition-all duration-1000 ease-out hover:bg-blue-600 shadow-lg shadow-blue-200"
                    style={{ height: `${pHeight}%`, minHeight: "20px" }}
                  ></div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-2">
                    Comercial
                  </span>
                </div>

                {/* Barra Técnico */}
                <div className="flex flex-col items-center gap-3 w-32 z-10 group">
                  <div className="text-sm font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 group-hover:translate-y-0 transform duration-300">
                    {formatMoney(metrics.totalChecklistService)}
                  </div>
                  <div
                    className="w-full bg-green-500 rounded-t-xl transition-all duration-1000 ease-out hover:bg-green-600 shadow-lg shadow-green-200"
                    style={{ height: `${cHeight}%`, minHeight: "20px" }}
                  ></div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-2">
                    Técnico
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
