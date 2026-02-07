import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
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
  Layers, // Novo ícone
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
    if (!machineData) {
      navigate("/machines");
      return;
    }
    fetchConfigs();

    // Inicializa a contagem de reservatórios com o valor do pai
    setCurrentReservoirCount(machineData.reservoir_count || 0);
  }, [machineData]);

  // Efeito para atualizar a contagem quando troca o modelo
  useEffect(() => {
    if (
      selectedModelIndex !== "" &&
      machineData.models &&
      machineData.models[selectedModelIndex]
    ) {
      // Se escolheu um modelo, usa a contagem dele (se tiver), senão usa a do pai
      const model = machineData.models[selectedModelIndex];
      // Nota: O reservoir_count no modelo pode não existir se foi criado antes da atualização
      // Mas assumindo que a lógica de save do Machine.jsx está certa, deve estar lá.
      // Se não tiver no modelo, assume o do pai.
      // Como o reservoir_count não estava explícito no form de variação do Machine.jsx (estava implícito na lógica de "não mostrar se for moedor"),
      // vamos assumir que se não tiver no modelo, usa o do pai.
      // Mas espere! No Machine.jsx nós salvamos reservoir_count no payload geral se não tiver variação.
      // Se tiver variação, o reservoir_count fica dentro do objeto do modelo?
      // Vamos garantir: O ideal é que o modelo tenha sua própria contagem se ela diferir.
      // Por simplificação: vamos usar a lógica de que se o modelo tem a propriedade definida, usa ela.
      setCurrentReservoirCount(
        model.reservoir_count || machineData.reservoir_count || 0,
      );
    } else {
      // Se não tem modelo selecionado (ou é o pai), usa o do pai
      setCurrentReservoirCount(machineData.reservoir_count || 0);
    }
  }, [selectedModelIndex, machineData]);

  async function fetchConfigs() {
    try {
      const { data, error } = await supabase
        .from("machine_configs")
        .select("*")
        .eq("machine_id", machineData.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (err) {
      alert("Erro ao buscar configurações.");
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
    // Sugere um nome com base no modelo selecionado
    let initialName = "";
    if (selectedModelIndex !== "" && machineData.models) {
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
    try {
      const payload = {
        machine_id: machineData.id,
        user_id: user.id,
        name,
        description,
        product_map: productMap,
        // Opcional: Salvar qual modelo essa config se refere (se quiser filtrar depois)
        // model_index: selectedModelIndex
      };

      if (editingId) {
        await supabase
          .from("machine_configs")
          .update(payload)
          .eq("id", editingId);
        alert("Configuração atualizada!");
      } else {
        await supabase.from("machine_configs").insert(payload);
        alert("Configuração criada!");
      }
      setShowModal(false);
      fetchConfigs();
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Excluir esta configuração?")) return;
    await supabase.from("machine_configs").delete().eq("id", id);
    fetchConfigs();
  }

  // Gera array baseado na contagem ATUAL (que pode vir do modelo)
  const reservoirs = Array.from(
    { length: parseInt(currentReservoirCount) || 0 },
    (_, i) => i + 1,
  );

  if (!machineData) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/machines")}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
            >
              <ArrowLeft size={24} />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                {machineData.photo_url ? (
                  <img
                    src={machineData.photo_url}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Coffee size={24} className="text-gray-300" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {machineData.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Gerenciando Configurações de Bebidas
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* SELETOR DE MODELO (Se houver) */}
            {machineData.models && machineData.models.length > 0 && (
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                <Layers size={14} className="text-purple-600" />
                <select
                  className="bg-transparent text-sm font-bold text-purple-800 outline-none cursor-pointer"
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

            <div className="flex gap-4 items-center">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Capacidade Atual
                </p>
                <p className="font-bold text-amiste-primary">
                  {currentReservoirCount > 0
                    ? `${currentReservoirCount} Reservatórios`
                    : "Sem Reservatórios"}
                </p>
              </div>
              <button
                onClick={handleNew}
                disabled={currentReservoirCount === 0}
                className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} /> Nova Configuração
              </button>
            </div>
          </div>
        </div>

        {/* LISTA DE CONFIGURAÇÕES */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <p className="text-center text-gray-400">Carregando...</p>
          ) : configs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <Settings size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhuma configuração criada para esta máquina.</p>
            </div>
          ) : (
            configs.map((config) => (
              <div
                key={config.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative group hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings size={20} className="text-amiste-primary" />{" "}
                    {config.name}
                  </h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(config)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Exibe os produtos apenas se houver reservatórios configurados */}
                {Object.keys(config.product_map || {}).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Aqui iteramos sobre o MAP salvo, pois a config pode ter sido criada
                        para um modelo com mais/menos reservatórios do que o selecionado agora */}
                    {Object.entries(config.product_map).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-gray-50 p-3 rounded-xl border border-gray-100"
                      >
                        <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                          Reservatório {key}
                        </span>
                        <span className="font-bold text-gray-700 break-words">
                          {value || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {config.description && (
                  <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 leading-relaxed whitespace-pre-wrap break-words">
                    {config.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* MODAL FORMULÁRIO */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingId ? "Editar Configuração" : "Nova Configuração"}
                </h2>
                <button onClick={() => setShowModal(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nome da Configuração
                  </label>
                  <input
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Padrão Recepção"
                  />
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Database size={16} /> Mapeamento de Reservatórios
                  </h3>

                  {reservoirs.length === 0 ? (
                    <p className="text-sm text-red-500 italic">
                      Esta variação/máquina não possui reservatórios
                      configurados.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reservoirs.map((i) => (
                        <div key={i}>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                            Produto {i}
                          </label>
                          <input
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                            value={productMap[i] || ""}
                            onChange={(e) =>
                              handleProductChange(i, e.target.value)
                            }
                            placeholder={`Conteúdo do reservatório ${i}`}
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
                    className="w-full p-3 border border-gray-200 rounded-xl h-24 resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes sobre a regulagem (ex: moagem fina, temperatura alta)..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    reservoirs.length === 0 &&
                    Object.keys(productMap).length === 0
                  }
                  className="w-full py-3 bg-amiste-primary hover:bg-amiste-secondary text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} /> Salvar Configuração
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
