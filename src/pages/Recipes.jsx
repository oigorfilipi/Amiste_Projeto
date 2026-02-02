import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
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
  const { user } = useContext(AuthContext);
  const [view, setView] = useState("grid");
  const [supplies, setSupplies] = useState([]);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
    const { data } = await supabase.from("supplies").select("*").order("name");
    if (data) setSupplies(data);
    setLoading(false);
  }

  async function openSupplyRecipes(supply) {
    setSelectedSupply(supply);
    setView("details");
    fetchRecipes(supply.id);
  }

  async function fetchRecipes(supplyId) {
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("supply_id", supplyId)
      .order("created_at", { ascending: false });
    if (data) setRecipes(data);
  }

  function handleEdit(recipe) {
    setEditingId(recipe.id);
    setFormData({
      name: recipe.name,
      instructions: recipe.instructions,
      ingredients: recipe.ingredients,
      yield: recipe.yield || "",
    });
    setShowForm(true);
    // Pequeno timeout para garantir que o elemento existe antes de rolar
    setTimeout(() => {
      document
        .getElementById("recipe-form")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        supply_id: selectedSupply.id,
        user_id: user.id,
      };
      if (editingId) {
        await supabase.from("recipes").update(payload).eq("id", editingId);
        alert("Receita atualizada!");
      } else {
        await supabase.from("recipes").insert(payload);
        alert("Receita criada!");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", instructions: "", ingredients: "", yield: "" });
      fetchRecipes(selectedSupply.id);
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm("Excluir receita?")) return;
    await supabase.from("recipes").delete().eq("id", id);
    fetchRecipes(selectedSupply.id);
  }

  const filteredSupplies = supplies.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      {/* MODO GRID */}
      {view === "grid" && (
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-800">
                Receitas & Bebidas
              </h1>
              <p className="text-gray-500 mt-1">
                Selecione um insumo para ver o que pode ser feito com ele.
              </p>
            </div>
            <div className="relative w-64">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amiste-primary"
                placeholder="Buscar insumo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* CONDICIONAL: LOADING ou EMPTY STATE ou GRID */}
          {loading ? (
            <p className="text-center text-gray-400 py-10">
              Carregando insumos...
            </p>
          ) : filteredSupplies.length === 0 ? (
            // --- EMPTY STATE (Nenhum Insumo) ---
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 text-center animate-fade-in max-w-2xl mx-auto mt-8">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <Package size={48} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Nenhum insumo encontrado
              </h3>
              <p className="text-gray-400 max-w-sm mx-auto text-sm">
                Não encontramos insumos para mostrar. Cadastre novos insumos no
                menu "Insumos" para gerenciar receitas.
              </p>
            </div>
          ) : (
            // --- GRID DE INSUMOS ---
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {filteredSupplies.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openSupplyRecipes(item)}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
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
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">
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
        <div className="max-w-5xl mx-auto p-6 md:p-8">
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-6 py-4 -mx-4 md:-mx-8 mb-8 border-b border-gray-100 shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView("grid")}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {selectedSupply.name}
                </h1>
                <p className="text-xs text-gray-500">Gerenciando Receitas</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all ${showForm ? "bg-gray-100 text-gray-600" : "bg-amiste-primary text-white"}`}
            >
              {showForm ? (
                <>
                  <X size={18} /> Cancelar
                </>
              ) : (
                <>
                  <Plus size={18} /> Nova Receita
                </>
              )}
            </button>
          </div>

          {showForm && (
            <div
              id="recipe-form"
              className="bg-white p-8 rounded-2xl shadow-lg border border-amiste-primary/30 ring-4 ring-amiste-primary/5 mb-8 animate-slide-down"
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
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none"
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
                      className="w-full p-3 border border-gray-200 rounded-xl"
                      value={formData.yield}
                      onChange={(e) =>
                        setFormData({ ...formData, yield: e.target.value })
                      }
                      placeholder="Ex: 300ml"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Ingredientes
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-xl h-24"
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
                      className="w-full p-3 border border-gray-200 rounded-xl h-32"
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
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md"
                  >
                    <Save size={18} /> Salvar Receita
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {recipes.length === 0 ? (
              // --- EMPTY STATE (Nenhuma Receita neste Insumo) ---
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
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                        <ChefHat size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {r.name}
                        </h3>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                          Rendimento: {r.yield}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <strong className="block text-gray-400 text-xs uppercase mb-2">
                        Ingredientes
                      </strong>
                      <p className="whitespace-pre-wrap break-words">
                        {r.ingredients}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <strong className="block text-gray-400 text-xs uppercase mb-2">
                        Preparo
                      </strong>
                      <p className="whitespace-pre-wrap break-words">
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
