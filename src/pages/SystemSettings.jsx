import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  Settings,
  Database,
  Coffee,
  Wrench,
  Droplet,
  Tag,
  Search,
  Menu,
} from "lucide-react";

// Definição das Categorias que o sistema aceita
const CATEGORIES = [
  { id: "syrups", label: "Xaropes & Sabores", icon: Droplet },
  { id: "grains", label: "Tipos de Café/Grãos", icon: Coffee },
  { id: "solubles", label: "Insumos Solúveis", icon: Coffee },
  { id: "tools", label: "Ferramentas & Itens", icon: Wrench },
  { id: "accessories", label: "Acessórios (Barista)", icon: Tag },
  { id: "drinks", label: "Cardápio de Bebidas", icon: Coffee },
];

export function SystemSettings() {
  const { permissions } = useContext(AuthContext);
  const [activeCategory, setActiveCategory] = useState("syrups");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Menu

  // MODO DE LEITURA (Read-Only)
  const isReadOnly = permissions?.AdicionarOpcao === "Read";

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const { data, error } = await supabase
        .from("catalog_items")
        .select("*")
        .order("name");
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      toast.error("Erro ao carregar catálogo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (isReadOnly)
      return toast.error("Você não tem permissão para adicionar itens.");
    if (!newItemName.trim()) return;

    try {
      const { data, error } = await supabase
        .from("catalog_items")
        .insert({
          category: activeCategory,
          name: newItemName.trim(),
          active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setItems((prev) => [...prev, data]);
      setNewItemName("");
      toast.success("Item adicionado!");
    } catch (error) {
      toast.error("Erro ao adicionar: " + error.message);
    }
  }

  async function handleDeleteItem(id) {
    if (isReadOnly)
      return toast.error("Você não tem permissão para remover itens.");
    if (!confirm("Tem certeza que deseja remover este item?")) return;
    try {
      const { error } = await supabase
        .from("catalog_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item removido.");
    } catch (error) {
      toast.error("Erro ao remover.");
    }
  }

  // Filtra itens da categoria atual + busca
  const filteredItems = items
    .filter((i) => i.category === activeCategory)
    .filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const CurrentIcon =
    CATEGORIES.find((c) => c.id === activeCategory)?.icon || Database;

  // Proteção Extra: Se for Nothing ou Ghost, ele nem chega aqui (barrado no App.jsx), mas a gente garante.
  if (
    permissions?.AdicionarOpcao === "Nothing" ||
    permissions?.AdicionarOpcao === "Ghost"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50">
        <div className="text-center p-8">
          <Settings size={48} className="mx-auto mb-4 opacity-20" />
          <p>Sem permissão para acessar configurações.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-2">
            <Settings className="text-amiste-primary" /> Configurações
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Gerencie as listas de opções do sistema.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* MENU DE CATEGORIAS (Responsivo) */}
          <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Mobile Header do Menu */}
            <div
              className="lg:hidden p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer bg-gray-50"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <span className="font-bold text-gray-700 text-sm">
                Selecionar Categoria
              </span>
              <Menu size={20} className="text-gray-500" />
            </div>

            <div className={`${isSidebarOpen ? "block" : "hidden"} lg:block`}>
              <div className="p-2 space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setSearchTerm("");
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                      activeCategory === cat.id
                        ? "bg-amiste-primary text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <cat.icon size={18} />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ÁREA DE CONTEÚDO */}
          <div className="flex-1 w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8 min-h-[500px]">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <CurrentIcon size={20} className="text-gray-400" />
                  {CATEGORIES.find((c) => c.id === activeCategory)?.label}
                </h2>

                <div className="relative w-full md:w-64">
                  <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <input
                    className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-amiste-primary transition-colors"
                    placeholder="Filtrar lista..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Formulário de Adição (Oculto se ReadOnly) */}
              {!isReadOnly && (
                <form
                  onSubmit={handleAddItem}
                  className="flex gap-2 mb-8 bg-gray-50 p-2 rounded-xl border border-gray-100"
                >
                  <input
                    className="flex-1 p-3 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amiste-primary transition-all text-sm"
                    placeholder={`Adicionar novo item em ${CATEGORIES.find((c) => c.id === activeCategory)?.label}...`}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!newItemName.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    <Plus size={20} />{" "}
                    <span className="hidden md:inline">Adicionar</span>
                  </button>
                </form>
              )}

              {/* Lista de Itens */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {loading ? (
                  <p className="col-span-full text-center py-10 text-gray-400">
                    Carregando...
                  </p>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <Database size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">
                      Nenhum item cadastrado nesta categoria.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-amiste-primary/30 transition-all"
                    >
                      <span className="font-bold text-gray-700 text-sm truncate pr-2">
                        {item.name}
                      </span>
                      {/* Oculta botão excluir se ReadOnly */}
                      {!isReadOnly && (
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
