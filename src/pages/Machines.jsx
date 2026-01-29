import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
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
} from "lucide-react";

// --- CONSTANTES ---
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

  // Imagem (URL ou Upload)
  const [photoUrl, setPhotoUrl] = useState("");
  const [imageMode, setImageMode] = useState("url"); // 'url' ou 'file'

  // Técnicos
  const [voltage, setVoltage] = useState("220v");
  const [waterSystem, setWaterSystem] = useState("Reservatório");
  const [amperage, setAmperage] = useState("10A");
  const [color, setColor] = useState("Preto");
  const [reservoirs, setReservoirs] = useState("");
  const [hasSteamer, setHasSteamer] = useState("Não");
  const [dimensions, setDimensions] = useState({ w: "", h: "", d: "" });
  const [patrimony, setPatrimony] = useState("");

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

  // --- UPLOAD DE IMAGEM ---
  async function handleImageUpload(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `machines/${Math.random()}.${fileExt}`; // Pasta machines/ dentro do bucket images

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      setPhotoUrl(data.publicUrl);
      alert("Imagem enviada com sucesso!");
    } catch (error) {
      alert("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  function handleEdit(machine) {
    if (!permissions.canManageMachines)
      return alert("Sem permissão para editar.");

    setEditingId(machine.id);
    setName(machine.name);
    setPhotoUrl(machine.photo_url || "");
    setStatus(machine.status || "Disponível");
    setImageMode(machine.photo_url?.includes("supabase") ? "file" : "url");

    // Lógica Dropdown vs Custom
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
    setReservoirs(machine.reservoirs || "");
    setHasSteamer(machine.has_steamer || "Não");
    setPatrimony(machine.patrimony || "");

    if (machine.dimensions) {
      const dims = machine.dimensions.split("x");
      setDimensions({ w: dims[0] || "", h: dims[1] || "", d: dims[2] || "" });
    } else {
      setDimensions({ w: "", h: "", d: "" });
    }

    setShowModal(true);
  }

  function handleNew() {
    if (!permissions.canManageMachines)
      return alert("Sem permissão para criar.");
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
        reservoirs,
        has_steamer: hasSteamer,
        dimensions: dimString,
        patrimony,
      };

      if (editingId) {
        const { error } = await supabase
          .from("machines")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        alert("Máquina atualizada!");
      } else {
        const { error } = await supabase.from("machines").insert(payload);
        if (error) throw error;
        alert("Máquina cadastrada!");
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
    if (!permissions.canManageMachines) return alert("Sem permissão.");
    if (!confirm("Tem certeza que deseja excluir esta máquina?")) return;

    try {
      const { error } = await supabase.from("machines").delete().eq("id", id);
      if (error) throw error;
      fetchMachines();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
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
    setReservoirs("");
    setHasSteamer("Não");
    setDimensions({ w: "", h: "", d: "" });
    setPatrimony("");
  }

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Catálogo de Máquinas
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie os modelos disponíveis para instalação.
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

      {/* GRID DE CARDS */}
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

              <div className="mt-auto flex gap-2">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Zap size={12} /> {machine.amperage}
                </span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Droplet size={12} />{" "}
                  {machine.water_system === "Rede Hídrica" ? "Rede" : "Tanque"}
                </span>
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

      {/* --- MODAL DE FORMULÁRIO --- */}
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
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
              {/* 1. DADOS BÁSICOS */}
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
                      placeholder="Ex: Phedra Evo Espresso"
                    />
                  </div>

                  {/* SELEÇÃO DE IMAGEM */}
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">
                      Foto da Máquina
                    </label>

                    <div className="flex bg-white rounded-lg p-1 border border-gray-200 mb-3 w-full md:w-1/2">
                      <button
                        type="button"
                        onClick={() => setImageMode("url")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 ${imageMode === "url" ? "bg-amiste-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                      >
                        <LinkIcon size={12} /> Link (URL)
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode("file")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 ${imageMode === "file" ? "bg-amiste-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                      >
                        <Upload size={12} /> Upload (Arquivo)
                      </button>
                    </div>

                    <div className="flex gap-3">
                      {imageMode === "url" ? (
                        <input
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amiste-primary outline-none"
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="https://exemplo.com/foto.png"
                        />
                      ) : (
                        <div className="relative w-full">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="w-full p-2 border border-gray-200 rounded-xl text-sm bg-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {uploading && (
                            <div className="absolute right-3 top-2.5 text-xs text-blue-600 font-bold animate-pulse">
                              Enviando...
                            </div>
                          )}
                        </div>
                      )}
                      {photoUrl && (
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 p-1">
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
                        className="mt-2 w-full p-2 border rounded-lg bg-gray-50 text-sm"
                        placeholder="Digite a marca..."
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
                        className="mt-2 w-full p-2 border rounded-lg bg-gray-50 text-sm"
                        placeholder="Digite o tipo..."
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </section>

              <div className="h-px bg-gray-100"></div>

              {/* 2. DADOS TÉCNICOS */}
              <section className="space-y-4">
                <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
                  <Zap size={14} /> Especificações Técnicas
                </h3>

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
                      Água
                    </label>
                    <select
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                      value={waterSystem}
                      onChange={(e) => setWaterSystem(e.target.value)}
                    >
                      <option value="Reservatório">Reservatório</option>
                      <option value="Rede Hídrica">Rede Hídrica</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      <Ruler size={12} className="inline mr-1" /> Dimensões
                      (LxAxP)
                    </label>
                    <div className="flex gap-2">
                      <input
                        placeholder="L"
                        className="w-1/3 p-3 border border-gray-200 rounded-xl text-center"
                        value={dimensions.w}
                        onChange={(e) =>
                          setDimensions({ ...dimensions, w: e.target.value })
                        }
                      />
                      <input
                        placeholder="A"
                        className="w-1/3 p-3 border border-gray-200 rounded-xl text-center"
                        value={dimensions.h}
                        onChange={(e) =>
                          setDimensions({ ...dimensions, h: e.target.value })
                        }
                      />
                      <input
                        placeholder="P"
                        className="w-1/3 p-3 border border-gray-200 rounded-xl text-center"
                        value={dimensions.d}
                        onChange={(e) =>
                          setDimensions({ ...dimensions, d: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Patrimônio / Série
                    </label>
                    <input
                      className="w-full p-3 border border-gray-200 rounded-xl"
                      value={patrimony}
                      onChange={(e) => setPatrimony(e.target.value)}
                      placeholder="Opcional"
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
