import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { PortfolioPDF } from "../components/PortfolioPDF";
import toast from "react-hot-toast";
import {
  FileText,
  Save,
  Search,
  Plus,
  DollarSign,
  ChevronLeft,
  Trash2,
  Clock,
  Youtube,
  Calendar,
  Coffee,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileBarChart,
  Layers,
  Printer,
} from "lucide-react";

export function Portfolio() {
  const [view, setView] = useState("list");
  const [machines, setMachines] = useState([]);
  const [savedPortfolios, setSavedPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- ESTADOS DO EDITOR ---
  const [editingId, setEditingId] = useState(null);
  const [versions, setVersions] = useState([]);

  const [machineImageBase64, setMachineImageBase64] = useState(null);

  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedModelIndex, setSelectedModelIndex] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [negotiationType, setNegotiationType] = useState("Venda");
  const [totalValue, setTotalValue] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [description, setDescription] = useState("");
  const [installmentValue, setInstallmentValue] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");

  // NOVOS CAMPOS
  const [status, setStatus] = useState("Aguardando");
  const [obs, setObs] = useState("");

  useEffect(() => {
    fetchMachines();
    fetchPortfolios();
  }, []);

  // Conversão de Imagem para Base64 (Com Fix de CORS via Proxy)
  useEffect(() => {
    async function convertImage() {
      // Se não tem máquina selecionada, limpa a imagem e retorna
      if (!selectedMachine) {
        setMachineImageBase64(null);
        return;
      }

      // Determina qual URL usar (Modelo ou Pai)
      let urlToUse = selectedMachine.photo_url;

      // Se tem modelo selecionado e ele tem foto específica, usa a do modelo
      if (
        selectedModelIndex !== "" &&
        selectedMachine.models &&
        selectedMachine.models[selectedModelIndex]
      ) {
        const model = selectedMachine.models[selectedModelIndex];
        if (model.photo_url) urlToUse = model.photo_url;
      }

      if (urlToUse) {
        try {
          const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(urlToUse)}`;
          const response = await fetch(proxyUrl);
          const blob = await response.blob();

          // --- CORREÇÃO DO ERRO AQUI ---
          const reader = new FileReader();
          reader.onloadend = () => {
            setMachineImageBase64(reader.result);
          };
          reader.readAsDataURL(blob);
          // -----------------------------
        } catch (error) {
          console.error("Erro ao converter imagem:", error);
          setMachineImageBase64(null);
        }
      } else {
        setMachineImageBase64(null);
      }
    }
    convertImage();
  }, [selectedMachine, selectedModelIndex]);

  useEffect(() => {
    if (totalValue > 0 && installments > 0) {
      setInstallmentValue(totalValue / installments);
    } else {
      setInstallmentValue(0);
    }
  }, [totalValue, installments]);

  async function fetchMachines() {
    try {
      const { data } = await supabase
        .from("machines")
        .select("*")
        .order("name");
      if (data) setMachines(data);
    } catch (error) {
      toast.error("Erro ao carregar máquinas.");
    }
  }

  async function fetchPortfolios() {
    try {
      const { data } = await supabase
        .from("portfolios")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setSavedPortfolios(data);
    } catch (error) {
      toast.error("Erro ao carregar propostas.");
    } finally {
      setLoading(false);
    }
  }

  // --- AÇÕES ---
  function handleNewPortfolio() {
    setEditingId(null);
    setVersions([]);
    setSelectedMachine(null);
    setSelectedModelIndex("");
    setCustomerName("");
    setNegotiationType("Venda");
    setTotalValue(0);
    setInstallments(1);
    setVideoUrl("");
    setObs("");
    setStatus("Aguardando");
    setDescription(
      "Equipamento de alta performance, ideal para seu estabelecimento. Design moderno e extração perfeita.",
    );
    setView("editor");
  }

  function handleEditPortfolio(p) {
    setEditingId(p.id);
    setVersions(p.versions || []);
    setSelectedMachine(p.machine_data);

    // Tenta recuperar o índice do modelo se foi salvo anteriormente
    // Se não tiver salvo, tenta adivinhar pelo nome ou deixa vazio
    setSelectedModelIndex("");

    setCustomerName(p.customer_name);
    setNegotiationType(p.negotiation_type);
    setTotalValue(p.total_value);
    setInstallments(p.installments);
    setDescription(p.description);
    setVideoUrl(p.video_url || "");
    setObs(p.obs || "");
    setStatus(p.status || "Aguardando");
    setView("editor");
  }

  function handleSelectMachine(e) {
    const id = e.target.value;
    const m = machines.find((x) => x.id.toString() === id);
    if (m) {
      setSelectedMachine(m);
      setSelectedModelIndex(""); // Reseta o modelo
      setDescription(
        m.description ||
          "Equipamento de alta performance, ideal para seu estabelecimento. Design moderno e extração perfeita.",
      );
      setVideoUrl(m.video_url || "");
    } else {
      setSelectedMachine(null);
    }
  }

  // Função para montar os dados finais que vão para o PDF
  // Ela mescla os dados da máquina PAI com os dados do MODELO FILHO
  function getPreviewData() {
    if (!selectedMachine) return null;

    let machineData = { ...selectedMachine };

    if (
      selectedModelIndex !== "" &&
      selectedMachine.models &&
      selectedMachine.models[selectedModelIndex]
    ) {
      const model = selectedMachine.models[selectedModelIndex];

      // Nome Composto
      machineData.name = `${selectedMachine.name} - ${model.name}`;

      // Sobrescreve apenas se o modelo tiver valor (Herança)
      if (model.photo_url) machineData.photo_url = model.photo_url;
      if (model.video_url) machineData.video_url = model.video_url;
      if (model.voltage) machineData.voltage = model.voltage;
      if (model.weight) machineData.weight = model.weight;
      if (model.dimensions) machineData.dimensions = model.dimensions;
      if (model.amperage) machineData.amperage = model.amperage;
      if (model.water_system) machineData.water_system = model.water_system;

      // Específicos
      if (model.water_tank_size)
        machineData.water_tank_size = model.water_tank_size;
      if (model.cups_capacity) machineData.cups_capacity = model.cups_capacity;
      if (model.filter_type) machineData.filter_type = model.filter_type;
      if (model.dregs_capacity)
        machineData.dregs_capacity = model.dregs_capacity;
      if (model.extra_reservoir_capacity)
        machineData.extra_reservoir_capacity = model.extra_reservoir_capacity;
    }
    return {
      machine_data: machineData,
      // Envia a imagem já convertida (que o useEffect acima cuidou de pegar a certa)
      machine_image_base64: machineImageBase64,
      customer_name: customerName,
      negotiation_type: negotiationType,
      total_value: parseFloat(totalValue),
      installments: parseInt(installments),
      installment_value: parseFloat(installmentValue),
      description: description,
      video_url: machineData.video_url || videoUrl, // Usa a do modelo se tiver, ou a digitada
      obs: obs,
    };
  }

  const previewData = getPreviewData();

  async function handleSave() {
    if (!selectedMachine || !customerName)
      return toast.error("Selecione a máquina e informe o cliente.");

    // Se a máquina exige modelo, obriga a selecionar
    if (
      selectedMachine.models &&
      selectedMachine.models.length > 0 &&
      selectedModelIndex === ""
    ) {
      return toast.error(
        "Esta máquina possui variações. Por favor, selecione o Modelo específico.",
      );
    }

    const currentData = {
      machine_id: selectedMachine.id,
      machine_data: previewData.machine_data, // Salva já com os dados mesclados
      customer_name: customerName,
      negotiation_type: negotiationType,
      total_value: totalValue,
      installments: installments,
      installment_value: installmentValue,
      description: description,
      video_url: videoUrl,
      status: status,
      obs: obs,
    };

    try {
      if (editingId) {
        const oldVersion = {
          saved_at: new Date().toISOString(),
          ...currentData,
        };
        const newVersionsList = [{ ...oldVersion }, ...versions].slice(0, 10);

        const { error } = await supabase
          .from("portfolios")
          .update({ ...currentData, versions: newVersionsList })
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Proposta atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("portfolios").insert(currentData);
        if (error) throw error;
        toast.success("Proposta criada com sucesso!");
      }
      fetchPortfolios();
      setView("list");
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm("Excluir esta proposta permanentemente?")) return;

    try {
      const { error } = await supabase.from("portfolios").delete().eq("id", id);
      if (error) throw error;
      toast.success("Proposta excluída.");
      fetchPortfolios();
    } catch (err) {
      toast.error("Erro ao excluir: " + err.message);
    }
  }

  const formatMoney = (val) =>
    val
      ? `R$ ${parseFloat(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      : "R$ 0,00";

  const filteredPortfolios = savedPortfolios.filter(
    (p) =>
      p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.machine_data?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusStyle = (st) => {
    switch (st) {
      case "Concluido":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          icon: CheckCircle,
          label: "Concluído",
        };
      case "Cancelado":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          icon: XCircle,
          label: "Cancelado",
        };
      default:
        return {
          bg: "bg-amber-100",
          text: "text-amber-700",
          icon: Clock,
          label: "Aguardando",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* ... (TELA DE LISTAGEM) ... */}
      {view === "list" && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">
                Portfólio & Propostas
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Gerencie propostas comerciais e acompanhe o status.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                  placeholder="Buscar proposta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handleNewPortfolio}
                className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Plus size={20} />{" "}
                <span className="md:hidden lg:inline">Nova Proposta</span>
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-10">
              Carregando propostas...
            </p>
          ) : filteredPortfolios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center animate-fade-in mx-auto max-w-2xl mt-4">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <FileBarChart size={48} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Nenhuma proposta encontrada
              </h3>
              <p className="text-gray-400 max-w-sm mx-auto mb-8 text-sm px-4">
                Não encontramos propostas para esse filtro. Crie um novo
                orçamento para começar.
              </p>
              <button
                onClick={handleNewPortfolio}
                className="bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1"
              >
                <Plus size={20} /> Criar Nova Proposta
              </button>
            </div>
          ) : (
            // GRID DE PROPOSTAS
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredPortfolios.map((p) => {
                const statusStyle = getStatusStyle(p.status || "Aguardando");
                return (
                  <div
                    key={p.id}
                    onClick={() => handleEditPortfolio(p)}
                    className="group cursor-pointer flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 active:scale-[0.98]"
                  >
                    {/* Badge de Status */}
                    <div
                      className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      <statusStyle.icon size={10} /> {statusStyle.label}
                    </div>

                    {/* Capa */}
                    <div className="w-full aspect-[210/297] bg-white relative flex flex-col border-b border-gray-100">
                      <div className="h-[15%] bg-white px-4 pt-4 flex justify-end"></div>
                      <div className="flex-1 flex flex-col items-center justify-center p-4">
                        {p.machine_data?.photo_url ? (
                          <img
                            src={p.machine_data.photo_url}
                            className="w-16 h-16 md:w-20 md:h-20 object-contain mix-blend-multiply mb-2"
                          />
                        ) : (
                          <Coffee size={24} className="text-gray-300" />
                        )}
                        <div className="text-[9px] font-bold text-gray-800 text-center leading-tight line-clamp-2 px-2">
                          {p.machine_data?.name}
                        </div>
                      </div>
                      <div className="h-[15%] bg-amiste-primary flex items-center justify-between px-3 text-white">
                        <div className="text-[8px] font-bold truncate max-w-[60px]">
                          {p.customer_name}
                        </div>
                        <div className="text-[8px] font-bold">
                          {formatMoney(p.total_value)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(p.id, e)}
                        className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 z-10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Rodapé do Card */}
                    <div className="p-3 md:p-4 bg-white">
                      <h3
                        className="font-bold text-gray-800 text-xs md:text-sm truncate"
                        title={p.customer_name}
                      >
                        {p.customer_name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] md:text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase font-bold">
                          {p.negotiation_type}
                        </span>
                        <span className="text-[9px] md:text-[10px] text-gray-400">
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- MODO EDITOR --- */}
      {view === "editor" && (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-100 fixed inset-0 z-50">
          {/* Header do Editor */}
          <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center z-20 shadow-sm shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => setView("list")}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div>
                <h1 className="text-base md:text-lg font-bold text-gray-800 leading-tight">
                  Editor
                </h1>
                <p className="text-xs text-gray-500 hidden md:block">
                  {selectedMachine ? selectedMachine.name : "Nova Proposta"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Botão PDF Mobile (Ícone apenas) */}
              {selectedMachine && (
                <PDFDownloadLink
                  document={<PortfolioPDF data={previewData} />}
                  fileName={`proposta_${customerName || "rascunho"}.pdf`}
                  className="p-2 md:px-4 md:py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  {({ loading }) =>
                    loading ? (
                      <Clock size={20} className="animate-spin" />
                    ) : (
                      <Printer size={20} />
                    )
                  }
                  <span className="hidden md:inline">Baixar PDF</span>
                </PDFDownloadLink>
              )}

              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <Save size={18} />{" "}
                <span className="hidden md:inline">
                  {editingId ? "Salvar Alterações" : "Criar Proposta"}
                </span>
                <span className="md:hidden">Salvar</span>
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* SIDEBAR DE EDIÇÃO (Formulário) */}
            {/* No mobile: w-full. No desktop: w-96 */}
            <div className="w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col z-10 overflow-y-auto">
              <div className="p-4 md:p-6 space-y-6 pb-24">
                {/* Status */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                    <AlertCircle size={14} /> Status da Negociação
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: "Aguardando",
                        icon: Clock,
                        color: "text-amber-600",
                        bg: "bg-amber-50",
                        border: "border-amber-200",
                      },
                      {
                        id: "Concluido",
                        icon: CheckCircle,
                        color: "text-green-600",
                        bg: "bg-green-50",
                        border: "border-green-200",
                      },
                      {
                        id: "Cancelado",
                        icon: XCircle,
                        color: "text-red-600",
                        bg: "bg-red-50",
                        border: "border-red-200",
                      },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setStatus(st.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                          status === st.id
                            ? `${st.bg} ${st.border} ${st.color} ring-2 ring-offset-1 ring-${st.color.split("-")[1]}-200`
                            : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <st.icon size={20} className="mb-1" />
                        <span className="text-[9px] font-bold uppercase truncate w-full text-center">
                          {st.id}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide border-b border-gray-100 pb-2">
                    Configuração Básica
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Máquina
                    </label>
                    <select
                      className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
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

                  {/* SELETOR DE MODELOS */}
                  {selectedMachine &&
                    selectedMachine.models &&
                    selectedMachine.models.length > 0 && (
                      <div className="animate-fade-in bg-purple-50 p-3 rounded-xl border border-purple-200">
                        <label className="block text-xs font-bold text-purple-800 uppercase mb-1 flex items-center gap-1">
                          <Layers size={12} /> Selecione o Modelo
                        </label>
                        <select
                          className="w-full p-2 border border-purple-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                          value={selectedModelIndex}
                          onChange={(e) =>
                            setSelectedModelIndex(e.target.value)
                          }
                        >
                          <option value="">-- Escolha a variação --</option>
                          {selectedMachine.models.map((mod, idx) => (
                            <option key={idx} value={idx}>
                              {mod.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Cliente
                    </label>
                    <input
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nome da Empresa/Pessoa"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Link de Vídeo (Opcional)
                    </label>
                    <div className="relative">
                      <input
                        className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="youtube.com/..."
                      />
                      <Youtube
                        size={18}
                        className="absolute left-3 top-3.5 text-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide border-b border-gray-100 pb-2 pt-4">
                    Valores e Condições
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Modalidade
                      </label>
                      <select
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none"
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
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Parcelas
                      </label>
                      <select
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none"
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
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Valor Total
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full p-3 pl-10 border border-gray-200 rounded-xl bg-gray-50 font-bold text-gray-800 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
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
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Texto da Proposta
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-amiste-primary outline-none text-sm leading-relaxed resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Observações Gerais
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-xl h-20 focus:ring-2 focus:ring-amiste-primary outline-none text-sm resize-none"
                      value={obs}
                      onChange={(e) => setObs(e.target.value)}
                      placeholder="Ex: Incluso kit de insumos inicial..."
                    ></textarea>
                  </div>
                </div>

                <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-lg mt-4 mb-8">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">
                    Parcela Mensal Estimada
                  </p>
                  <p className="text-3xl font-bold text-green-400 tracking-tight">
                    {formatMoney(installmentValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* --- ÁREA DE PREVIEW (SÓ DESKTOP) --- */}
            <div className="hidden lg:flex flex-1 bg-gray-200 overflow-hidden justify-center items-center">
              {previewData ? (
                <PDFViewer showToolbar={false} className="w-full h-full">
                  <PortfolioPDF data={previewData} />
                </PDFViewer>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Coffee size={64} className="mb-4 opacity-20" />
                  <p className="font-bold text-lg">
                    Selecione um modelo para visualizar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
