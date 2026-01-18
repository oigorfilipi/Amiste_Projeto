import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PortfolioPDF } from "../components/PortfolioPDF";
import {
  FileText,
  Save,
  Search,
  Plus,
  Trash2,
  ArrowRight,
  DollarSign,
} from "lucide-react";

export function Portfolio() {
  const [view, setView] = useState("list"); // 'list' ou 'editor'
  const [machines, setMachines] = useState([]);
  const [savedPortfolios, setSavedPortfolios] = useState([]);

  // --- ESTADOS DO EDITOR ---
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [negotiationType, setNegotiationType] = useState("Venda"); // Venda, Aluguel, Comodato
  const [totalValue, setTotalValue] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [description, setDescription] = useState("");

  // 1. CARREGAR DADOS INICIAIS
  useEffect(() => {
    fetchMachines();
    fetchPortfolios();
  }, []);

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
  }

  // 2. AÇÕES DO EDITOR
  function handleNewPortfolio() {
    // Reseta form
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

  // 3. SALVAR PROPOSTA
  async function handleSave() {
    if (!selectedMachine || !customerName)
      return alert("Selecione a máquina e informe o cliente.");

    const installmentValue = totalValue / installments;

    const payload = {
      machine_id: selectedMachine.id,
      machine_data: selectedMachine, // Salva snapshot
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

  // Dados consolidados para o PDF/Preview
  const previewData = {
    machine_data: selectedMachine,
    customer_name: customerName,
    negotiation_type: negotiationType,
    total_value: parseFloat(totalValue),
    installments: parseInt(installments),
    installment_value: parseFloat(totalValue) / parseInt(installments || 1),
    description: description,
  };

  return (
    <div className="min-h-screen pb-20">
      {/* CABEÇALHO */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Portfólio & Propostas
          </h1>
          <p className="text-gray-500">Gerador de orçamentos comerciais.</p>
        </div>
        {view === "list" && (
          <button
            onClick={handleNewPortfolio}
            className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus size={20} /> Nova Proposta
          </button>
        )}
      </div>

      {/* --- MODO LISTA (HISTÓRICO) --- */}
      {view === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {savedPortfolios.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed">
              <FileText size={48} className="mx-auto mb-2 opacity-20" />
              <p>Nenhuma proposta criada ainda.</p>
            </div>
          )}
          {savedPortfolios.map((p) => (
            <div
              key={p.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-amiste-primary transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <FileText size={24} className="text-gray-600" />
                </div>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                  R$ {p.total_value?.toLocaleString("pt-BR")}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">
                {p.customer_name}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                {p.machine_data?.name}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Criado em {new Date(p.created_at).toLocaleDateString()}
              </p>

              {/* Botão Baixar (Reusa o componente PDF) */}
              <PDFDownloadLink
                document={<PortfolioPDF data={p} />}
                fileName={`proposta_${p.customer_name}.pdf`}
                className="flex items-center justify-center gap-2 w-full py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-amiste-primary transition-colors"
              >
                <ArrowRight size={16} /> Baixar Novamente
              </PDFDownloadLink>
            </div>
          ))}
        </div>
      )}

      {/* --- MODO EDITOR (CANVA SIMPLIFICADO) --- */}
      {view === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* PAINEL DE CONTROLE (ESQUERDA) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6 h-fit">
            <h2 className="font-bold text-lg border-b pb-2 mb-4">
              Configurar Proposta
            </h2>

            {/* Seleção Máquina */}
            <div>
              <label className="block text-sm font-bold mb-1">
                Modelo da Máquina
              </label>
              <select
                className="w-full p-3 border rounded-lg"
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

            {/* Dados Cliente */}
            <div>
              <label className="block text-sm font-bold mb-1">
                Nome do Cliente
              </label>
              <input
                className="w-full p-3 border rounded-lg"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Padaria Central"
              />
            </div>

            {/* Financeiro */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <label className="block text-sm font-bold mb-3 flex items-center gap-1">
                <DollarSign size={16} /> Condição Comercial
              </label>

              <div className="flex gap-2 mb-3">
                {["Venda", "Aluguel", "Comodato", "Evento"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setNegotiationType(t)}
                    className={`flex-1 py-1 text-xs rounded border ${negotiationType === t ? "bg-amiste-primary text-white border-amiste-primary" : "bg-white text-gray-600 border-gray-300"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-bold">
                    Valor Total (R$)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-bold">
                    Parcelas
                  </label>
                  <select
                    className="w-full p-2 border rounded"
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
              </div>
            </div>

            {/* Texto Personalizado */}
            <div>
              <label className="block text-sm font-bold mb-1">
                Descrição Comercial
              </label>
              <textarea
                className="w-full p-3 border rounded-lg text-sm"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Botões Ação */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setView("list")}
                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-green-600 text-white font-bold hover:bg-green-700 rounded-lg shadow-md flex justify-center items-center gap-2"
              >
                <Save size={18} /> Salvar
              </button>
            </div>
          </div>

          {/* PREVIEW A4 (DIREITA) */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-500 text-sm">
                Pré-visualização (Folha A4)
              </h2>

              {/* Botão Baixar Agora */}
              {selectedMachine && (
                <PDFDownloadLink
                  document={<PortfolioPDF data={previewData} />}
                  fileName="proposta_rascunho.pdf"
                  className="text-sm font-bold text-amiste-primary hover:underline flex items-center gap-1"
                >
                  <ArrowRight size={16} /> Baixar PDF de Teste
                </PDFDownloadLink>
              )}
            </div>

            {/* O PAPEL (Visualização HTML que imita o PDF) */}
            <div className="bg-white w-full aspect-[1/1.41] shadow-2xl rounded-sm border border-gray-200 relative flex flex-col overflow-hidden">
              {/* Header Vermelho */}
              <div className="h-24 bg-amiste-primary p-8 flex justify-between items-center">
                <div>
                  <h1 className="text-white font-display text-3xl font-bold">
                    AMISTE CAFÉ
                  </h1>
                  <p className="text-red-200 text-xs uppercase tracking-widest">
                    Proposta Comercial
                  </p>
                </div>
              </div>

              {selectedMachine ? (
                <div className="p-10 flex-1 flex flex-col">
                  {/* Hero */}
                  <div className="flex gap-8 mb-8">
                    <img
                      src={selectedMachine.photo_url}
                      className="w-48 h-48 object-contain bg-gray-50 rounded-lg"
                    />
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-gray-800 mb-1">
                        {selectedMachine.name}
                      </h2>
                      <p className="text-gray-500 uppercase tracking-wide text-sm mb-4">
                        {selectedMachine.brand} | {selectedMachine.model}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>

                  {/* Tabela Specs */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-auto">
                    <h3 className="font-bold text-amiste-primary mb-4 border-b border-gray-200 pb-2">
                      Especificações Técnicas
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700">
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
                    </div>
                  </div>

                  {/* Footer Financeiro (Preto) */}
                  <div className="bg-gray-900 text-white -mx-10 -mb-10 p-8 flex justify-between items-center mt-8">
                    <div>
                      <p className="text-amiste-primary font-bold text-sm uppercase mb-1">
                        Proposta para
                      </p>
                      <p className="text-xl font-bold">
                        {customerName || "Nome do Cliente"}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {negotiationType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs uppercase mb-1">
                        Investimento Total
                      </p>
                      <p className="text-4xl font-bold text-green-400">
                        R${" "}
                        {parseFloat(totalValue).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      {installments > 1 && (
                        <p className="text-sm text-white mt-1">
                          {installments}x de R${" "}
                          {(totalValue / installments).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-300 flex-col">
                  <Search size={48} className="mb-4" />
                  <p>Selecione um modelo ao lado para visualizar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
