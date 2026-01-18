import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import {
  Wrench,
  Search,
  Plus,
  ArrowLeft,
  Trash2,
  Zap,
  Droplet,
  Settings,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X,
} from "lucide-react";

export function Wiki() {
  const { user } = useContext(AuthContext);

  // Estados de Navegação e Dados
  const [view, setView] = useState("grid"); // 'grid' ou 'details'
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Interface
  const [expandedId, setExpandedId] = useState(null); // Qual card está aberto?
  const [showForm, setShowForm] = useState(false);

  // Estados do Formulário (Edição/Criação)
  const [editingId, setEditingId] = useState(null); // Se tiver ID, é edição
  const [problem, setProblem] = useState("");
  const [category, setCategory] = useState("Mecânico");
  const [description, setDescription] = useState("");

  // 1. Carregar Máquinas
  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    const { data } = await supabase.from("machines").select("*").order("name");
    if (data) setMachines(data);
    setLoading(false);
  }

  // 2. Carregar Soluções
  async function openMachineWiki(machine) {
    setSelectedMachine(machine);
    setView("details");
    fetchSolutions(machine.id);
  }

  async function fetchSolutions(machineId) {
    const { data } = await supabase
      .from("wiki_solutions")
      .select("*")
      .eq("machine_id", machineId)
      .order("created_at", { ascending: false });

    if (data) setSolutions(data);
  }

  // 3. Preparar Edição
  function handleEdit(sol) {
    setEditingId(sol.id);
    setProblem(sol.problem_title);
    setCategory(sol.category);
    setDescription(sol.description);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Sobe pro formulário
  }

  // 4. Salvar (Inserir ou Atualizar)
  async function handleSaveSolution(e) {
    e.preventDefault();
    if (!problem || !description)
      return alert("Preencha o problema e a solução!");

    try {
      const payload = {
        machine_id: selectedMachine.id,
        machine_name: selectedMachine.name,
        problem_title: problem,
        category,
        description,
        user_id: user.id, // Salva quem editou/criou
      };

      if (editingId) {
        // UPDATE
        const { error } = await supabase
          .from("wiki_solutions")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        alert("Solução atualizada!");
      } else {
        // INSERT
        const { error } = await supabase.from("wiki_solutions").insert(payload);
        if (error) throw error;
        alert("Nova solução registrada!");
      }

      // Limpeza
      setProblem("");
      setDescription("");
      setShowForm(false);
      setEditingId(null);
      fetchSolutions(selectedMachine.id);
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
  }

  // 5. Excluir
  async function handleDelete(id, e) {
    e.stopPropagation(); // Evita abrir o card quando clica no lixo
    if (!confirm("Excluir esta solução permanentemente?")) return;

    await supabase.from("wiki_solutions").delete().eq("id", id);
    fetchSolutions(selectedMachine.id);
  }

  // 6. Cancelar Edição
  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setProblem("");
    setDescription("");
  }

  // Helper de Ícones
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Elétrico":
        return <Zap size={18} className="text-yellow-500" />;
      case "Hidráulico":
        return <Droplet size={18} className="text-blue-500" />;
      case "Mecânico":
        return <Settings size={18} className="text-gray-500" />;
      case "Configuração":
        return <Wrench size={18} className="text-purple-500" />;
      default:
        return <FileText size={18} className="text-amiste-primary" />;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* CABEÇALHO */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Wiki de Manutenção
        </h1>
        <p className="text-gray-500">
          Base de conhecimento técnica e soluções de problemas.
        </p>
      </div>

      {/* --- MODO 1: GRID DE MÁQUINAS --- */}
      {view === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {machines.map((machine) => (
            <div
              key={machine.id}
              onClick={() => openMachineWiki(machine)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-xl hover:border-amiste-primary/50 transition-all group"
            >
              <div className="h-40 bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                <img
                  src={machine.photo_url}
                  alt={machine.name}
                  className="h-full object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <h3 className="font-bold text-lg text-gray-800">
                {machine.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{machine.brand}</p>

              <div className="flex items-center text-amiste-primary text-sm font-bold gap-1 mt-auto">
                <Wrench size={16} /> Acessar Soluções <ChevronRight size={16} />
              </div>
            </div>
          ))}
          {loading && <p className="text-gray-400">Carregando catálogo...</p>}
        </div>
      )}

      {/* --- MODO 2: LISTA DE SOLUÇÕES (DETALHES) --- */}
      {view === "details" && selectedMachine && (
        <div className="animate-fade-in">
          {/* Barra de Topo */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-4 z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setView("grid");
                  setShowForm(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <ArrowLeft size={24} />
              </button>
              <img
                src={selectedMachine.photo_url}
                className="w-12 h-12 object-contain bg-gray-50 rounded border"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800 leading-tight">
                  {selectedMachine.name}
                </h2>
                <p className="text-xs text-gray-500">Gerenciando Soluções</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (showForm) handleCancel();
                else {
                  setShowForm(true);
                  setEditingId(null);
                  setProblem("");
                  setDescription("");
                }
              }}
              className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md transition-colors ${showForm ? "bg-gray-200 text-gray-600" : "bg-amiste-primary text-white hover:bg-amiste-secondary"}`}
            >
              {showForm ? (
                <>
                  <X size={20} /> Cancelar
                </>
              ) : (
                <>
                  <Plus size={20} /> Nova Solução
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FORMULÁRIO (Aparece ao criar ou editar) */}
            {showForm && (
              <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-amiste-primary mb-6 animate-fade-in relative">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-amiste-primary">
                  {editingId ? <Edit size={20} /> : <Plus size={20} />}
                  {editingId
                    ? "Editar Procedimento"
                    : "Registrar Novo Procedimento"}
                </h3>

                <form onSubmit={handleSaveSolution} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold mb-1">
                        Título do Problema
                      </label>
                      <input
                        className="w-full p-3 border rounded-lg focus:border-amiste-primary outline-none"
                        placeholder="Ex: Luz de Descalcificação Piscando"
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">
                        Categoria
                      </label>
                      <select
                        className="w-full p-3 border rounded-lg bg-white"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option>Mecânico</option>
                        <option>Elétrico</option>
                        <option>Hidráulico</option>
                        <option>Configuração</option>
                        <option>Outro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Descrição da Solução (Passo a Passo)
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-lg h-40 focus:border-amiste-primary outline-none text-sm leading-relaxed"
                      placeholder="Descreva detalhadamente o que deve ser feito..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm"
                    >
                      <Save size={18} />{" "}
                      {editingId ? "Atualizar" : "Salvar Wiki"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* LISTA DE SOLUÇÕES (ACORDEÃO) */}
            <div className="lg:col-span-3 space-y-3">
              {solutions.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Wrench
                    size={48}
                    className="mx-auto text-gray-300 mb-2 opacity-50"
                  />
                  <p className="text-gray-500 font-medium">
                    Nenhuma solução registrada.
                  </p>
                  <p className="text-sm text-gray-400">
                    Seja o primeiro a contribuir!
                  </p>
                </div>
              ) : (
                solutions.map((sol) => {
                  const isExpanded = expandedId === sol.id;
                  return (
                    <div
                      key={sol.id}
                      className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${isExpanded ? "border-amiste-primary ring-1 ring-amiste-primary/20" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      {/* Cabeçalho do Card (Clicável) */}
                      <div
                        onClick={() =>
                          setExpandedId(isExpanded ? null : sol.id)
                        }
                        className="p-5 flex items-center justify-between cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 rounded-lg bg-gray-50 border border-gray-100`}
                          >
                            {getCategoryIcon(sol.category)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">
                              {sol.problem_title}
                            </h3>
                            <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                              {sol.category}
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          {isExpanded ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </div>
                      </div>

                      {/* Corpo do Card (Expandido) */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-fade-in">
                          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap mb-6">
                            {sol.description}
                          </div>

                          <div className="flex justify-between items-end border-t border-gray-200 pt-4 mt-4">
                            <p className="text-xs text-gray-400 italic">
                              Criado em{" "}
                              {new Date(sol.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(sol);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors"
                              >
                                <Edit size={16} /> Editar
                              </button>
                              <button
                                onClick={(e) => handleDelete(sol.id, e)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors"
                              >
                                <Trash2 size={16} /> Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
