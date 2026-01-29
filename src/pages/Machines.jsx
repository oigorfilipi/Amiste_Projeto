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
  Edit2,
  Zap,
  Droplet,
  Ruler,
  Image as ImageIcon,
  Link as LinkIcon,
  Barcode,
  Settings,
  Database,
} from "lucide-react";

const MODEL_OPTIONS = [
  "Iper Automática",
  "Kalerm 1602",
  "Kalerm 1603",
  "Insta 500",
  "Insta 42",
];
const BRAND_OPTIONS = ["Saeco", "Gaggia", "Rheavendors", "Kalerm", "Spidem"];
const TYPE_OPTIONS = [
  "Multibebidas",
  "Café em Grãos",
  "Profissional",
  "Vending",
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

  // --- FORMULÁRIO ---
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [type, setType] = useState("");
  const [customType, setCustomType] = useState("");
  const [status, setStatus] = useState("Disponível");
  const [photoUrl, setPhotoUrl] = useState("");
  const [imageMode, setImageMode] = useState("url");

  // Técnicos
  const [voltage, setVoltage] = useState("220v");
  const [waterSystem, setWaterSystem] = useState("Reservatório");
  const [amperage, setAmperage] = useState("10A");
  const [color, setColor] = useState("Preto");

  // NOVOS CAMPOS TÉCNICOS
  const [hasSewage, setHasSewage] = useState(false); // Esgoto
  const [hasExtraReservoir, setHasExtraReservoir] = useState(true); // Controle visual
  const [reservoirCount, setReservoirCount] = useState(0); // Quantidade numérica

  const [hasSteamer, setHasSteamer] = useState("Não");
  const [dimensions, setDimensions] = useState({ w: "", h: "", d: "" });
  const [patrimony, setPatrimony] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

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

  function handleEdit(machine) {
    if (!permissions.canManageMachines) return alert("Sem permissão.");
    setEditingId(machine.id);
    setName(machine.name);
    setPhotoUrl(machine.photo_url || "");
    setStatus(machine.status || "Disponível");
    setImageMode(machine.photo_url?.includes("supabase") ? "file" : "url");
    setPatrimony(machine.patrimony || "");
    setSerialNumber(machine.serial_number || "");

    // Dropdowns
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

    setVoltage(machine.voltage || "220v");
    setWaterSystem(machine.water_system || "Reservatório");
    setAmperage(machine.amperage || "10A");
    setColor(machine.color || "Preto");
    setHasSteamer(machine.has_steamer || "Não");

    // Novos Campos
    setHasSewage(machine.has_sewage || false);
    setReservoirCount(machine.reservoir_count || 0);
    setHasExtraReservoir((machine.reservoir_count || 0) > 0);

    if (machine.dimensions) {
      const dims = machine.dimensions.split("x");
      setDimensions({ w: dims[0] || "", h: dims[1] || "", d: dims[2] || "" });
    } else {
      setDimensions({ w: "", h: "", d: "" });
    }
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

      // Lógica Reservatório: Se marcou "Não tem", salva 0
      const finalReservoirCount = hasExtraReservoir
        ? parseInt(reservoirCount)
        : 0;

      const payload = {
        name,
        photo_url: photoUrl,
        model: finalModel,
        brand: finalBrand,
        type: finalType,
        status,
        voltage,
        water_system: waterSystem,
        amperage,
        color,
        has_sewage: hasSewage, // Novo
        reservoir_count: finalReservoirCount, // Novo
        has_steamer: hasSteamer,
        dimensions: dimString,
        patrimony,
        serial_number: serialNumber,
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

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!permissions.canManageMachines) return;
    if (!confirm("Excluir máquina?")) return;
    await supabase.from("machines").delete().eq("id", id);
    fetchMachines();
  }

  // Navegar para Configurações (Passando a máquina inteira via state)
  function handleOpenConfigs(machine, e) {
    e.stopPropagation();
    navigate("/machine-configs", { state: { machine } });
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setPhotoUrl("");
    setModel("");
    setCustomModel("");
    setBrand("");
    setCustomBrand("");
    setType("");
    setCustomType("");
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
    setHasExtraReservoir(true);
  }

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      {/* HEADER */}
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

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMachines.map((machine) => (
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
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded border ${machine.voltage === "220v" ? "bg-red-50 text-red-700 border-red-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}
                >
                  {machine.voltage}
                </span>
              </div>

              {permissions.canManageMachines && (
                <button
                  onClick={(e) => handleDelete(machine.id, e)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
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
                {/* SÓ MOSTRA SE TIVER PERMISSÃO DE CONFIGURAR */}
                {permissions.canConfigureMachines && (
                  <button
                    onClick={(e) => handleOpenConfigs(machine, e)}
                    className="w-full py-2 bg-gray-50 hover:bg-amiste-primary hover:text-white text-gray-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Settings size={16} /> Configurações
                  </button>
                )}

                {/* Se não tiver permissão, pode mostrar outra coisa ou nada */}
                {!permissions.canConfigureMachines && (
                  <div className="text-center py-2 text-xs text-gray-400 font-medium bg-gray-50 rounded-lg">
                    Apenas visualização
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-center text-gray-400 py-10">
          Carregando catálogo...
        </p>
      )}

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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
              {/* Identificação e Imagem (Mantido igual) */}
              <section className="space-y-4">
                <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
                  <ImageIcon size={14} /> Identificação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">
                      Foto
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
                        <div className="relative w-full">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="w-full p-2 border border-gray-200 rounded-xl text-sm bg-white"
                          />
                          {uploading && (
                            <div className="absolute right-3 top-2.5 text-xs text-blue-600 font-bold animate-pulse">
                              Enviando...
                            </div>
                          )}
                        </div>
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
                        placeholder="Marca..."
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
                        placeholder="Tipo..."
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </section>

              <div className="h-px bg-gray-100"></div>

              {/* 2. DADOS TÉCNICOS ATUALIZADOS */}
              <section className="space-y-4">
                <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
                  <Zap size={14} /> Especificações Técnicas
                </h3>

                {/* Hidráulica e Esgoto */}
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

                {/* Reservatórios (Solúveis/Grãos) */}
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
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
                    <div className="animate-fade-in">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="w-full p-2 border border-orange-200 rounded-lg text-sm"
                        placeholder="Quantidade (ex: 3)"
                        value={reservoirCount}
                        onChange={(e) => setReservoirCount(e.target.value)}
                      />
                      <p className="text-[10px] text-orange-600 mt-1">
                        Informe quantos espaços para pó/grão a máquina tem.
                      </p>
                    </div>
                  )}
                </div>

                {/* Outros */}
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
