import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  Settings,
  Save,
  Trash2,
  Edit2,
  X,
  Database,
  Coffee,
  Layers,
} from "lucide-react";

export function MachineConfigs() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Dados da máquina vindo da tela anterior
  const machineData = location.state?.machine;

  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Controle de Modelo/Variação
  const [selectedModelIndex, setSelectedModelIndex] = useState("");
  // Estado derivado para saber quantos reservatórios usar
  const [currentReservoirCount, setCurrentReservoirCount] = useState(0);

  // Form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productMap, setProductMap] = useState({});

  useEffect(() => {
    // PROTEÇÃO: Se não tiver dados da máquina, volta para o catálogo e para a execução
    if (!machineData) {
      navigate("/machines");
      return;
    }

    fetchConfigs();

    // Inicializa a contagem de reservatórios com segurança (?)
    setCurrentReservoirCount(machineData?.reservoir_count || 0);
  }, [machineData, navigate]);

  // Efeito para atualizar a contagem quando troca o modelo
  useEffect(() => {
    if (!machineData) return; // Proteção extra

    if (
      selectedModelIndex !== "" &&
      machineData.models &&
      machineData.models[selectedModelIndex]
    ) {
      const model = machineData.models[selectedModelIndex];
      setCurrentReservoirCount(
        model.reservoir_count || machineData.reservoir_count || 0,
      );
    } else {
      setCurrentReservoirCount(machineData.reservoir_count || 0);
    }
  }, [selectedModelIndex, machineData]);

  async function fetchConfigs() {
    if (!machineData?.id) return;

    try {
      const { data, error } = await supabase
        .from("machine_configs")
        .select("*")
        .eq("machine_id", machineData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (err) {
      toast.error("Erro ao buscar configurações.");
    } finally {
      setLoading(false);
    }
  }

  function handleProductChange(index, value) {
    setProductMap((prev) => ({
      ...prev,
      [index]: value,
    }));
  }

  function handleNew() {
    setEditingId(null);
    let initialName = "";
    if (selectedModelIndex !== "" && machineData?.models) {
      initialName = `${machineData.models[selectedModelIndex].name} - `;
    }

    setName(initialName);
    setDescription("");
    setProductMap({});
    setShowModal(true);
  }

  function handleEdit(config) {
    setEditingId(config.id);
    setName(config.name);
    setDescription(config.description || "");
    setProductMap(config.product_map || {});
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!machineData?.id) return;

    try {
      const payload = {
        machine_id: machineData.id,
        user_id: user.id,
        name,
        description,
        product_map: productMap,
      };

      if (editingId) {
        const { error } = await supabase
          .from("machine_configs")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Configuração atualizada!");
      } else {
        const { error } = await supabase
          .from("machine_configs")
          .insert(payload);
        if (error) throw error;
        toast.success("Configuração criada!");
      }
      setShowModal(false);
      fetchConfigs();
    } catch (err) {
      toast.error("Erro: " + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Excluir esta configuração?")) return;
    try {
      const { error } = await supabase
        .from("machine_configs")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Configuração excluída.");
      fetchConfigs();
    } catch (err) {
      toast.error("Erro ao excluir: " + err.message);
    }
  }

  // Gera array com segurança
  const reservoirs = Array.from(
    { length: parseInt(currentReservoirCount) || 0 },
    (_, i) => i + 1,
  );

  // Se não tiver dados, renderiza nada enquanto redireciona (evita o crash visual)
  if (!machineData) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6">
        {/* HEADER DA MÁQUINA */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate("/machines")}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 shrink-0"
            >
              <ArrowLeft size={24} />
            </button>

            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                {machineData.photo_url ? (
                  <img
                    src={machineData.photo_url}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Coffee size={24} className="text-gray-300" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                  {machineData.name}
                </h1>
                <p className="text-xs md:text-sm text-gray-500 truncate">
                  Configurações de Bebidas
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            {/* SELETOR DE MODELO */}
            {machineData.models && machineData.models.length > 0 && (
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100 w-full md:w-auto">
                <Layers size={16} className="text-purple-600 shrink-0" />
                <select
                  className="bg-transparent text-sm font-bold text-purple-800 outline-none cursor-pointer w-full"
                  value={selectedModelIndex}
                  onChange={(e) => setSelectedModelIndex(e.target.value)}
                >
                  <option value="">Padrão / Pai</option>
                  {machineData.models.map((m, idx) => (
                    <option key={idx} value={idx}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col-reverse md:flex-row gap-3 items-center w-full md:w-auto">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Capacidade Atual
                </p>
                <p className="font-bold text-amiste-primary text-sm">
                  {currentReservoirCount > 0
                    ? `${currentReservoirCount} Reservatórios`
                    : "Sem Reservatórios"}
                </p>
              </div>
              <button
                onClick={handleNew}
                disabled={currentReservoirCount === 0}
                className="w-full md:w-auto bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                <Plus size={20} />{" "}
                <span className="md:hidden">Nova Config</span>
                <span className="hidden md:inline">Nova Configuração</span>
              </button>
            </div>
          </div>
        </div>

        {/* LISTA DE CONFIGURAÇÕES */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <p className="text-center text-gray-400 py-10">Carregando...</p>
          ) : configs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <Settings size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhuma configuração criada para esta máquina.</p>
            </div>
          ) : (
            configs.map((config) => (
              <div
                key={config.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 relative group hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings
                      size={20}
                      className="text-amiste-primary shrink-0"
                    />
                    <span className="break-words">{config.name}</span>
                  </h3>

                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleEdit(config)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Grid de Produtos */}
                {Object.keys(config.product_map || {}).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                    {Object.entries(config.product_map).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-gray-50 p-3 rounded-xl border border-gray-100"
                      >
                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                          Reservatório {key}
                        </span>
                        <span className="font-bold text-gray-700 text-sm break-words leading-tight block">
                          {value || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {config.description && (
                  <div className="bg-blue-50 p-4 rounded-xl text-xs md:text-sm text-blue-800 leading-relaxed whitespace-pre-wrap break-words">
                    {config.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* MODAL FORMULÁRIO RESPONSIVO */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center shrink-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  {editingId ? "Editar Configuração" : "Nova Configuração"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form
                onSubmit={handleSave}
                className="p-5 md:p-6 space-y-6 overflow-y-auto"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nome da Configuração
                  </label>
                  <input
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Padrão Recepção"
                  />
                </div>

                <div className="bg-gray-50 p-4 md:p-5 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Database size={16} /> Mapeamento de Reservatórios
                  </h3>

                  {reservoirs.length === 0 ? (
                    <p className="text-sm text-red-500 italic">
                      Esta variação/máquina não possui reservatórios
                      configurados.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {reservoirs.map((i) => (
                        <div key={i}>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                            Produto {i}
                          </label>
                          <input
                            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-amiste-primary outline-none"
                            value={productMap[i] || ""}
                            onChange={(e) =>
                              handleProductChange(i, e.target.value)
                            }
                            placeholder={`Conteúdo ${i}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Observações / Detalhes
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-xl h-24 resize-none focus:ring-2 focus:ring-amiste-primary outline-none text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes sobre a regulagem (ex: moagem fina)..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={
                      reservoirs.length === 0 &&
                      Object.keys(productMap).length === 0
                    }
                    className="w-full py-3 bg-amiste-primary hover:bg-amiste-secondary text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                  >
                    <Save size={20} /> Salvar Configuração
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
