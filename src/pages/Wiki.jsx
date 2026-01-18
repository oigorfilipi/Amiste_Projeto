import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
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
} from "lucide-react";

export function Wiki() {
  // Estados de Navegação e Dados
  const [view, setView] = useState("grid"); // 'grid' (lista máquinas) ou 'details' (ver soluções)
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Formulário de Nova Solução
  const [showForm, setShowForm] = useState(false);
  const [problem, setProblem] = useState("");
  const [category, setCategory] = useState("Mecânico");
  const [description, setDescription] = useState("");

  // 1. Carregar Máquinas ao abrir
  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    const { data } = await supabase.from("machines").select("*").order("name");
    if (data) setMachines(data);
    setLoading(false);
  }

  // 2. Carregar Soluções quando escolhe uma máquina
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

  // 3. Salvar Nova Solução
  async function handleSaveSolution(e) {
    e.preventDefault();
    if (!problem || !description)
      return alert("Preencha o problema e a solução!");

    try {
      const { error } = await supabase.from("wiki_solutions").insert({
        machine_id: selectedMachine.id,
        machine_name: selectedMachine.name,
        problem_title: problem,
        category,
        description,
      });

      if (error) throw error;

      alert("Solução registrada!");
      setProblem("");
      setDescription("");
      setShowForm(false);
      fetchSolutions(selectedMachine.id); // Recarrega a lista
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
  }

  // 4. Excluir Solução
  async function handleDelete(id) {
    if (!confirm("Excluir esta solução?")) return;
    await supabase.from("wiki_solutions").delete().eq("id", id);
    fetchSolutions(selectedMachine.id);
  }

  // Helper para ícones de categoria
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Elétrico":
        return <Zap size={18} className="text-yellow-500" />;
      case "Hidráulico":
        return <Droplet size={18} className="text-blue-500" />;
      case "Mecânico":
        return <Settings size={18} className="text-gray-500" />;
      default:
        return <FileText size={18} className="text-amiste-primary" />;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* CABEÇALHO GERAL */}
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
              <div className="h-40 bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
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

              <div className="flex items-center text-amiste-primary text-sm font-bold gap-1">
                <Wrench size={16} /> Acessar Soluções <ChevronRight size={16} />
              </div>
            </div>
          ))}
          {loading && <p>Carregando máquinas...</p>}
        </div>
      )}

      {/* --- MODO 2: DETALHES DA MÁQUINA --- */}
      {view === "details" && selectedMachine && (
        <div className="animate-fade-in">
          {/* Barra de Topo da Máquina */}
          <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView("grid")}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <ArrowLeft size={24} />
              </button>
              <img
                src={selectedMachine.photo_url}
                className="w-12 h-12 object-contain bg-gray-50 rounded border"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedMachine.name}
                </h2>
                <p className="text-xs text-gray-500">Gerenciando Soluções</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md"
            >
              <Plus size={20} /> {showForm ? "Cancelar" : "Nova Solução"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FORMULÁRIO DE ADIÇÃO (Esquerda ou Topo) */}
            {showForm && (
              <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-amiste-primary mb-6 animate-fade-in relative">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-amiste-primary">
                  <Plus size={20} /> Registrar Procedimento
                </h3>
                <form onSubmit={handleSaveSolution} className="space-y-4">
                  <div>
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
                      className="w-full p-3 border rounded-lg"
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
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Descrição da Solução (Passo a Passo)
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-lg h-32 focus:border-amiste-primary outline-none"
                      placeholder="Descreva detalhadamente o que deve ser feito..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="text-right">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold">
                      Salvar Wiki
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* LISTA DE SOLUÇÕES */}
            <div className="lg:col-span-3 space-y-4">
              {solutions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Wrench size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    Nenhuma solução registrada para esta máquina.
                  </p>
                  <p className="text-sm text-gray-400">
                    Seja o primeiro a contribuir!
                  </p>
                </div>
              ) : (
                solutions.map((sol) => (
                  <div
                    key={sol.id}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-amiste-primary transition-colors group relative"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(sol.category)}
                        <span className="text-xs font-bold uppercase text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {sol.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(sol.id)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {sol.problem_title}
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm whitespace-pre-wrap border border-gray-100">
                      {sol.description}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">
                      Registrado em{" "}
                      {new Date(sol.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
