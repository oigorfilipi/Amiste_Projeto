import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import {
  ArrowLeft,
  Printer,
  Calendar,
  User,
  MapPin,
  Coffee,
  Wrench,
  DollarSign,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ChecklistPDF } from "../components/ChecklistPDF";

export function ChecklistDetails() {
  const { id } = useParams(); // Pega o ID da URL
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChecklist() {
      const { data: checklist, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro:", error);
      } else {
        setData(checklist);
      }
      setLoading(false);
    }
    fetchChecklist();
  }, [id]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Carregando detalhes...
      </div>
    );
  if (!data)
    return (
      <div className="p-8 text-center text-red-500">
        Checklist não encontrado.
      </div>
    );

  // Funções auxiliares para formatar dinheiro e data
  const formatMoney = (val) => (val ? `R$ ${val.toFixed(2)}` : "R$ 0,00");
  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("pt-BR") : "-";

  return (
    <div className="min-h-screen pb-20">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/home"
            className="text-gray-500 hover:text-amiste-primary flex items-center gap-2 mb-2 text-sm"
          >
            <ArrowLeft size={16} /> Voltar para o Painel
          </Link>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Checklist #{data.id}
          </h1>
          <p className="text-gray-500">
            Status:{" "}
            <span className="font-bold text-green-600">{data.status}</span> •
            Criado em {formatDate(data.created_at)}
          </p>
        </div>

        <PDFDownloadLink
          document={<ChecklistPDF data={data} />}
          fileName={`checklist_${data.id}_${data.client_name || "evento"}.pdf`}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-3 rounded-lg font-bold shadow-lg transition-all decoration-0"
        >
          {({ loading }) =>
            loading ? (
              "Gerando PDF..."
            ) : (
              <>
                <Printer size={20} /> Baixar PDF
              </>
            )
          }
        </PDFDownloadLink>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA ESQUERDA: Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. DADOS DO CLIENTE/EVENTO */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-amiste-primary" /> Cliente e
              Instalação
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">
                  Tipo
                </p>
                <p className="font-medium">{data.install_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">
                  Nome
                </p>
                <p className="font-bold text-lg">
                  {data.client_name || data.event_name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">
                  Data Instalação
                </p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar size={14} /> {formatDate(data.install_date)}
                </p>
              </div>
              {data.install_type === "Evento" && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    Retirada ({data.event_days} dias)
                  </p>
                  <p className="font-medium">{formatDate(data.pickup_date)}</p>
                </div>
              )}
            </div>
            {/* Validação Local (Passo 8) */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Tomada Local</p>
                <p className="font-bold">
                  {data.local_validation?.localSocket || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ponto de Água</p>
                <p className="font-bold">
                  {data.local_validation?.localWater || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. DADOS DA MÁQUINA */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Coffee size={20} className="text-amiste-primary" /> Máquina e
              Unidades
            </h2>

            <div className="flex items-start gap-4 mb-6">
              <img
                src={data.machine_data?.photo_url}
                alt="Foto"
                className="w-24 h-24 object-contain bg-gray-50 rounded-lg border border-gray-200"
              />
              <div>
                <h3 className="text-xl font-bold">{data.machine_name}</h3>
                <p className="text-gray-500 text-sm">
                  {data.machine_data?.brand} / {data.machine_data?.model}
                </p>
                <span className="inline-block mt-2 bg-amiste-primary text-white text-xs px-2 py-1 rounded font-bold">
                  Total: {data.quantity} un
                </span>
              </div>
            </div>

            {/* Configurações Técnicas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                Hídrica: <b>{data.tech_water}</b>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                Esgoto: <b>{data.tech_sewage}</b>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                Vapor: <b>{data.tech_steam}</b>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                Pgto: <b>{data.tech_payment}</b>
              </div>
            </div>

            {/* Tabela de Unidades */}
            <table className="w-full text-sm text-left border rounded overflow-hidden">
              <thead className="bg-gray-100 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Voltagem</th>
                  <th className="p-2">Série</th>
                  <th className="p-2">Patrimônio</th>
                </tr>
              </thead>
              <tbody>
                {data.machine_units?.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2 font-bold">{idx + 1}</td>
                    <td className="p-2">{item.voltage}</td>
                    <td className="p-2 text-gray-600">{item.serial || "-"}</td>
                    <td className="p-2 text-gray-600">
                      {item.patrimony || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. LISTAS (Aparatos, Bebidas, etc) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Wrench size={20} className="text-amiste-primary" /> Itens
              Selecionados
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-1">
                  Aparatos
                </p>
                <p className="text-sm">
                  {Object.entries(data.tools_list || {})
                    .filter(
                      ([key, val]) =>
                        val === true || (typeof val === "string" && val !== ""),
                    )
                    .map(([key]) => key.replace(/([A-Z])/g, " $1"))
                    .join(", ")}
                </p>
              </div>
              <div className="border-t pt-2">
                <p className="text-xs font-bold uppercase text-gray-400 mb-1">
                  Bebidas Configuradas
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Lista padrão */}
                  {Object.entries(data.drinks_list?.standard || {}).map(
                    ([name, ml]) => (
                      <span
                        key={name}
                        className="bg-red-50 text-amiste-primary text-xs px-2 py-1 rounded border border-red-100"
                      >
                        {name} ({ml})
                      </span>
                    ),
                  )}
                  {/* Customizadas */}
                  {data.drinks_list?.custom?.map((d, i) => (
                    <span
                      key={i}
                      className="bg-red-50 text-amiste-primary text-xs px-2 py-1 rounded border border-red-100"
                    >
                      {d.name} ({d.ml})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Financeiro e Docs */}
        <div className="space-y-6">
          <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-green-400" /> Financeiro
            </h2>
            <div className="space-y-3 mb-6 border-b border-gray-700 pb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Máquina</span>
                <span>{formatMoney(data.financials?.machine)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Insumos</span>
                <span>{formatMoney(data.financials?.supplies)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Serviços</span>
                <span>{formatMoney(data.financials?.services)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Extras</span>
                <span>{formatMoney(data.financials?.extras)}</span>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-gray-400 text-sm">Valor Total</span>
              <span className="text-2xl font-bold text-green-400">
                {formatMoney(data.financials?.total)}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">Contrato</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Nº Contrato</p>
                <p className="font-medium">{data.contract_num}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Ficha Instalação</p>
                <p className="font-medium">{data.install_file_num || "-"}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
                <p className="text-xs text-yellow-700 font-bold mb-1">
                  Observações:
                </p>
                <p className="text-xs text-gray-600 italic">
                  {data.sales_obs || "Nenhuma observação."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
