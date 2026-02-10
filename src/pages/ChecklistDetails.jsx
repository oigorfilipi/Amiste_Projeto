import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Printer,
  Calendar,
  User,
  Coffee,
  Wrench,
  DollarSign,
  FileText,
  AlertCircle,
  Zap,
  Scale,
  Maximize,
  Droplet,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ChecklistPDF } from "../components/ChecklistPDF";

export function ChecklistDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChecklist() {
      try {
        const { data: checklist, error } = await supabase
          .from("checklists")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setData(checklist);
      } catch (error) {
        console.error("Erro:", error);
        toast.error("Erro ao carregar detalhes do checklist.");
      } finally {
        setLoading(false);
      }
    }
    fetchChecklist();
  }, [id]);

  const formatMoney = (val) => (val ? `R$ ${val.toFixed(2)}` : "R$ 0,00");
  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("pt-BR") : "-";

  // Helpers de Status
  const getStatusColor = (st) => {
    if (st === "Finalizado") return "bg-green-100 text-green-700";
    if (st === "Cancelado") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <Coffee size={48} className="mb-4 opacity-20 animate-bounce" />
        <p className="font-bold">Carregando detalhes...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-400 bg-gray-50">
        <AlertCircle size={48} className="mb-4 opacity-50" />
        <p className="font-bold">Checklist não encontrado.</p>
        <Link
          to="/checklists"
          className="mt-4 text-sm font-bold text-amiste-primary hover:underline"
        >
          Voltar para lista
        </Link>
      </div>
    );
  }

  // Atalho para dados da máquina (Snapshot salvo no checklist)
  const mData = data.machine_data || {};

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* Breadcrumb e Ações */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link
              to="/checklists"
              className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-500 transition-colors shrink-0"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                  Checklist #{data.id}
                </h1>
                <span
                  className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap ${getStatusColor(data.status)}`}
                >
                  {data.status}
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                <Calendar size={14} /> Criado em {formatDate(data.created_at)}
              </p>
            </div>
          </div>

          <PDFDownloadLink
            document={<ChecklistPDF data={data} />}
            fileName={`checklist_${data.id}_${data.client_name || "evento"}.pdf`}
            className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-1 active:scale-[0.98]"
          >
            {({ loading }) =>
              loading ? (
                "Gerando PDF..."
              ) : (
                <>
                  <Printer size={18} /> Baixar PDF
                </>
              )
            }
          </PDFDownloadLink>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* COLUNA PRINCIPAL */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* 1. CLIENTE */}
            <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                <User size={20} className="text-amiste-primary" /> Dados da
                Instalação
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                    Cliente / Evento
                  </label>
                  <p className="text-base md:text-lg font-bold text-gray-800 break-words">
                    {data.client_name || data.event_name}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded font-medium">
                    {data.install_type}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                    Data Instalação
                  </label>
                  <p className="text-base md:text-lg font-medium text-gray-700">
                    {formatDate(data.install_date)}
                  </p>
                </div>

                {data.install_type === "Evento" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                        Data Retirada
                      </label>
                      <p className="text-base md:text-lg font-medium text-gray-700">
                        {formatDate(data.pickup_date)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                        Duração
                      </label>
                      <p className="text-base md:text-lg font-medium text-gray-700">
                        {data.event_days} dias
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Validação Local */}
              <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Tomada
                  </span>
                  <span className="font-bold text-gray-700 text-sm">
                    {data.local_validation?.localSocket || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Água
                  </span>
                  <span className="font-bold text-gray-700 text-sm">
                    {data.local_validation?.localWater || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Esgoto
                  </span>
                  <span className="font-bold text-gray-700 text-sm">
                    {data.local_validation?.localSewage || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Treinamento
                  </span>
                  <span className="font-bold text-gray-700 text-sm">
                    {data.local_validation?.trainedPeople || "0"} pessoas
                  </span>
                </div>
              </div>
            </div>

            {/* 2. EQUIPAMENTO */}
            <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                <Coffee size={20} className="text-amiste-primary" /> Equipamento
              </h2>

              <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-gray-100 shrink-0 mx-auto sm:mx-0">
                  <img
                    src={mData.photo_url}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="text-center sm:text-left w-full">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
                    {data.machine_name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3 mt-1">
                    {mData.brand} | {mData.model}
                  </p>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold inline-block">
                    Total: {data.quantity} un
                  </span>
                </div>
              </div>

              {/* Specs Técnicas Resumidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 bg-blue-50/50 p-4 rounded-xl border border-blue-50">
                <div>
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-400 mb-1">
                    <Zap size={10} /> Voltagem
                  </span>
                  <span className="font-bold text-gray-700 text-sm">
                    {mData.voltage || "-"}
                  </span>
                </div>
                <div>
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-400 mb-1">
                    <Scale size={10} /> Peso
                  </span>
                  <span className="font-bold text-gray-700 text-sm">
                    {mData.weight || "-"}
                  </span>
                </div>
                <div>
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-400 mb-1">
                    <Maximize size={10} /> Dimensões
                  </span>
                  <span className="font-bold text-gray-700 text-sm">
                    {mData.dimensions || "-"}
                  </span>
                </div>
                <div>
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-400 mb-1">
                    <Droplet size={10} /> Água
                  </span>
                  <span className="font-bold text-gray-700 text-sm">
                    {mData.water_system || "-"}
                  </span>
                </div>
              </div>

              {/* Tabela de Unidades (Scroll Horizontal) */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm text-left min-w-[300px]">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                    <tr>
                      <th className="p-3 whitespace-nowrap">#</th>
                      <th className="p-3 whitespace-nowrap">Voltagem</th>
                      <th className="p-3 whitespace-nowrap">Série</th>
                      <th className="p-3 whitespace-nowrap">Patrimônio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.machine_units?.map((u, i) => (
                      <tr key={i}>
                        <td className="p-3 font-bold text-gray-400">{i + 1}</td>
                        <td className="p-3 font-medium">{u.voltage}</td>
                        <td className="p-3 text-gray-600">{u.serial || "-"}</td>
                        <td className="p-3 text-gray-600">
                          {u.patrimony || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. ITENS */}
            <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-base md:text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
                <Wrench size={20} className="text-amiste-primary" /> Itens e
                Insumos
              </h2>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">
                    Aparatos Selecionados
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.tools_list || {})
                      .filter(
                        ([, v]) =>
                          v === true || (typeof v === "string" && v !== ""),
                      )
                      .map(([k, v]) => (
                        <span
                          key={k}
                          className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100"
                        >
                          {k.replace(/([A-Z])/g, " $1")}{" "}
                          {typeof v === "string" ? `(${v})` : ""}
                        </span>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">
                    Bebidas Habilitadas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.drinks_list?.standard || {}).map(
                      ([k, v]) => (
                        <span
                          key={k}
                          className="px-3 py-1.5 bg-red-50 text-amiste-primary rounded-lg text-xs font-bold border border-red-100"
                        >
                          {k} {v ? `(${v}ml)` : ""}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA LATERAL (FINANCEIRO & CONTRATO) */}
          <div className="space-y-6">
            {/* Financeiro */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <DollarSign size={20} className="text-green-400" /> Resumo
                Financeiro
              </h2>
              <div className="space-y-3 mb-6 border-b border-gray-700/50 pb-6 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Máquina</span>{" "}
                  <span>{formatMoney(data.financials?.machine)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insumos</span>{" "}
                  <span>{formatMoney(data.financials?.supplies)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serviços</span>{" "}
                  <span>{formatMoney(data.financials?.services)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Extras</span>{" "}
                  <span>{formatMoney(data.financials?.extras)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Total Geral
                </span>
                <span className="text-2xl md:text-3xl font-bold text-green-400 tracking-tight">
                  {formatMoney(data.financials?.total)}
                </span>
              </div>
            </div>

            {/* Contrato e Obs */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-gray-400" /> Contrato
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Nº Contrato
                  </p>
                  <p className="font-bold text-gray-800 text-lg break-all">
                    {data.contract_num || "Não informado"}
                  </p>
                </div>

                {data.sales_obs && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-600 uppercase mb-1 flex items-center gap-1">
                      <AlertCircle size={10} /> Observações
                    </p>
                    <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                      {data.sales_obs}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
