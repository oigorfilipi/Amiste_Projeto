import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient"; // Importando Supabase
import { Plus, Search, Upload, Save, X, Trash2 } from "lucide-react";

export function Machines() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [machines, setMachines] = useState([]); // Lista de máquinas do banco

  // Estados do Formulário (Dados Básicos)
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("Disponível");
  const [photo, setPhoto] = useState(null);

  // Estados para campos "Outro"
  const [customModel, setCustomModel] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [customType, setCustomType] = useState("");

  // Estados do Formulário (Dados Técnicos)
  const [voltage, setVoltage] = useState("220v");
  const [waterSystem, setWaterSystem] = useState("Reservatório");
  const [amperage, setAmperage] = useState("10A");
  const [color, setColor] = useState("Preto");
  const [reservoirs, setReservoirs] = useState("");
  const [hasSteamer, setHasSteamer] = useState("Não");

  // Opcionais
  const [dimensions, setDimensions] = useState({ w: "", h: "", d: "" });
  const [patrimony, setPatrimony] = useState("");

  // 1. CARREGAR MÁQUINAS AO ABRIR A TELA
  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    const { data, error } = await supabase
      .from("machines")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setMachines(data);
    if (error) console.log("Erro ao buscar máquinas:", error);
  }

  // 2. FUNÇÃO DE SALVAR (UPLOAD + INSERT)
  // 2. FUNÇÃO DE SALVAR (UPLOAD + INSERT)
  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // A. Validação Básica
      if (!name || !photo || !model || !brand || !type) {
        alert("Preencha todos os campos obrigatórios e a foto!");
        setLoading(false);
        return;
      }

      // B. Upload da Foto
      const fileExt = photo.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // MUDANÇA: Removemos o 'uploadData' que não estava sendo usado
      const { error: uploadError } = await supabase.storage
        .from("machines")
        .upload(fileName, photo);

      if (uploadError) throw uploadError;

      // C. Pegar URL Pública da Foto
      const { data } = supabase.storage.from("machines").getPublicUrl(fileName);

      // D. Preparar os dados
      const finalModel = model === "Outro" ? customModel : model;
      const finalBrand = brand === "Outro" ? customBrand : brand;
      const finalType = type === "Outro" ? customType : type;
      const dimString = `${dimensions.w}x${dimensions.h}x${dimensions.d}`;

      // E. Salvar no Banco
      const { error: insertError } = await supabase.from("machines").insert({
        name,
        photo_url: data.publicUrl, // MUDANÇA: Usando data.publicUrl direto para evitar confusão
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
      });

      if (insertError) throw insertError;

      alert("Máquina cadastrada com sucesso!");
      setShowForm(false);
      resetForm();
      fetchMachines();
    } catch (err) {
      // MUDANÇA: Renomeei para 'err' para não confundir
      console.error(err);
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // 3. FUNÇÃO DE EXCLUIR MÁQUINA
  // 3. FUNÇÃO DE EXCLUIR MÁQUINA
  async function handleDelete(id) {
    // Tirei o photoUrl daqui
    if (!confirm("Tem certeza que deseja excluir esta máquina?")) return;

    try {
      // Excluir do Banco
      const { error } = await supabase.from("machines").delete().eq("id", id);
      if (error) throw error;

      fetchMachines(); // Atualiza lista
    } catch (err) {
      // Mudei o nome para 'err' para não dar conflito
      console.error(err);
      alert("Erro ao excluir");
    }
  }

  function resetForm() {
    setName("");
    setPhoto(null);
    setModel("");
    setBrand("");
    setType("");
    setCustomModel("");
    setCustomBrand("");
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

  return (
    <div className="min-h-screen">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Catálogo de Máquinas
          </h1>
          <p className="text-gray-500">
            Gerencie os modelos disponíveis para instalação e contratos.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Cadastrar Nova Máquina
          </button>
        )}
      </div>

      {/* FORMULÁRIO */}
      {showForm ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
          <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-amiste-primary flex items-center gap-2">
              <Plus size={20} /> Novo Modelo
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-red-500"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
            {/* 1. DADOS BÁSICOS */}
            <div className="space-y-6">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100 pb-2">
                1. Dados Básicos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-amiste-primary outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto da Máquina (PNG) *
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setPhoto(e.target.files[0])}
                    />
                    <Upload className="text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-500">
                      {photo ? (
                        <span className="text-amiste-primary font-bold">
                          {photo.name}
                        </span>
                      ) : (
                        "Clique para selecionar"
                      )}
                    </p>
                  </div>
                </div>

                {/* Modelo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo Técnico *
                  </label>
                  <select
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Iper Automática">Iper Automática</option>
                    <option value="Kalerm 1602">Kalerm 1602</option>
                    <option value="Kalerm 1603">Kalerm 1603</option>
                    <option value="Insta 500">Insta 500</option>
                    <option value="Outro">Outro (Digitar)</option>
                  </select>
                  {model === "Outro" && (
                    <input
                      type="text"
                      placeholder="Digite o modelo..."
                      className="mt-2 w-full p-2 bg-gray-50 border rounded-lg"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                    />
                  )}
                </div>

                {/* Marca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <select
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Saeco">Saeco</option>
                    <option value="Gaggia">Gaggia</option>
                    <option value="Rheavendors">Rheavendors</option>
                    <option value="Outro">Outro (Digitar)</option>
                  </select>
                  {brand === "Outro" && (
                    <input
                      type="text"
                      placeholder="Digite a marca..."
                      className="mt-2 w-full p-2 bg-gray-50 border rounded-lg"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                    />
                  )}
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Multibebidas">Multibebidas</option>
                    <option value="Grãos">Café em Grãos</option>
                    <option value="Profissional">Profissional</option>
                    <option value="Outro">Outro (Digitar)</option>
                  </select>
                  {type === "Outro" && (
                    <input
                      type="text"
                      placeholder="Digite o tipo..."
                      className="mt-2 w-full p-2 bg-gray-50 border rounded-lg"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                    />
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Alocada">Alocada</option>
                    <option value="Manutenção">Manutenção</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. DADOS TÉCNICOS */}
            <div className="space-y-6">
              <h3 className="text-sm uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100 pb-2">
                2. Especificações Técnicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voltagem
                  </label>
                  <select
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                  >
                    <option value="110v">110v</option>
                    <option value="220v">220v</option>
                    <option value="Bivolt">Bivolt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tomada
                  </label>
                  <div className="flex gap-4 mt-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="amp"
                        value="10A"
                        checked={amperage === "10A"}
                        onChange={(e) => setAmperage(e.target.value)}
                      />{" "}
                      10A
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="amp"
                        value="20A"
                        checked={amperage === "20A"}
                        onChange={(e) => setAmperage(e.target.value)}
                      />{" "}
                      20A
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abastecimento
                  </label>
                  <select
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                    value={waterSystem}
                    onChange={(e) => setWaterSystem(e.target.value)}
                  >
                    <option value="Reservatório">Reservatório Interno</option>
                    <option value="Rede Hídrica">Rede Hídrica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <select
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  >
                    <option value="Preto">Preto</option>
                    <option value="Prata">Prata</option>
                    <option value="Branco">Branco</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reservatórios (Qtd)
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                    value={reservoirs}
                    onChange={(e) => setReservoirs(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bico Vapor?
                  </label>
                  <div className="flex gap-4 mt-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="vap"
                        value="Sim"
                        checked={hasSteamer === "Sim"}
                        onChange={(e) => setHasSteamer(e.target.value)}
                      />{" "}
                      Sim
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="vap"
                        value="Não"
                        checked={hasSteamer === "Não"}
                        onChange={(e) => setHasSteamer(e.target.value)}
                      />{" "}
                      Não
                    </label>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensões (LxAxP)
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Larg"
                      className="w-1/3 p-3 bg-white border border-gray-200 rounded-lg"
                      value={dimensions.w}
                      onChange={(e) =>
                        setDimensions({ ...dimensions, w: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Alt"
                      className="w-1/3 p-3 bg-white border border-gray-200 rounded-lg"
                      value={dimensions.h}
                      onChange={(e) =>
                        setDimensions({ ...dimensions, h: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Prof"
                      className="w-1/3 p-3 bg-white border border-gray-200 rounded-lg"
                      value={dimensions.d}
                      onChange={(e) =>
                        setDimensions({ ...dimensions, d: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patrimônio / Série (Opcional)
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                    value={patrimony}
                    onChange={(e) => setPatrimony(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-amiste-primary hover:bg-amiste-secondary text-white rounded-lg transition-colors font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Save size={20} />
                {loading ? "Salvando..." : "Salvar Máquina"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* LISTA DE MÁQUINAS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {machines.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} />
              </div>
              <p>Nenhuma máquina cadastrada ainda.</p>
            </div>
          )}

          {machines.map((machine) => (
            <div
              key={machine.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-300 relative"
            >
              {/* Botão de Excluir (Só aparece no hover) */}
              <button
                onClick={() => handleDelete(machine.id)}
                className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>

              <div className="h-48 bg-white p-4 flex items-center justify-center relative overflow-hidden border-b border-gray-50">
                <img
                  src={machine.photo_url}
                  alt={machine.name}
                  className="h-full w-auto object-contain hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase text-amiste-primary bg-red-50 px-2 py-1 rounded">
                    {machine.type}
                  </span>
                  <span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded">
                    {machine.voltage}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-1 leading-tight">
                  {machine.name}
                </h3>
                <p className="text-sm text-gray-500 mb-1">
                  {machine.brand} / {machine.model}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
