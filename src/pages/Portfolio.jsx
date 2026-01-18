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
  Trash2,
  History,
  RotateCcw,
  Clock,
} from "lucide-react";

export function Portfolio() {
  const [view, setView] = useState("list");
  const [machines, setMachines] = useState([]);
  const [savedPortfolios, setSavedPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DO EDITOR ---
  const [editingId, setEditingId] = useState(null);
  const [versions, setVersions] = useState([]); // Histórico

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
    setEditingId(null);
    setVersions([]);
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

  function handleEditPortfolio(p) {
    setEditingId(p.id);
    setVersions(p.versions || []);

    setSelectedMachine(p.machine_data);
    setCustomerName(p.customer_name);
    setNegotiationType(p.negotiation_type);
    setTotalValue(p.total_value);
    setInstallments(p.installments);
    setDescription(p.description);

    setView("editor");
  }

  // Restaurar Versão (Via Dropdown)
  function handleRestoreVersion(e) {
    const index = e.target.value;
    if (index === "") return; // Seleção vazia

    const v = versions[index];
    if (
      !confirm(
        `Restaurar para a versão de ${new Date(v.saved_at).toLocaleString()}?`,
      )
    ) {
      e.target.value = ""; // Reseta o select se cancelar
      return;
    }

    setCustomerName(v.customer_name);
    setNegotiationType(v.negotiation_type);
    setTotalValue(v.total_value);
    setInstallments(v.installments);
    setDescription(v.description);
    alert("Dados restaurados! Clique em Salvar para confirmar essa alteração.");
    e.target.value = ""; // Reseta o select após restaurar
  }

  function handleSelectMachine(e) {
    const id = e.target.value;
    const m = machines.find((x) => x.id.toString() === id);
    setSelectedMachine(m || null);
  }

  async function handleSave() {
    if (!selectedMachine || !customerName)
      return alert("Selecione a máquina e informe o cliente.");

    const currentData = {
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

    try {
      if (editingId) {
        // Salva histórico (Máximo 10 versões, mas vamos mostrar só 5 no dropdown)
        const oldVersion = {
          saved_at: new Date().toISOString(),
          customer_name: customerName,
          negotiation_type: negotiationType,
          total_value: totalValue,
          installments: installments,
          description: description,
        };
        const newVersionsList = [oldVersion, ...versions].slice(0, 10);

        const { error } = await supabase
          .from("portfolios")
          .update({ ...currentData, versions: newVersionsList })
          .eq("id", editingId);

        if (error) throw error;
        alert("Proposta atualizada!");
      } else {
        const { error } = await supabase.from("portfolios").insert(currentData);
        if (error) throw error;
        alert("Proposta criada!");
      }

      fetchPortfolios();
      setView("list");
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm("Excluir esta proposta?")) return;
    await supabase.from("portfolios").delete().eq("id", id);
    fetchPortfolios();
  }

  const previewData = {
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

  // Componente "Mini A4" para a lista
  const MiniA4Thumbnail = ({ portfolio }) => {
    return (
      <div className="w-full aspect-[210/297] bg-white relative flex flex-col shadow-sm border border-gray-100 overflow-hidden group-hover:shadow-md transition-all">
        {/* Mini Header Vermelho */}
        <div className="h-[10%] bg-white border-b border-amiste-primary px-3 flex flex-col justify-center">
          <div className="text-[10px] font-bold text-gray-800 uppercase leading-none">
            AMISTE CAFÉ
          </div>
          <div className="text-[6px] font-bold text-amiste-primary uppercase tracking-widest mt-0.5">
            Proposta
          </div>
        </div>

        {/* Mini Corpo */}
        <div className="flex-1 p-3 flex flex-col items-center">
          <div className="w-full h-1/2 flex items-center justify-center mb-2">
            <img
              src={portfolio.machine_data?.photo_url}
              className="max-h-full max-w-full object-contain mix-blend-multiply"
            />
          </div>
          <div className="w-full">
            <div className="text-[10px] font-bold text-gray-900 leading-tight truncate">
              {portfolio.machine_data?.name}
            </div>
            <div className="text-[8px] text-gray-500 uppercase font-bold truncate mb-1">
              {portfolio.machine_data?.brand}
            </div>
            <div className="w-full h-[1px] bg-gray-100 mb-1"></div>
            <div className="text-[7px] text-gray-400 line-clamp-3 leading-tight">
              {portfolio.description}
            </div>
          </div>
        </div>

        {/* Mini Footer Vermelho */}
        <div className="h-[12%] bg-amiste-primary text-white px-3 flex justify-between items-center">
          <div>
            <div className="text-[6px] text-red-200 uppercase">Para</div>
            <div className="text-[8px] font-bold truncate max-w-[60px]">
              {portfolio.customer_name}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[8px] font-bold">
              {formatMoney(portfolio.total_value)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-100">
      {/* --- MODO LISTA (GRID VISUAL A4) --- */}
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in">
            {savedPortfolios.length === 0 && !loading && (
              <div className="col-span-full text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">
                <FileText size={48} className="mx-auto mb-2 opacity-20" />
                <p>Nenhuma proposta criada ainda.</p>
              </div>
            )}

            {savedPortfolios.map((p) => (
              <div
                key={p.id}
                onClick={() => handleEditPortfolio(p)}
                className="group cursor-pointer flex flex-col items-center"
              >
                {/* Thumbnail que imita o A4 */}
                <div className="w-full relative transition-transform duration-300 hover:-translate-y-2">
                  <MiniA4Thumbnail portfolio={p} />

                  {/* Botão Deletar (Hover) */}
                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mt-3 text-center">
                  <p className="font-bold text-gray-800 text-sm truncate w-40">
                    {p.customer_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODO EDITOR --- */}
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
              {/* Botão Baixar PDF direto do Editor */}
              {selectedMachine && (
                <PDFDownloadLink
                  document={<PortfolioPDF data={previewData} />}
                  fileName={`proposta_${customerName || "rascunho"}.pdf`}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold transition"
                >
                  <Search size={18} /> Ver PDF
                </PDFDownloadLink>
              )}
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold shadow-lg transition"
              >
                <Save size={18} />{" "}
                {editingId ? "Salvar Edição" : "Criar Proposta"}
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* SIDEBAR DE CONTROLE */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col shadow-xl z-10">
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                {/* DROPDOWN DE HISTÓRICO (Últimas 5 Versões) */}
                {versions.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1">
                      <History size={14} /> Restaurar Versão Anterior:
                    </label>
                    <div className="relative">
                      <select
                        className="w-full p-2 pl-8 border border-blue-200 rounded text-sm bg-white focus:outline-none focus:border-blue-400 text-gray-600"
                        onChange={handleRestoreVersion}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Selecione para restaurar...
                        </option>
                        {versions.slice(0, 5).map((v, i) => (
                          <option key={i} value={i}>
                            {new Date(v.saved_at).toLocaleString()} - R${" "}
                            {v.total_value}
                          </option>
                        ))}
                      </select>
                      <Clock
                        size={14}
                        className="absolute left-2 top-2.5 text-gray-400"
                      />
                    </div>
                  </div>
                )}

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
                    value={selectedMachine?.id || ""}
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
                    {[1, 2, 3, 4, 5, 6, 10, 12, 18, 24, 36, 48].map((n) => (
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
                    rows="6"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Resumo Rodapé Sidebar */}
              <div className="bg-gray-800 text-white p-4 border-t border-gray-700">
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
                    {/* Hero com Imagem Grande */}
                    <div className="flex gap-8 mb-6">
                      <div className="w-1/2 h-[250px] bg-gray-50 rounded-lg flex items-center justify-center p-2">
                        <img
                          src={selectedMachine.photo_url}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="w-1/2 flex flex-col justify-start pt-2">
                        <h2 className="text-3xl font-bold text-gray-900 mb-1 leading-tight">
                          {selectedMachine.name}
                        </h2>
                        <p className="text-gray-500 uppercase tracking-wide text-sm mb-4 font-bold">
                          {selectedMachine.brand} | {selectedMachine.model}
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed text-justify whitespace-pre-wrap">
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

                {/* FOOTER VERMELHO */}
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-amiste-primary text-white px-8 flex justify-between items-center">
                  <div>
                    <p className="text-red-200 text-xs font-bold uppercase mb-1">
                      Proposta preparada para
                    </p>
                    <p className="text-xl font-bold">
                      {customerName || "Cliente"}
                    </p>
                    <p className="text-red-300 text-xs mt-1">
                      Modalidade: {negotiationType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-200 text-xs uppercase mb-1">
                      Investimento Total
                    </p>
                    <p className="text-4xl font-bold text-white">
                      {formatMoney(totalValue)}
                    </p>
                    {installments > 1 && (
                      <p className="text-sm text-red-100 mt-1">
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
