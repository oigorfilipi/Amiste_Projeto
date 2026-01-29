import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom"; // Importe Link
import {
  Plus,
  Search,
  Save,
  X,
  Trash2,
  Edit2,
  Package,
  Tag,
  Scale,
  ChefHat,
} from "lucide-react";

const BRAND_OPTIONS = [
  "DaVinci",
  "Vora",
  "Monin",
  "1883",
  "Nestlé",
  "Três Corações",
  "Amiste",
];
const SIZE_OPTIONS = ["1kg", "500g", "1L", "700ml", "250ml", "Unitário"];

export function Supplies() {
  const { permissions } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supplies, setSupplies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    size: "",
    photo_url: "",
    price: 0,
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
      setSupplies(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(item) {
    if (!permissions.canManageMachines) return alert("Sem permissão.");
    setEditingId(item.id);
    setFormData({
      name: item.name,
      brand: item.brand,
      size: item.size,
      photo_url: item.photo_url || "",
      price: item.price || 0,
    });
    setShowModal(true);
  }

  function handleNew() {
    if (!permissions.canManageMachines) return alert("Sem permissão.");
    setEditingId(null);
    setFormData({
      name: "",
      brand: "DaVinci",
      size: "1L",
      photo_url: "",
      price: 0,
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("supplies")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
        alert("Insumo atualizado!");
      } else {
        const { error } = await supabase.from("supplies").insert(formData);
        if (error) throw error;
        alert("Insumo cadastrado!");
      }
      setShowModal(false);
      fetchSupplies();
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!permissions.canManageMachines) return;
    if (!confirm("Excluir este insumo?")) return;
    await supabase.from("supplies").delete().eq("id", id);
    fetchSupplies();
  }

  const filteredSupplies = supplies.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-800">
              Catálogo de Insumos
            </h1>
            <p className="text-gray-500 mt-1">
              Gerencie xaropes, pós, grãos e descartáveis.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                placeholder="Buscar insumo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* BOTÃO DE RECEITAS */}
            <Link
              to="/recipes"
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all"
            >
              <ChefHat size={20} />{" "}
              <span className="hidden md:inline">Receitas</span>
            </Link>

            {permissions.canManageMachines && (
              <button
                onClick={handleNew}
                className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1"
              >
                <Plus size={20} />{" "}
                <span className="hidden md:inline">Novo Insumo</span>
              </button>
            )}
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredSupplies.map((item) => (
            <div
              key={item.id}
              onClick={() => handleEdit(item)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-1"
            >
              <div className="h-48 bg-gray-50 relative flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-amiste-primary/0 group-hover:bg-amiste-primary/5 transition-colors duration-300"></div>
                {item.photo_url ? (
                  <img
                    src={item.photo_url}
                    className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-gray-300">
                    <Package size={48} />
                  </div>
                )}
                {permissions.canManageMachines && (
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">
                  {item.name}
                </h3>
                <div className="flex gap-2 mt-auto">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <Tag size={12} /> {item.brand}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <Scale size={12} /> {item.size}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL (Mantido igual, mas aqui está para garantir) */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {editingId ? (
                    <Edit2 size={20} className="text-amiste-primary" />
                  ) : (
                    <Plus size={20} className="text-amiste-primary" />
                  )}
                  {editingId ? "Editar Insumo" : "Novo Insumo"}
                </h2>
                <button onClick={() => setShowModal(false)}>
                  <X size={24} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nome do Produto
                  </label>
                  <input
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Xarope de Maçã Verde"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Marca
                    </label>
                    <select
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                    >
                      {BRAND_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Tamanho
                    </label>
                    <select
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({ ...formData, size: e.target.value })
                      }
                    >
                      {SIZE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    URL da Foto
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="w-full p-3 border border-gray-200 rounded-xl"
                      value={formData.photo_url}
                      onChange={(e) =>
                        setFormData({ ...formData, photo_url: e.target.value })
                      }
                      placeholder="https://..."
                    />
                    {formData.photo_url && (
                      <img
                        src={formData.photo_url}
                        className="w-12 h-12 rounded border object-contain"
                      />
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amiste-primary hover:bg-amiste-secondary text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                  <Save size={20} /> {loading ? "Salvando..." : "Salvar Insumo"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
