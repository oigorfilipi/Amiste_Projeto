import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PortfolioPDF } from "../components/PortfolioPDF";
import {
  FileText,
  Save,
  Search,
  Plus,
  ArrowRight,
  DollarSign,
  Calendar,
  ChevronLeft,
  Printer,
  Trash2,
} from "lucide-react";

export function Portfolio() {
  const [view, setView] = useState("list");
  const [machines, setMachines] = useState([]);
  const [savedPortfolios, setSavedPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DO EDITOR ---
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [negotiationType, setNegotiationType] = useState("Venda");
  const [totalValue, setTotalValue] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [description, setDescription] = useState("");
  const [installmentValue, setInstallmentValue] = useState(0);

  // Inicialização
  useEffect(() => {
    fetchMachines();
    fetchPortfolios();
  }, []);

  // Recalculo automático de parcela
  useEffect(() => {
    if (totalValue > 0 && installments > 0) {
      setInstallmentValue(totalValue / installments);
    } else {
      setInstallmentValue(0);
    }
  }, [totalValue, installments]);

  async function fetchMachines() {
    const { data } = await supabase.from("machines").select("*").order("name");
    if (data) setMachines(data);
  }

  async function fetchPortfolios() {
    const { data } = await supabase
      .from("portfolios")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setSavedPortfolios(data);
    setLoading(false);
  }

  // --- AÇÕES ---
  function handleNewPortfolio() {
    setSelectedMachine(null);
    setCustomerName("");
    setNegotiationType("Venda");
    setTotalValue(0);
    setInstallments(1);
    setDescription(
      "Equipamento de alta performance, ideal para seu estabelecimento. Design moderno e extração perfeita.",
    );
    setView("editor");
  }

  function handleSelectMachine(e) {
    const id = e.target.value;
    const m = machines.find((x) => x.id.toString() === id);
    setSelectedMachine(m || null);
  }

  async function handleSave() {
    if (!selectedMachine || !customerName)
      return alert("Selecione a máquina e informe o cliente.");

    const payload = {
      machine_id: selectedMachine.id,
      machine_data: selectedMachine,
      customer_name: customerName,
      negotiation_type: negotiationType,
      total_value: totalValue,
      installments: installments,
      installment_value: installmentValue,
      description: description,
      status: "Gerado",
    };

    const { error } = await supabase.from("portfolios").insert(payload);

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      alert("Proposta salva no histórico!");
      fetchPortfolios();
      setView("list");
    }
  }

  // Objeto de dados para o Preview e PDF
  const currentData = {
    machine_data: selectedMachine,
    customer_name: customerName,
    negotiation_type: negotiationType,
    total_value: parseFloat(totalValue),
    installments: parseInt(installments),
    installment_value: parseFloat(installmentValue),
    description: description,
  };

  const formatMoney = (val) =>
    val
      ? `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      : "R$ 0,00";

  return (
    <div className="min-h-screen pb-20 bg-gray-100">
      {/* --- MODO LISTA (HISTÓRICO) --- */}
      {view === "list" && (
        <div className="p-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-800">
                Portfólio & Propostas
              </h1>
              <p className="text-gray-500">Gerador de orçamentos comerciais.</p>
            </div>
            <button
              onClick={handleNewPortfolio}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-1"
            >
              <Plus size={20} /> Nova Proposta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {savedPortfolios.length === 0 && !loading && (
              <div className="col-span-full text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">
                <FileText size={48} className="mx-auto mb-2 opacity-20" />
                <p>Nenhuma proposta criada ainda.</p>
              </div>
            )}

            {savedPortfolios.map((p) => (
              <div
                key={p.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-amiste-primary transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                    <FileText size={24} />
                  </div>
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                    {formatMoney(p.total_value)}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg truncate">
                  {p.customer_name}
                </h3>
                <p className="text-sm text-gray-500 mb-1">
                  {p.machine_data?.name}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  {new Date(p.created_at).toLocaleDateString()}
                </p>

                <PDFDownloadLink
                  document={<PortfolioPDF data={p} />}
                  fileName={`proposta_${p.customer_name}.pdf`}
                  className="flex items-center justify-center gap-2 w-full py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-amiste-primary hover:text-white hover:border-amiste-primary transition-colors"
                >
                  <ArrowRight size={16} /> Baixar PDF
                </PDFDownloadLink>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODO EDITOR (VISUAL IGUAL AO QUE VOCÊ MANDOU) --- */}
      {view === "editor" && (
        <div className="flex flex-col h-screen overflow-hidden">
          {/* Header Editor */}
          <div className="bg-gray-900 text-white p-4 shadow-md z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView("list")}
                className="p-2 hover:bg-gray-700 rounded-full transition"
              >
                <ChevronLeft size={24} />
              </button>
              <div>
                <h1 className="text-lg font-bold">Editor de Proposta</h1>
                <p className="text-xs text-gray-400">
                  {selectedMachine
                    ? selectedMachine.name
                    : "Selecione uma máquina"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold shadow-lg transition"
              >
                <Save size={18} /> Salvar
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* SIDEBAR DE CONTROLE */}
            <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto flex flex-col gap-6 shadow-xl z-10">
              <h3 className="font-bold text-gray-800 text-lg border-b pb-2">
                Configuração
              </h3>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">
                  Máquina
                </label>
                <select
                  className="w-full p-3 border rounded-lg bg-gray-50"
                  onChange={handleSelectMachine}
                >
                  <option value="">Selecione...</option>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">
                  Cliente
                </label>
                <input
                  className="w-full p-3 border rounded-lg bg-gray-50"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nome do Cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">
                  Modalidade
                </label>
                <select
                  className="w-full p-3 border rounded-lg bg-gray-50"
                  value={negotiationType}
                  onChange={(e) => setNegotiationType(e.target.value)}
                >
                  <option>Venda</option>
                  <option>Aluguel</option>
                  <option>Comodato</option>
                  <option>Evento</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">
                  Valor Total (R$)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full p-3 pl-10 border rounded-lg bg-gray-50 font-bold"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                  />
                  <DollarSign
                    size={18}
                    className="absolute left-3 top-3.5 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">
                  Parcelas
                </label>
                <select
                  className="w-full p-3 border rounded-lg bg-gray-50"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 10, 12, 18, 24].map((n) => (
                    <option key={n} value={n}>
                      {n}x
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">
                  Descrição
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg bg-gray-50 text-sm"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="mt-auto bg-gray-900 text-white p-4 rounded-lg">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                  Parcela Mensal:
                </p>
                <p className="text-xl font-bold text-green-400">
                  {formatMoney(installmentValue)}
                </p>
              </div>
            </div>

            {/* PREVIEW DA FOLHA (Direita) */}
            <div className="flex-1 bg-gray-200 overflow-y-auto p-8 flex justify-center items-start">
              <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl flex flex-col relative overflow-hidden">
                {/* Header Folha */}
                <div className="border-b-2 border-amiste-primary pb-4 m-8 mb-4">
                  <h1 className="text-4xl font-extrabold text-gray-900 uppercase tracking-tight">
                    AMISTE CAFÉ
                  </h1>
                  <p className="text-amiste-primary font-bold tracking-[0.2em] text-xs uppercase">
                    Proposta Comercial
                  </p>
                </div>

                {selectedMachine ? (
                  <div className="flex flex-col flex-1 px-8 pb-32">
                    {/* Hero */}
                    <div className="flex gap-8 mb-8 h-64">
                      <div className="w-1/2 bg-gray-50 rounded-lg flex items-center justify-center p-4">
                        <img
                          src={selectedMachine.photo_url}
                          className="max-h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="w-1/2 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-1 leading-tight">
                          {selectedMachine.name}
                        </h2>
                        <p className="text-gray-500 uppercase tracking-wide text-sm mb-4 font-bold">
                          {selectedMachine.brand} | {selectedMachine.model}
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed text-justify">
                          {description}
                        </p>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="mt-4">
                      <h3 className="text-amiste-primary font-bold uppercase text-sm mb-3 border-l-4 border-amiste-primary pl-2">
                        Especificações Técnicas
                      </h3>
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 grid grid-cols-2 gap-y-2 text-sm text-gray-700">
                        <p>
                          <b>Tipo:</b> {selectedMachine.type}
                        </p>
                        <p>
                          <b>Voltagem:</b> {selectedMachine.voltage}
                        </p>
                        <p>
                          <b>Cor:</b> {selectedMachine.color}
                        </p>
                        <p>
                          <b>Hídrica:</b> {selectedMachine.water_system}
                        </p>
                        <p>
                          <b>Reservatórios:</b> {selectedMachine.reservoirs}
                        </p>
                        <p>
                          <b>Dimensões:</b> {selectedMachine.dimensions}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                    <Search size={48} className="mb-4" />
                    <p>Selecione um modelo na esquerda.</p>
                  </div>
                )}

                {/* FOOTER DARK FINANCEIRO */}
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gray-900 text-white px-8 flex justify-between items-center">
                  <div>
                    <p className="text-amiste-primary text-xs font-bold uppercase mb-1">
                      Proposta preparada para
                    </p>
                    <p className="text-xl font-bold">
                      {customerName || "Cliente"}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Modalidade: {negotiationType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs uppercase mb-1">
                      Investimento Total
                    </p>
                    <p className="text-4xl font-bold text-green-400">
                      {formatMoney(totalValue)}
                    </p>
                    {installments > 1 && (
                      <p className="text-sm text-white mt-1">
                        {installments}x de {formatMoney(installmentValue)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
