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
  Loader2,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Estados de Ação (Para evitar duplo clique)
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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
      toast.error("Erro ao carregar catálogo: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (isReadOnly)
      return toast.error("Você não tem permissão para adicionar itens.");
    if (!newItemName.trim()) return;

    setIsAdding(true);
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
      toast.success("Item adicionado com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar: " + error.message);
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteItem(id) {
    if (isReadOnly)
      return toast.error("Você não tem permissão para remover itens.");
    if (!window.confirm("Tem certeza que deseja remover este item?")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("catalog_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Item removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover: " + error.message);
    } finally {
      setDeletingId(null);
    }
  }

  // Filtra itens da categoria atual + busca
  const filteredItems = items
    .filter((i) => i.category === activeCategory)
    .filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const CurrentIcon =
    CATEGORIES.find((c) => c.id === activeCategory)?.icon || Database;

  // Proteção Extra
  if (
    permissions?.AdicionarOpcao === "Nothing" ||
    permissions?.AdicionarOpcao === "Ghost"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50/50 animate-fade-in">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-sm">
          <Settings size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-bold text-gray-700 mb-1">
            Acesso Restrito
          </h2>
          <p className="text-sm">
            Você não tem permissão para acessar as configurações do sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <Settings className="text-amiste-primary" size={24} />
            </div>
            Configurações
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Gerencie as listas de opções e insumos que alimentam o sistema.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* MENU DE CATEGORIAS (Responsivo) */}
          <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className="lg:hidden p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <span className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <CurrentIcon size={18} className="text-amiste-primary" />
                {CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </span>
              <Menu size={20} className="text-gray-500" />
            </div>

            <div className={`${isSidebarOpen ? "block" : "hidden"} lg:block`}>
              <div className="p-3 space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setSearchTerm("");
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all text-left ${
                        isActive
                          ? "bg-amiste-primary text-white shadow-md shadow-red-100"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={isActive ? "text-white" : "text-gray-400"}
                      />
                      {cat.label}
                    </button>
                  );
                })}
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

                <div className="relative w-full md:w-72">
                  <Search
                    className="absolute left-3.5 top-3 text-gray-400"
                    size={18}
                  />
                  <input
                    className="w-full pl-11 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-amiste-primary focus:ring-2 focus:ring-amiste-primary/10 transition-all"
                    placeholder="Filtrar lista..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Formulário de Adição */}
              {!isReadOnly && (
                <form
                  onSubmit={handleAddItem}
                  className="flex gap-3 mb-8 bg-gray-50/80 p-3 rounded-2xl border border-gray-100 focus-within:border-amiste-primary/30 transition-colors"
                >
                  <input
                    className="flex-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-amiste-primary transition-all text-sm font-medium"
                    placeholder={`Adicionar novo item em ${CATEGORIES.find((c) => c.id === activeCategory)?.label}...`}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    disabled={isAdding}
                  />
                  <button
                    type="submit"
                    disabled={!newItemName.trim() || isAdding}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 md:px-6 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98] shadow-sm"
                  >
                    {isAdding ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Plus size={18} />
                    )}
                    <span className="hidden md:inline">
                      {isAdding ? "Salvando..." : "Adicionar"}
                    </span>
                  </button>
                </form>
              )}

              {/* Lista de Itens */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {loading ? (
                  // Skeleton Loading
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 bg-gray-50 rounded-xl animate-pulse border border-gray-100"
                    ></div>
                  ))
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                    <div className="bg-white p-4 rounded-full shadow-sm border border-gray-50 mb-3">
                      <Database size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium">
                      Nenhum item encontrado nesta categoria.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-amiste-primary/30 transition-all"
                    >
                      <span className="font-bold text-gray-700 text-sm truncate pr-2">
                        {item.name}
                      </span>

                      {!isReadOnly && (
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deletingId === item.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          title="Excluir"
                        >
                          {deletingId === item.id ? (
                            <Loader2
                              size={16}
                              className="animate-spin text-red-500"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
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
