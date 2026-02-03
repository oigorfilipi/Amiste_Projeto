import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Upload,
  Save,
  X,
  Trash2,
  Edit2, // <--- Usado para editar o modelo
  Zap,
  Droplet,
  Ruler,
  Image as ImageIcon,
  Link as LinkIcon,
  Barcode,
  Settings,
  Database,
  FileText,
  Coffee,
  Scale,
  MapPin,
  Filter,
  Clock,
  Trash,
  Youtube,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw, // <--- Ícone para cancelar edição
} from "lucide-react";

// ... (CONSTANTES MODEL_OPTIONS, BRAND_OPTIONS, TYPE_OPTIONS mantêm iguais)
const MODEL_OPTIONS = [
  "Iper Automática",
  "Kalerm 1602",
  "Kalerm 1603",
  "Insta 500",
  "Insta 42",
];
const BRAND_OPTIONS = [
  "Saeco",
  "Gaggia",
  "Rheavendors",
  "Kalerm",
  "Spidem",
  "Impomac",
  "Bunn",
  "Fetco",
  "Fiorenzato",
  "Marchesoni",
];
const TYPE_OPTIONS = [
  "Multibebidas",
  "Café em Grãos",
  "Profissional",
  "Vending",
  "Snacks",
  "Coado",
  "Moedor",
];

