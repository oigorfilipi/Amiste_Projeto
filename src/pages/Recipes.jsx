import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  ChefHat,
  Plus,
  ArrowLeft,
  Trash2,
  Edit2,
  Save,
  X,
  Search,
  ChevronRight,
  Package,
} from "lucide-react";

export function Recipes() {
  const { user, permissions } = useContext(AuthContext);
  const [view, setView] = useState("grid");
  const [supplies, setSupplies] = useState([]);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // MODO DE LEITURA (Read-Only)
  const isReadOnly = permissions?.Receitas === "Read";

  // Form States
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    ingredients: "",
    yield: "",
  });

  useEffect(() => {
    fetchSupplies();
  }, []);

  async function fetchSupplies() {
    try {
      const { data, error } = await supabase
        .from("supplies")
        .select("*")
        .order("name");
      if (error) throw error;
      if (data) setSupplies(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar insumos.");
    } finally {
      setLoading(false);
    }
  }

  async function openSupplyRecipes(supply) {
    setSelectedSupply(supply);
    setView("details");
    fetchRecipes(supply.id);
  }

  async function fetchRecipes(supplyId) {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("supply_id", supplyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setRecipes(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar receitas.");
    }
  }

  function handleEdit(recipe) {
    if (isReadOnly) return toast.error("Você não tem permissão para editar.");
    setEditingId(recipe.id);
    setFormData({
      name: recipe.name,
      instructions: recipe.instructions,
      ingredients: recipe.ingredients,
      yield: recipe.yield || "",
    });
    setShowForm(true);
    setTimeout(() => {
      document
        .getElementById("recipe-form")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (isReadOnly) return;
    if (!selectedSupply) return;

    try {
      const payload = {
        ...formData,
        supply_id: selectedSupply.id,
        user_id: user.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from("recipes")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Receita atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("recipes").insert(payload);
        if (error) throw error;
        toast.success("Receita criada com sucesso!");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        instructions: "",
        ingredients: "",
        yield: "",
      });
      fetchRecipes(selectedSupply.id);
    } catch (err) {
      toast.error("Erro ao salvar: " + err.message);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (isReadOnly) return toast.error("Você não tem permissão para excluir.");
    if (!confirm("Tem certeza que deseja excluir esta receita?")) return;

    try {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Receita excluída.");
      fetchRecipes(selectedSupply.id);
    } catch (err) {
      toast.error("Erro ao excluir: " + err.message);
    }
  }

  const filteredSupplies = supplies.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      {/* MODO GRID */}
      {view === "grid" && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">
                Receitas & Bebidas
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Selecione um insumo para ver o que pode ser feito com ele.
              </p>
            </div>

            {/* Busca Responsiva */}
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amiste-primary transition-all"
                placeholder="Buscar insumo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-10">
              Carregando insumos...
            </p>
          ) : filteredSupplies.length === 0 ? (
            // --- EMPTY STATE ---
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center animate-fade-in max-w-2xl mx-auto mt-4">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <Package size={48} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Nenhum insumo encontrado
              </h3>
              <p className="text-gray-400 max-w-sm mx-auto text-sm px-4">
                Não encontramos insumos para mostrar. Cadastre novos insumos no
                menu "Insumos" para gerenciar receitas.
              </p>
            </div>
          ) : (
            // --- GRID DE INSUMOS ---
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredSupplies.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openSupplyRecipes(item)}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1 active:scale-[0.98]"
                >
                  <div className="h-32 flex items-center justify-center mb-4 bg-gray-50 rounded-xl relative overflow-hidden">
                    {item.photo_url ? (
                      <img
                        src={item.photo_url}
                        className="h-full w-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <Package size={40} className="text-gray-300" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center text-amiste-primary text-sm font-bold gap-1 mt-3">
                    Ver Receitas <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODO DETALHES */}
      {view === "details" && selectedSupply && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4">
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 -mx-4 md:-mx-8 mb-6 border-b border-gray-100 shadow-sm flex justify-between items-center transition-all">
            <div className="flex items-center gap-3 overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className="p-2 hover:bg-gray-100 rounded-full shrink-0"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="truncate">
                <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">
                  {selectedSupply.name}
                </h1>
                <p className="text-xs text-gray-500">Gerenciando Receitas</p>
              </div>
            </div>

            {!isReadOnly && (
              <button
                onClick={() => setShowForm(!showForm)}
                className={`p-2 md:px-5 md:py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all shrink-0 ${
                  showForm
                    ? "bg-gray-100 text-gray-600"
                    : "bg-amiste-primary text-white"
                }`}
              >
                {showForm ? (
                  <>
                    <X size={20} />{" "}
                    <span className="hidden md:inline">Cancelar</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />{" "}
                    <span className="hidden md:inline">Nova Receita</span>
                  </>
                )}
              </button>
            )}
          </div>

          {showForm && !isReadOnly && (
            <div
              id="recipe-form"
              className="bg-white p-5 md:p-8 rounded-2xl shadow-lg border border-amiste-primary/30 ring-4 ring-amiste-primary/5 mb-8 animate-slide-down"
            >
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-800">
                <ChefHat size={24} className="text-amiste-primary" />{" "}
                {editingId ? "Editar Receita" : "Nova Receita"}
              </h3>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Nome da Receita
                    </label>
                    <input
                      required
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ex: Soda Italiana de Maçã"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Rendimento
                    </label>
                    <input
                      className="w-full p-3 border border-gray-200 rounded-xl transition-all"
                      value={formData.yield}
                      onChange={(e) =>
                        setFormData({ ...formData, yield: e.target.value })
                      }
                      placeholder="Ex: 300ml"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Ingredientes
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-xl h-24 transition-all"
                      value={formData.ingredients}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ingredients: e.target.value,
                        })
                      }
                      placeholder="Liste os ingredientes..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Modo de Preparo
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-xl h-32 transition-all"
                      value={formData.instructions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instructions: e.target.value,
                        })
                      }
                      placeholder="Passo a passo..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                  >
                    <Save size={18} /> Salvar Receita
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {recipes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-600 font-bold text-lg">
                  Nenhuma receita cadastrada.
                </p>
                <p className="text-sm text-gray-400">
                  Crie a primeira receita para este insumo!
                </p>
              </div>
            ) : (
              recipes.map((r) => (
                <div
                  key={r.id}
                  className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-xl shrink-0">
                        <ChefHat size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 leading-tight">
                          {r.name}
                        </h3>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mt-1">
                          Rendimento: {r.yield}
                        </p>
                      </div>
                    </div>

                    {!isReadOnly && (
                      <div className="flex gap-2 self-end md:self-auto">
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(r.id, e)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm text-gray-600">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <strong className="block text-gray-400 text-xs uppercase mb-2">
                        Ingredientes
                      </strong>
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {r.ingredients}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <strong className="block text-gray-400 text-xs uppercase mb-2">
                        Preparo
                      </strong>
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {r.instructions}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
