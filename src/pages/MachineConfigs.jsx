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
  Loader2,
  Settings2,
} from "lucide-react";

export function MachineConfigs() {
  const { user, permissions } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Verifica se o usuário tem apenas leitura
  const isReadOnly = permissions?.ConfigMaquinas === "Read";

  // Dados da máquina vindo da tela anterior
  const machineData = location.state?.machine;

  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estados de Ação e Bloqueio
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

    // Inicializa a contagem de reservatórios com segurança
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
      toast.error("Erro ao buscar configurações: " + err.message);
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
    if (isReadOnly) return toast.error("Você não tem permissão para criar.");
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
    // Deixamos entrar pra ver, mas os campos estarão bloqueados
    setEditingId(config.id);
    setName(config.name);
    setDescription(config.description || "");
    setProductMap(config.product_map || {});
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (isReadOnly) return;
    if (!machineData?.id) return;

    setIsSaving(true);
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
      await fetchConfigs();
    } catch (err) {
      toast.error("Erro: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id) {
    if (isReadOnly) return toast.error("Você não tem permissão para excluir.");
    if (!window.confirm("Excluir esta configuração?")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("machine_configs")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Configuração excluída.");
      await fetchConfigs();
    } catch (err) {
      toast.error("Erro ao excluir: " + err.message);
    } finally {
      setDeletingId(null);
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
        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:shadow-md">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate("/machines")}
              className="p-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-amiste-primary shrink-0 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0 p-1">
                {machineData.photo_url ? (
                  <img
                    src={machineData.photo_url}
                    className="w-full h-full object-contain mix-blend-multiply"
                    alt={machineData.name}
                  />
                ) : (
                  <Coffee size={24} className="text-gray-300" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-black text-gray-800 truncate tracking-tight">
                  {machineData.name}
                </h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium truncate flex items-center gap-1.5 mt-0.5">
                  <Settings2 size={14} className="text-amiste-primary" />{" "}
                  Configurações de Bebidas
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            {/* SELETOR DE MODELO */}
            {machineData.models && machineData.models.length > 0 && (
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-2.5 rounded-xl border border-purple-100 w-full md:w-auto transition-colors focus-within:border-purple-300">
                <Layers size={16} className="text-purple-600 shrink-0" />
                <select
                  className="bg-transparent text-sm font-bold text-purple-800 outline-none cursor-pointer w-full appearance-none pr-4"
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

            <div className="flex flex-col-reverse md:flex-row gap-4 items-center w-full md:w-auto">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Capacidade Atual
                </p>
                <p className="font-bold text-amiste-primary text-sm flex items-center gap-1.5 justify-end">
                  <Database size={14} />
                  {currentReservoirCount > 0
                    ? `${currentReservoirCount} Reservatórios`
                    : "Sem Reservatórios"}
                </p>
              </div>
              {!isReadOnly && (
                <button
                  onClick={handleNew}
                  disabled={currentReservoirCount === 0}
                  className="w-full md:w-auto bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] hover:-translate-y-0.5"
                >
                  <Plus size={18} />
                  <span className="md:hidden">Nova Config</span>
                  <span className="hidden md:inline">Nova Configuração</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LISTA DE CONFIGURAÇÕES */}
        <div className="grid grid-cols-1 gap-5">
          {loading ? (
            // Skeleton Loading
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white h-40 rounded-2xl border border-gray-100"
                ></div>
              ))}
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm animate-fade-in">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Settings2 size={36} className="text-gray-300" />
              </div>
              <p className="font-bold text-gray-600 text-lg mb-1">
                Nenhuma configuração encontrada
              </p>
              <p className="text-sm font-medium">
                Crie a primeira configuração para esta máquina e facilite as
                instalações.
              </p>
            </div>
          ) : (
            configs.map((config) => (
              <div
                key={config.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 relative group hover:shadow-md hover:border-amiste-primary/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2.5">
                    <div className="p-2 bg-red-50 text-amiste-primary rounded-lg border border-red-100/50">
                      <Settings size={20} className="shrink-0" />
                    </div>
                    <span className="break-words leading-tight">
                      {config.name}
                    </span>
                  </h3>

                  <div className="flex gap-1.5 ml-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(config)}
                      disabled={deletingId === config.id}
                      className="p-2.5 text-blue-600 hover:bg-blue-50 hover:border-blue-100 border border-transparent rounded-xl transition-colors disabled:opacity-50"
                      title={isReadOnly ? "Visualizar" : "Editar"}
                    >
                      <Edit2 size={18} />
                    </button>
                    {!isReadOnly && (
                      <button
                        onClick={() => handleDelete(config.id)}
                        disabled={deletingId === config.id}
                        className="p-2.5 text-red-500 hover:bg-red-50 hover:border-red-100 border border-transparent rounded-xl transition-colors disabled:opacity-50"
                        title="Excluir"
                      >
                        {deletingId === config.id ? (
                          <Loader2
                            size={18}
                            className="animate-spin text-red-500"
                          />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid de Produtos */}
                {Object.keys(config.product_map || {}).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                    {Object.entries(config.product_map).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100"
                      >
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
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
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 text-sm text-blue-800 font-medium leading-relaxed whitespace-pre-wrap break-words">
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
              <div className="bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-center shrink-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Settings2 className="text-amiste-primary" size={24} />
                  {isReadOnly
                    ? "Visualizar Configuração"
                    : editingId
                      ? "Editar Configuração"
                      : "Nova Configuração"}
                </h2>
                <button
                  onClick={() => !isSaving && setShowModal(false)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSave}
                className="p-6 space-y-6 overflow-y-auto"
              >
                {isReadOnly && (
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-bold flex items-center gap-2 mb-2 border border-blue-100">
                    Modo de visualização. Edições desabilitadas.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                    Nome da Configuração
                  </label>
                  <input
                    required
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amiste-primary outline-none transition-all text-sm font-medium disabled:opacity-60"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Padrão Recepção"
                    disabled={isReadOnly || isSaving}
                  />
                </div>

                <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Database size={18} className="text-gray-400" /> Mapeamento
                    de Reservatórios
                  </h3>

                  {reservoirs.length === 0 ? (
                    <p className="text-sm text-red-500 font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                      ⚠️ Esta variação/máquina não possui reservatórios
                      configurados.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {reservoirs.map((i) => (
                        <div key={i}>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1 ml-1">
                            Produto {i}
                          </label>
                          <input
                            className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amiste-primary/20 focus:border-amiste-primary outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 font-medium"
                            value={productMap[i] || ""}
                            onChange={(e) =>
                              handleProductChange(i, e.target.value)
                            }
                            placeholder={`Conteúdo ${i}`}
                            disabled={isReadOnly || isSaving}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                    Observações / Detalhes
                  </label>
                  <textarea
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl h-24 resize-none focus:bg-white focus:ring-2 focus:ring-amiste-primary outline-none transition-all text-sm font-medium disabled:opacity-60"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes sobre a regulagem (ex: moagem fina)..."
                    disabled={isReadOnly || isSaving}
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  {!isReadOnly ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        disabled={isSaving}
                        className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={
                          isSaving ||
                          (reservoirs.length === 0 &&
                            Object.keys(productMap).length === 0)
                        }
                        className="flex-1 md:flex-none py-3.5 px-8 bg-amiste-primary hover:bg-amiste-secondary text-white rounded-xl font-bold shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                      >
                        {isSaving ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Save size={18} />
                        )}
                        {isSaving ? "Salvando..." : "Salvar Configuração"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="w-full py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all"
                    >
                      Fechar Visualização
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
