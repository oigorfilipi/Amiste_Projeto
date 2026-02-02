import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import {
  Wrench,
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
  Edit2,
  Save,
  X,
  Search,
  BookOpen, // <--- Adicionei este ícone para o empty state
} from "lucide-react";

export function Wiki() {
  const { user } = useContext(AuthContext);

  // Estados de Navegação e Dados
  const [view, setView] = useState("grid"); // 'grid' ou 'details'
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados de Interface
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Estados do Formulário
  const [editingId, setEditingId] = useState(null);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    // Scroll suave até o formulário
    const formElement = document.getElementById("wiki-form");
    if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
  }

  // 4. Salvar
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
        user_id: user.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from("wiki_solutions")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        alert("Solução atualizada!");
      } else {
        const { error } = await supabase.from("wiki_solutions").insert(payload);
        if (error) throw error;
        alert("Nova solução registrada!");
      }

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
    e.stopPropagation();
    if (!confirm("Excluir esta solução permanentemente?")) return;
    await supabase.from("wiki_solutions").delete().eq("id", id);
    fetchSolutions(selectedMachine.id);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setProblem("");
    setDescription("");
  }

  // Helper de Ícones com Estilo Novo
  const getCategoryStyle = (cat) => {
    switch (cat) {
      case "Elétrico":
        return { icon: Zap, bg: "bg-yellow-50", text: "text-yellow-600" };
      case "Hidráulico":
        return { icon: Droplet, bg: "bg-blue-50", text: "text-blue-600" };
      case "Mecânico":
        return { icon: Settings, bg: "bg-gray-100", text: "text-gray-600" };
      case "Configuração":
        return { icon: Wrench, bg: "bg-purple-50", text: "text-purple-600" };
      default:
        return {
          icon: FileText,
          bg: "bg-red-50",
          text: "text-amiste-primary",
        };
    }
  };

  const filteredMachines = machines.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* --- MODO 1: GRID DE MÁQUINAS --- */}
      {view === "grid" && (
        <div className="max-w-7xl mx-auto p-6 md:p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-800">
                Wiki Técnica
              </h1>
              <p className="text-gray-500 mt-1">
                Base de conhecimento e soluções de problemas.
              </p>
            </div>

            {/* Barra de Pesquisa */}
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                placeholder="Buscar máquina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* CONTEÚDO CONDICIONAL GRID */}
          {loading ? (
            <p className="text-gray-400 col-span-full text-center py-10">
              Carregando catálogo...
            </p>
          ) : filteredMachines.length === 0 ? (
            // --- EMPTY STATE (GRID) ---
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 text-center animate-fade-in max-w-2xl mx-auto">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <BookOpen size={48} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Nenhuma máquina encontrada
              </h3>
              <p className="text-gray-400 max-w-sm mx-auto text-sm">
                Não encontramos equipamentos para exibir na Wiki. Cadastre
                máquinas no catálogo para começar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMachines.map((machine) => (
                <div
                  key={machine.id}
                  onClick={() => openMachineWiki(machine)}
                  className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1"
                >
                  <div className="h-48 bg-gray-50 p-6 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-amiste-primary/0 group-hover:bg-amiste-primary/5 transition-colors duration-300"></div>
                    <img
                      src={machine.photo_url}
                      alt={machine.name}
                      className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">
                      {machine.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4">
                      {machine.brand}
                    </p>

                    <div className="flex items-center text-amiste-primary text-sm font-bold gap-1 mt-auto group-hover:gap-2 transition-all">
                      Acessar Soluções <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- MODO 2: DETALHES (Estilo Checklist Form) --- */}
      {view === "details" && selectedMachine && (
        <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
          {/* Header Fixo (Glassmorphism) */}
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-6 py-4 -mx-4 md:-mx-8 mb-8 border-b border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 transition-all">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setView("grid");
                  setShowForm(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center p-1">
                  <img
                    src={selectedMachine.photo_url}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 leading-none">
                    {selectedMachine.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Gerenciando Soluções
                  </p>
                </div>
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
              className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5 ${showForm ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-amiste-primary text-white hover:bg-amiste-secondary"}`}
            >
              {showForm ? (
                <>
                  <X size={18} /> Cancelar
                </>
              ) : (
                <>
                  <Plus size={18} /> Nova Solução
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FORMULÁRIO (Card Flutuante) */}
            {showForm && (
              <div
                id="wiki-form"
                className="lg:col-span-3 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-amiste-primary/30 ring-4 ring-amiste-primary/5 mb-2 animate-slide-down relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-amiste-primary"></div>

                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-800">
                  {editingId ? (
                    <Edit2 size={20} className="text-amiste-primary" />
                  ) : (
                    <Plus size={20} className="text-amiste-primary" />
                  )}
                  {editingId
                    ? "Editar Procedimento"
                    : "Registrar Novo Procedimento"}
                </h3>

                <form onSubmit={handleSaveSolution} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Título do Problema
                      </label>
                      <input
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary focus:border-transparent outline-none transition-all"
                        placeholder="Ex: Luz de Descalcificação Piscando"
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Categoria
                      </label>
                      <select
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-amiste-primary outline-none"
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
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Passo a Passo da Solução
                    </label>
                    <textarea
                      className="w-full p-4 border border-gray-200 rounded-xl h-48 focus:ring-2 focus:ring-amiste-primary focus:border-transparent outline-none text-sm leading-relaxed resize-none"
                      placeholder="Descreva detalhadamente o que deve ser feito..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      <Save size={18} />{" "}
                      {editingId ? "Atualizar" : "Salvar Wiki"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* LISTA DE SOLUÇÕES */}
            <div className="lg:col-span-3 space-y-4">
              {solutions.length === 0 ? (
                // --- EMPTY STATE (SOLUÇÕES) ---
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                  <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wrench size={32} className="text-gray-300" />
                  </div>
                  <p className="text-gray-600 font-bold text-lg">
                    Nenhuma solução registrada.
                  </p>
                  <p className="text-sm text-gray-400">
                    Seja o primeiro a contribuir com conhecimento!
                  </p>
                </div>
              ) : (
                solutions.map((sol) => {
                  const isExpanded = expandedId === sol.id;
                  const style = getCategoryStyle(sol.category);
                  const Icon = style.icon;

                  return (
                    <div
                      key={sol.id}
                      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isExpanded
                          ? "border-amiste-primary ring-2 ring-amiste-primary/10 shadow-lg"
                          : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
                      }`}
                    >
                      {/* Cabeçalho do Card */}
                      <div
                        onClick={() =>
                          setExpandedId(isExpanded ? null : sol.id)
                        }
                        className="p-5 flex items-start md:items-center justify-between cursor-pointer bg-white hover:bg-gray-50/50 transition-colors gap-4"
                      >
                        <div className="flex items-start md:items-center gap-4">
                          <div
                            className={`p-3 rounded-xl ${style.bg} ${style.text} shrink-0`}
                          >
                            <Icon size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg leading-tight">
                              {sol.problem_title}
                            </h3>
                            <span
                              className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${style.bg} ${style.text} opacity-80`}
                            >
                              {sol.category}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`p-2 rounded-full transition-colors ${isExpanded ? "bg-gray-100 text-gray-600" : "text-gray-400"}`}
                        >
                          {isExpanded ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </div>
                      </div>

                      {/* Conteúdo Expandido */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/30 p-6 md:p-8 animate-fade-in">
                          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed mb-8">
                            {sol.description}
                          </div>

                          <div className="flex justify-between items-end border-t border-gray-200 pt-4">
                            <p className="text-xs text-gray-400 font-medium">
                              Atualizado em{" "}
                              {new Date(sol.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(sol);
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                              >
                                <Edit2 size={14} /> Editar
                              </button>
                              <button
                                onClick={(e) => handleDelete(sol.id, e)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                              >
                                <Trash2 size={14} /> Excluir
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