export function Machines() {
  const { permissions } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [machines, setMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState(null);

  // --- FORMULÁRIO GERAL ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [type, setType] = useState("");
  const [customType, setCustomType] = useState("");
  const [status, setStatus] = useState("Disponível");
  const [photoUrl, setPhotoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageMode, setImageMode] = useState("url");
  const [patrimony, setPatrimony] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  // --- LÓGICA DE MODELOS MÚLTIPLOS ---
  const [hasVariations, setHasVariations] = useState(false);
  const [modelsList, setModelsList] = useState([]);

  // NOVO: Estado para saber qual índice da lista estamos editando (null = criando novo)
  const [editingModelIndex, setEditingModelIndex] = useState(null);

  // Estado temporário do modelo
  const [tempModel, setTempModel] = useState({
    name: "",
    photo_url: "",
    video_url: "",
    voltage: "",
    weight: "",
    dimensions: "",
    amperage: "",
    water_system: "",
    cups_capacity: "",
    filter_type: "",
    dregs_capacity: "",
    water_tank_size: "",
    extraction_cups: "",
    extraction_nozzles: "",
    drink_combinations: "",
    dose_autonomy: "",
    extra_reservoir_capacity: "",
  });

  // --- TÉCNICOS (Usado se NÃO tiver variações OU como padrão do pai) ---
  const [voltage, setVoltage] = useState("220v");
  const [waterSystem, setWaterSystem] = useState("Reservatório");
  const [amperage, setAmperage] = useState("10A");
  const [color, setColor] = useState("Preto");
  const [waterTankSize, setWaterTankSize] = useState("");
  const [weight, setWeight] = useState("");
  const [environmentRecommendation, setEnvironmentRecommendation] =
    useState("");
  const [extractionCups, setExtractionCups] = useState("");
  const [extractionNozzles, setExtractionNozzles] = useState("");
  const [drinkCombinations, setDrinkCombinations] = useState("");
  const [doseAutonomy, setDoseAutonomy] = useState("");
  const [simultaneousDispenser, setSimultaneousDispenser] = useState(false);
  const [dregsCapacity, setDregsCapacity] = useState("");
  const [trayCount, setTrayCount] = useState("");
  const [selectionCount, setSelectionCount] = useState("");
  const [cupsCapacity, setCupsCapacity] = useState("");
  const [filterType, setFilterType] = useState("");
  const [hasSewage, setHasSewage] = useState(false);
  const [hasExtraReservoir, setHasExtraReservoir] = useState(true);
  const [reservoirCount, setReservoirCount] = useState(0);
  const [extraReservoirCapacity, setExtraReservoirCapacity] = useState("");
  const [hasSteamer, setHasSteamer] = useState("Não");
  const [dimensions, setDimensions] = useState({ w: "", h: "", d: "" });

  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    try {
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .order("name");
      if (error) throw error;
      setMachines(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ... (handleImageUpload e handlePatrimonyChange iguais) ...
  async function handleImageUpload(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;
      const fileExt = file.name.split(".").pop();
      const fileName = `machines/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      setPhotoUrl(data.publicUrl);
      alert("Imagem enviada!");
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  const handlePatrimonyChange = (e) =>
    setPatrimony(e.target.value.replace(/\D/g, ""));

  // --- NOVAS FUNÇÕES DE GERENCIAMENTO DE MODELOS ---

  // 1. Salvar (Criar ou Atualizar)
  function handleSaveModel() {
    if (!tempModel.name)
      return alert("Dê um nome para o modelo (ex: 15 Litros)");

    const newList = [...modelsList];

    if (editingModelIndex !== null) {
      // MODO EDIÇÃO: Atualiza o item existente
      newList[editingModelIndex] = { ...tempModel };
      setEditingModelIndex(null); // Sai do modo edição
    } else {
      // MODO CRIAÇÃO: Adiciona novo
      newList.push({ ...tempModel });
    }

    setModelsList(newList);

    // Limpa o formulário temporário
    setTempModel({
      name: "",
      photo_url: "",
      video_url: "",
      voltage: "",
      weight: "",
      dimensions: "",
      amperage: "",
      water_system: "",
      cups_capacity: "",
      filter_type: "",
      dregs_capacity: "",
      water_tank_size: "",
      extraction_cups: "",
      extraction_nozzles: "",
      drink_combinations: "",
      dose_autonomy: "",
      extra_reservoir_capacity: "",
    });
  }

  // 2. Editar (Carrega dados no form)
  function handleEditModel(index) {
    setTempModel(modelsList[index]);
    setEditingModelIndex(index);
  }

  // 3. Cancelar Edição
  function handleCancelEditModel() {
    setEditingModelIndex(null);
    setTempModel({
      name: "",
      photo_url: "",
      video_url: "",
      voltage: "",
      weight: "",
      dimensions: "",
      amperage: "",
      water_system: "",
      cups_capacity: "",
      filter_type: "",
      dregs_capacity: "",
      water_tank_size: "",
      extraction_cups: "",
      extraction_nozzles: "",
      drink_combinations: "",
      dose_autonomy: "",
      extra_reservoir_capacity: "",
    });
  }

  // 4. Remover
  function removeModel(index) {
    if (confirm("Remover este modelo da lista?")) {
      const newList = [...modelsList];
      newList.splice(index, 1);
      setModelsList(newList);

      // Se estava editando esse, cancela a edição
      if (editingModelIndex === index) {
        handleCancelEditModel();
      }
    }
  }

  function handleEdit(machine) {
    if (!permissions.canManageMachines) return alert("Sem permissão.");
    setEditingId(machine.id);
    setName(machine.name);
    setDescription(machine.description || "");
    setPhotoUrl(machine.photo_url || "");
    setVideoUrl(machine.video_url || "");
    setStatus(machine.status || "Disponível");
    setImageMode(machine.photo_url?.includes("supabase") ? "file" : "url");
    setPatrimony(machine.patrimony || "");
    setSerialNumber(machine.serial_number || "");

    // Carregar Modelos
    const loadedModels = machine.models || [];
    setModelsList(loadedModels);
    setHasVariations(loadedModels.length > 0);
    setEditingModelIndex(null); // Reseta edição de modelo

    // Dropdowns (mantém igual)
    if (MODEL_OPTIONS.includes(machine.model)) {
      setModel(machine.model);
      setCustomModel("");
    } else {
      setModel("Outro");
      setCustomModel(machine.model);
    }
    if (BRAND_OPTIONS.includes(machine.brand)) {
      setBrand(machine.brand);
      setCustomBrand("");
    } else {
      setBrand("Outro");
      setCustomBrand(machine.brand);
    }
    if (TYPE_OPTIONS.includes(machine.type)) {
      setType(machine.type);
      setCustomType("");
    } else {
      setType("Outro");
      setCustomType(machine.type);
    }

    // Carregar Dados Únicos (Pai)
    setVoltage(machine.voltage || "220v");
    setWaterSystem(machine.water_system || "Reservatório");
    setAmperage(machine.amperage || "10A");
    setColor(machine.color || "Preto");
    setHasSteamer(machine.has_steamer || "Não");
    setHasSewage(machine.has_sewage || false);
    setReservoirCount(machine.reservoir_count || 0);
    setExtraReservoirCapacity(machine.extra_reservoir_capacity || "");
    setHasExtraReservoir((machine.reservoir_count || 0) > 0);

    if (machine.dimensions) {
      const dims = machine.dimensions.split("x");
      setDimensions({ w: dims[0] || "", h: dims[1] || "", d: dims[2] || "" });
    } else {
      setDimensions({ w: "", h: "", d: "" });
    }

    setWaterTankSize(machine.water_tank_size || "");
    setWeight(machine.weight || "");
    setEnvironmentRecommendation(machine.environment_recommendation || "");
    setExtractionCups(machine.extraction_cups || "");
    setExtractionNozzles(machine.extraction_nozzles || "");
    setDrinkCombinations(machine.drink_combinations || "");
    setDoseAutonomy(machine.dose_autonomy || "");
    setSimultaneousDispenser(machine.simultaneous_dispenser || false);
    setDregsCapacity(machine.dregs_capacity || "");
    setTrayCount(machine.tray_count || "");
    setSelectionCount(machine.selection_count || "");
    setCupsCapacity(machine.cups_capacity || "");
    setFilterType(machine.filter_type || "");

    setShowModal(true);
  }

  function handleNew() {
    if (!permissions.canManageMachines) return alert("Sem permissão.");
    resetForm();
    setImageMode("url");
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const finalModel = model === "Outro" ? customModel : model;
      const finalBrand = brand === "Outro" ? customBrand : brand;
      const finalType = type === "Outro" ? customType : type;

      const dimString = `${dimensions.w}x${dimensions.h}x${dimensions.d}`;

      const finalReservoirCount = hasExtraReservoir
        ? parseInt(reservoirCount)
        : 0;
      const finalExtraCapacity = hasExtraReservoir
        ? extraReservoirCapacity
        : "";

      const payload = {
        name,
        description,
        photo_url: photoUrl,
        video_url: videoUrl,
        model: finalModel,
        brand: finalBrand,
        type: finalType,
        status,
        color,
        has_sewage: hasSewage,
        reservoir_count: finalReservoirCount,
        extra_reservoir_capacity: finalExtraCapacity,
        has_steamer: hasSteamer,
        patrimony,
        serial_number: serialNumber,
        environment_recommendation: environmentRecommendation,

        // Se tiver variação, salva a lista. Se não, salva vazio.
        models: hasVariations ? modelsList : [],

        // Salva os dados do pai sempre (servem como default ou fallback)
        voltage,
        water_system,
        amperage,
        dimensions: dimString,
        weight,
        water_tank_size,
        extraction_cups,
        extraction_nozzles,
        drink_combinations,
        dose_autonomy,
        simultaneous_dispenser,
        dregs_capacity,
        tray_count,
        selection_count,
        cups_capacity,
        filter_type,
      };

      if (editingId) {
        const { error } = await supabase
          .from("machines")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        alert("Atualizado!");
      } else {
        const { error } = await supabase.from("machines").insert(payload);
        if (error) throw error;
        alert("Criado!");
      }
      setShowModal(false);
      resetForm();
      fetchMachines();
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // ... (handleDelete e handleOpenConfigs iguais) ...
  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!permissions.canManageMachines) return alert("Sem permissão.");
    if (!confirm("Tem certeza que deseja excluir esta máquina?")) return;

    try {
      const { error } = await supabase.from("machines").delete().eq("id", id);
      if (error) {
        if (error.code === "23503") {
          throw new Error(
            "Não é possível excluir: Esta máquina está vinculada a um Checklist ou Portfólio.",
          );
        }
        throw error;
      }
      alert("Máquina excluída com sucesso.");
      fetchMachines();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  }

  function handleOpenConfigs(machine, e) {
    e.stopPropagation();
    navigate("/machine-configs", { state: { machine } });
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPhotoUrl("");
    setVideoUrl("");
    setModel("");
    setCustomModel("");
    setBrand("");
    setCustomBrand("");
    setType("");
    setCustomType("");
    setHasVariations(false);
    setModelsList([]);
    setEditingModelIndex(null); // Reset
    setVoltage("220v");
    setWaterSystem("Reservatório");
    setAmperage("10A");
    setColor("Preto");
    setHasSteamer("Não");
    setDimensions({ w: "", h: "", d: "" });
    setPatrimony("");
    setSerialNumber("");
    setHasSewage(false);
    setReservoirCount(0);
    setExtraReservoirCapacity("");
    setHasExtraReservoir(true);
    setWaterTankSize("");
    setWeight("");
    setEnvironmentRecommendation("");
    setExtractionCups("");
    setExtractionNozzles("");
    setDrinkCombinations("");
    setDoseAutonomy("");
    setSimultaneousDispenser(false);
    setDregsCapacity("");
    setTrayCount("");
    setSelectionCount("");
    setCupsCapacity("");
    setFilterType("");
  }

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      {/* ... (HEADER e CONTEÚDO IGUAIS - sem alterações) ... */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Catálogo de Máquinas
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie modelos e configurações técnicas.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
              placeholder="Buscar máquina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {permissions.canManageMachines && (
            <button
              onClick={handleNew}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1"
            >
              <Plus size={20} />{" "}
              <span className="hidden md:inline">Nova Máquina</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-10">
          Carregando catálogo...
        </p>
      ) : filteredMachines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 text-center animate-fade-in mx-auto max-w-2xl mt-8">
          <div className="bg-gray-50 p-6 rounded-full mb-4">
            <Coffee size={48} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            Nenhuma máquina encontrada
          </h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-8 text-sm">
            Não encontramos nenhum equipamento.
          </p>
          {permissions.canManageMachines && (
            <button
              onClick={handleNew}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1"
            >
              <Plus size={20} /> Cadastrar Máquina
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMachines.map((machine) => {
            const isMultiModel = machine.models && machine.models.length > 0;
            return (
              <div
                key={machine.id}
                onClick={() => handleEdit(machine)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-1"
              >
                <div className="h-56 bg-gray-50 relative flex items-center justify-center p-6">
                  <div className="absolute inset-0 bg-amiste-primary/0 group-hover:bg-amiste-primary/5 transition-colors duration-300"></div>
                  {machine.photo_url ? (
                    <img
                      src={machine.photo_url}
                      className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-gray-300">
                      <ImageIcon size={48} />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex gap-1">
                    {isMultiModel ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded border bg-purple-50 text-purple-700 border-purple-100 flex items-center gap-1">
                        <Layers size={10} /> +Modelos
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded border ${machine.voltage === "220v" ? "bg-red-50 text-red-700 border-red-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}
                      >
                        {machine.voltage}
                      </span>
                    )}
                  </div>

                  {permissions.canManageMachines && (
                    <button
                      onClick={(e) => handleDelete(machine.id, e)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 z-10"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">
                    {machine.name}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-4">
                    {machine.brand}
                  </p>

                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => handleOpenConfigs(machine, e)}
                      className="w-full py-2 bg-gray-50 hover:bg-amiste-primary hover:text-white text-gray-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Settings size={16} /> Configurações
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {editingId ? (
                  <Edit2 size={20} className="text-amiste-primary" />
                ) : (
                  <Plus size={20} className="text-amiste-primary" />
                )}
                {editingId ? "Editar Máquina" : "Nova Máquina"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
              {/* Identificação */}
              <section className="space-y-4">
                <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
                  <ImageIcon size={14} /> Identificação Principal
                </h3>
                {/* ... Campos de Identificação (Nome, Descrição, Foto Principal, Video Principal, Marca, Tipo) ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ... (Mesmo código de identificação que já existia) ... */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Nome Comercial *
                    </label>
                    <input
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Phedra Evo"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Descrição Comercial (Padrão)
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none h-24 resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">
                      Foto Principal (Padrão)
                    </label>
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200 mb-3 w-full md:w-1/2">
                      <button
                        type="button"
                        onClick={() => setImageMode("url")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md ${imageMode === "url" ? "bg-amiste-primary text-white" : "text-gray-500"}`}
                      >
                        Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode("file")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md ${imageMode === "file" ? "bg-amiste-primary text-white" : "text-gray-500"}`}
                      >
                        Upload
                      </button>
                    </div>
                    <div className="flex gap-3">
                      {imageMode === "url" ? (
                        <input
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="https://..."
                        />
                      ) : (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="w-full p-2 border border-gray-200 rounded-xl text-sm bg-white"
                        />
                      )}
                      {photoUrl && (
                        <div className="w-12 h-12 bg-white border rounded-lg p-1">
                          <img
                            src={photoUrl}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                      <Youtube size={14} /> Link de Vídeo (Padrão)
                    </label>
                    <input
                      className="w-full p-3 border border-gray-200 rounded-xl"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Marca *
                    </label>
                    <select
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {BRAND_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                      <option value="Outro">Outro</option>
                    </select>
                    {brand === "Outro" && (
                      <input
                        className="mt-2 w-full p-2 border rounded-lg"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Categoria *
                    </label>
                    <select
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {TYPE_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                      <option value="Outro">Outro</option>
                    </select>
                    {type === "Outro" && (
                      <input
                        className="mt-2 w-full p-2 border rounded-lg"
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </section>

              <div className="h-px bg-gray-100"></div>

              {/* SELEÇÃO: POSSUI MODELOS? */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-purple-600">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-900 text-sm">
                      Múltiplos Modelos?
                    </h4>
                    <p className="text-xs text-purple-700">
                      Ex: 6 Litros, 15 Litros (Variações do mesmo produto)
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={hasVariations}
                    onChange={(e) => setHasVariations(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* --- MODO MULTI-MODELOS --- */}
              {hasVariations ? (
                <section className="space-y-4 animate-fade-in">
                  <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
                    <Layers size={14} /> Gerenciar Modelos
                  </h3>

                  {/* Lista de Modelos Existentes */}
                  {modelsList.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {modelsList.map((m, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 border rounded-xl ${editingModelIndex === idx ? "bg-purple-50 border-purple-200 ring-1 ring-purple-200" : "bg-gray-50 border-gray-200"}`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Mostra mini foto se tiver */}
                            {m.photo_url && (
                              <img
                                src={m.photo_url}
                                className="w-8 h-8 object-contain rounded bg-white border"
                              />
                            )}
                            <span className="font-bold text-sm text-gray-800">
                              {m.name}
                            </span>
                            {m.voltage && (
                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-100">
                                {m.voltage}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditModel(idx)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeModel(idx)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form para Adicionar/Editar Modelo */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${editingModelIndex !== null ? "bg-purple-50 border-purple-200 ring-2 ring-purple-100" : "bg-gray-50 border-gray-200"}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4
                        className={`text-sm font-bold ${editingModelIndex !== null ? "text-purple-800" : "text-gray-700"}`}
                      >
                        {editingModelIndex !== null
                          ? "Editando Variação"
                          : "Adicionar Variação"}
                      </h4>
                      {editingModelIndex !== null && (
                        <button
                          type="button"
                          onClick={handleCancelEditModel}
                          className="text-xs font-bold text-purple-600 hover:bg-purple-100 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <RotateCcw size={12} /> Cancelar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Básico do Modelo */}
                      <div className="md:col-span-2">
                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">
                          Nome do Modelo
                        </label>
                        <input
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="Ex: 15 Litros"
                          value={tempModel.name}
                          onChange={(e) =>
                            setTempModel({ ...tempModel, name: e.target.value })
                          }
                        />
                      </div>

                      {/* Mídia Específica */}
                      <div>
                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">
                          Foto Específica (URL)
                        </label>
                        <input
                          className="w-full p-2 border rounded-lg text-sm bg-white"
                          placeholder="Deixe vazio para usar a do pai"
                          value={tempModel.photo_url}
                          onChange={(e) =>
                            setTempModel({
                              ...tempModel,
                              photo_url: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">
                          Vídeo Específico (URL)
                        </label>
                        <input
                          className="w-full p-2 border rounded-lg text-sm bg-white"
                          placeholder="Deixe vazio para usar o do pai"
                          value={tempModel.video_url}
                          onChange={(e) =>
                            setTempModel({
                              ...tempModel,
                              video_url: e.target.value,
                            })
                          }
                        />
                      </div>

                      {/* Specs Técnicas */}
                      <div className="h-px bg-gray-200 md:col-span-2 my-2"></div>
                      <p className="md:col-span-2 text-xs text-gray-400 italic">
                        Campos técnicos (Deixe vazio para herdar do Pai)
                      </p>

                      <input
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="Voltagem (Ex: 220v)"
                        value={tempModel.voltage}
                        onChange={(e) =>
                          setTempModel({
                            ...tempModel,
                            voltage: e.target.value,
                          })
                        }
                      />
                      <input
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="Peso (Ex: 5kg)"
                        value={tempModel.weight}
                        onChange={(e) =>
                          setTempModel({ ...tempModel, weight: e.target.value })
                        }
                      />
                      <input
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="Dimensões (LxAxP)"
                        value={tempModel.dimensions}
                        onChange={(e) =>
                          setTempModel({
                            ...tempModel,
                            dimensions: e.target.value,
                          })
                        }
                      />

                      {/* Campos Condicionais */}
                      {(type === "Coado" || type === "Moedor") && (
                        <input
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder={
                            type === "Moedor"
                              ? "Capacidade Cúpula"
                              : "Capacidade (Xícaras)"
                          }
                          value={tempModel.cups_capacity}
                          onChange={(e) =>
                            setTempModel({
                              ...tempModel,
                              cups_capacity: e.target.value,
                            })
                          }
                        />
                      )}
                      {type === "Coado" && (
                        <input
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="Tipo de Filtro"
                          value={tempModel.filter_type}
                          onChange={(e) =>
                            setTempModel({
                              ...tempModel,
                              filter_type: e.target.value,
                            })
                          }
                        />
                      )}
                      {type === "Café em Grãos" && (
                        <input
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="Capacidade Borras"
                          value={tempModel.dregs_capacity}
                          onChange={(e) =>
                            setTempModel({
                              ...tempModel,
                              dregs_capacity: e.target.value,
                            })
                          }
                        />
                      )}
                      {type !== "Coado" && type !== "Moedor" && (
                        <input
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="Tanque de Água (Litros)"
                          value={tempModel.water_tank_size}
                          onChange={(e) =>
                            setTempModel({
                              ...tempModel,
                              water_tank_size: e.target.value,
                            })
                          }
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveModel}
                      className={`mt-4 w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 text-white ${editingModelIndex !== null ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                      {editingModelIndex !== null ? (
                        <>
                          <Save size={16} /> Salvar Alterações
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Adicionar à Lista
                        </>
                      )}
                    </button>
                  </div>
                </section>
              ) : (
                // --- MODO ÚNICO (PADRÃO - Exibe todos os inputs normais) ---
                <section className="space-y-4 animate-fade-in">
                  <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
                    <Zap size={14} /> Especificações Técnicas (Padrão)
                  </h3>
                  {/* ... (AQUI VAI AQUELE BLOCO GIGANTE DE INPUTS TÉCNICOS QUE JÁ TINHAMOS) ... */}
                  {/* Vou omitir aqui para economizar espaço na resposta, mas você mantém o bloco 'else' do código anterior, com Weight, Voltage, etc */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-1">
                        <Scale size={12} /> Peso (kg)
                      </label>
                      <input
                        className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white"
                        placeholder="Ex: 35 kg"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-1">
                        <MapPin size={12} /> Indicação de Ambiente
                      </label>
                      <input
                        className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white"
                        placeholder="Ex: Escritórios..."
                        value={environmentRecommendation}
                        onChange={(e) =>
                          setEnvironmentRecommendation(e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* ... ABASTECIMENTO ... */}
                  {type !== "Coado" && type !== "Moedor" && (
                    <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                          <Droplet size={12} className="inline" /> Abastecimento
                        </label>
                        <div className="flex gap-2">
                          {["Reservatório", "Rede Hídrica"].map((opt) => (
                            <label
                              key={opt}
                              className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-bold border transition-all ${waterSystem === opt ? "bg-blue-500 text-white border-blue-500" : "bg-white border-gray-200 text-gray-500"}`}
                            >
                              <input
                                type="radio"
                                className="hidden"
                                checked={waterSystem === opt}
                                onChange={() => setWaterSystem(opt)}
                              />
                              {opt === "Reservatório" ? "Tanque" : "Rede"}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                          Rede de Esgoto
                        </label>
                        <div className="flex gap-2">
                          <label
                            className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-bold border transition-all ${hasSewage ? "bg-green-500 text-white border-green-500" : "bg-white border-gray-200 text-gray-500"}`}
                          >
                            <input
                              type="radio"
                              className="hidden"
                              checked={hasSewage}
                              onChange={() => setHasSewage(true)}
                            />{" "}
                            Sim
                          </label>
                          <label
                            className={`cursor-pointer px-3 py-2 rounded-lg text-xs font-bold border transition-all ${!hasSewage ? "bg-gray-500 text-white border-gray-500" : "bg-white border-gray-200 text-gray-500"}`}
                          >
                            <input
                              type="radio"
                              className="hidden"
                              checked={!hasSewage}
                              onChange={() => setHasSewage(false)}
                            />{" "}
                            Não
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ... TANQUE ... */}
                  {type !== "Coado" &&
                    type !== "Moedor" &&
                    waterSystem === "Reservatório" && (
                      <div className="animate-fade-in bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-xs font-bold text-blue-800 uppercase mb-1">
                          Tamanho do Tanque de Água
                        </label>
                        <input
                          className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white"
                          placeholder="Ex: 4 Litros"
                          value={waterTankSize}
                          onChange={(e) => setWaterTankSize(e.target.value)}
                        />
                      </div>
                    )}

                  {/* ... TIPO PROFISSIONAL ... */}
                  {type === "Profissional" && (
                    <div className="animate-fade-in bg-purple-50 p-4 rounded-xl border border-purple-100 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-purple-800 uppercase mb-1">
                          Copos de Extração
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border border-purple-200 rounded-lg text-sm bg-white"
                          placeholder="Ex: 2"
                          value={extractionCups}
                          onChange={(e) => setExtractionCups(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-purple-800 uppercase mb-1">
                          Bicos de Extração
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border border-purple-200 rounded-lg text-sm bg-white"
                          placeholder="Ex: 1"
                          value={extractionNozzles}
                          onChange={(e) => setExtractionNozzles(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* ... TIPO MULTIBEBIDAS ... */}
                  {type === "Multibebidas" && (
                    <div className="animate-fade-in bg-indigo-50 p-4 rounded-xl border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-indigo-800 uppercase mb-1">
                          Variedade (Combinações)
                        </label>
                        <input
                          className="w-full p-2 border border-indigo-200 rounded-lg text-sm bg-white"
                          placeholder="Ex: 8 opções"
                          value={drinkCombinations}
                          onChange={(e) => setDrinkCombinations(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-indigo-800 uppercase mb-1">
                          Autonomia de Doses
                        </label>
                        <input
                          className="w-full p-2 border border-indigo-200 rounded-lg text-sm bg-white"
                          placeholder="Ex: 50 doses/dia"
                          value={doseAutonomy}
                          onChange={(e) => setDoseAutonomy(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* ... TIPO SNACKS ... */}
                  {(type === "Snacks" || type === "Vending") && (
                    <div className="animate-fade-in bg-pink-50 p-4 rounded-xl border border-pink-100 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-pink-800 uppercase mb-1">
                          Número de Bandejas
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border border-pink-200 rounded-lg text-sm bg-white"
                          placeholder="Ex: 6"
                          value={trayCount}
                          onChange={(e) => setTrayCount(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-pink-800 uppercase mb-1">
                          Número de Seleções
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border border-pink-200 rounded-lg text-sm bg-white"
                          placeholder="Ex: 32"
                          value={selectionCount}
                          onChange={(e) => setSelectionCount(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* ... TIPO GRÃOS ... */}
                  {type === "Café em Grãos" && (
                    <div className="animate-fade-in bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 border-gray-300"
                          checked={simultaneousDispenser}
                          onChange={(e) =>
                            setSimultaneousDispenser(e.target.checked)
                          }
                        />
                        <span className="text-sm font-bold text-amber-900">
                          Dispensador Simultâneo (2 cafés ao mesmo tempo)
                        </span>
                      </label>
                      <div>
                        <label className="block text-xs font-bold text-amber-800 uppercase mb-1 flex items-center gap-1">
                          <Trash size={12} /> Capacidade de Borras
                        </label>
                        <input
                          className="w-full p-2 border border-amber-200 rounded-lg text-sm bg-white"
                          placeholder="Ex: 15 borras / 1kg"
                          value={dregsCapacity}
                          onChange={(e) => setDregsCapacity(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* ... TIPO COADO ... */}
                  {type === "Coado" && (
                    <div className="animate-fade-in bg-orange-50 p-4 rounded-xl border border-orange-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-orange-800 uppercase mb-1 flex items-center gap-1">
                          <Clock size={12} /> Capacidade (Xícaras)
                        </label>
                        <input
                          className="w-full p-2 border border-orange-200 rounded-lg text-sm bg-white"
                          placeholder="Ex: 100/hora"
                          value={cupsCapacity}
                          onChange={(e) => setCupsCapacity(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-orange-800 uppercase mb-1 flex items-center gap-1">
                          <Filter size={12} /> Tipo de Filtro
                        </label>
                        <input
                          className="w-full p-2 border border-orange-200 rounded-lg text-sm bg-white"
                          placeholder="Ex: Papel, Metal..."
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* ... RESERVATÓRIOS ... */}
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    {type === "Moedor" ? (
                      <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-orange-800 uppercase flex items-center gap-1">
                            <Database size={12} /> Capacidade da Cúpula (Grãos)
                          </label>
                        </div>
                        <input
                          className="w-full p-2 border border-orange-200 rounded-lg text-sm"
                          placeholder="Ex: 1.5kg"
                          value={extraReservoirCapacity}
                          onChange={(e) =>
                            setExtraReservoirCapacity(e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-orange-800 uppercase flex items-center gap-1">
                            <Database size={12} /> Reservatórios de Insumos
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-amiste-primary rounded"
                              checked={!hasExtraReservoir}
                              onChange={(e) =>
                                setHasExtraReservoir(!e.target.checked)
                              }
                            />
                            <span className="text-xs text-orange-700 font-medium">
                              Não possui reservatórios extras
                            </span>
                          </label>
                        </div>

                        {hasExtraReservoir && (
                          <div className="animate-fade-in space-y-3">
                            <div>
                              <label className="block text-[10px] text-orange-600 font-bold mb-1">
                                Quantidade de Reservatórios
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                className="w-full p-2 border border-orange-200 rounded-lg text-sm"
                                placeholder="Quantidade (ex: 3)"
                                value={reservoirCount}
                                onChange={(e) =>
                                  setReservoirCount(e.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-orange-600 font-bold mb-1">
                                Capacidade por Reservatório
                              </label>
                              <input
                                className="w-full p-2 border border-orange-200 rounded-lg text-sm"
                                placeholder="Ex: 1kg ou 500g"
                                value={extraReservoirCapacity}
                                onChange={(e) =>
                                  setExtraReservoirCapacity(e.target.value)
                                }
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* ... VOLTAGEM, AMPERAGEM, DIMENSÕES ... */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Voltagem
                      </label>
                      <select
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                        value={voltage}
                        onChange={(e) => setVoltage(e.target.value)}
                      >
                        <option>220v</option>
                        <option>110v</option>
                        <option>Bivolt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Amperagem
                      </label>
                      <div className="flex gap-2 mt-2">
                        {["10A", "20A"].map((opt) => (
                          <label
                            key={opt}
                            className={`flex-1 text-center cursor-pointer py-2 rounded-lg text-sm font-bold border transition-all ${amperage === opt ? "bg-amiste-primary text-white border-amiste-primary" : "bg-white border-gray-200 text-gray-600"}`}
                          >
                            <input
                              type="radio"
                              name="amp"
                              value={opt}
                              checked={amperage === opt}
                              onChange={() => setAmperage(opt)}
                              className="hidden"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Dimensões (LxAxP)
                      </label>
                      <div className="flex gap-1">
                        <input
                          placeholder="L"
                          className="w-1/3 p-2 border rounded-lg text-center"
                          value={dimensions.w}
                          onChange={(e) =>
                            setDimensions({ ...dimensions, w: e.target.value })
                          }
                        />
                        <input
                          placeholder="A"
                          className="w-1/3 p-2 border rounded-lg text-center"
                          value={dimensions.h}
                          onChange={(e) =>
                            setDimensions({ ...dimensions, h: e.target.value })
                          }
                        />
                        <input
                          placeholder="P"
                          className="w-1/3 p-2 border rounded-lg text-center"
                          value={dimensions.d}
                          onChange={(e) =>
                            setDimensions({ ...dimensions, d: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* ... SERIE E PATRIMONIO ... */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Nº Série
                      </label>
                      <div className="relative">
                        <Barcode
                          size={16}
                          className="absolute left-3 top-3.5 text-gray-400"
                        />
                        <input
                          className="w-full pl-9 p-3 border border-gray-200 rounded-xl"
                          value={serialNumber}
                          onChange={(e) => setSerialNumber(e.target.value)}
                          placeholder="ABC-123"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Patrimônio
                      </label>
                      <input
                        className="w-full p-3 border border-gray-200 rounded-xl"
                        value={patrimony}
                        onChange={handlePatrimonyChange}
                        placeholder="Só números"
                      />
                    </div>
                  </div>
                </section>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-8 py-3 bg-amiste-primary hover:bg-amiste-secondary text-white rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={20} />{" "}
                  {loading ? "Salvando..." : "Salvar Máquina"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
