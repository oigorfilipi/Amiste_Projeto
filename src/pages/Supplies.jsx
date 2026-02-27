import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
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
  Upload,
  Link as LinkIcon,
  ShoppingCart,
} from "lucide-react";

const BRAND_OPTIONS = ["DaVinci", "Vora", "Fabri", "Seleções", "Amiste"];
const SIZE_OPTIONS = ["1kg", "500g", "1L", "700ml", "250ml", "Unitário"];

export function Supplies() {
  const { permissions } = useContext(AuthContext);

  // MODO DE LEITURA (Read-Only)
  const isReadOnly = permissions?.Insumos === "Read";

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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

  const [imageMode, setImageMode] = useState("url");

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
      toast.error("Erro ao carregar insumos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e) {
    if (isReadOnly) return;
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, photo_url: data.publicUrl }));
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  function handleEdit(item) {
    // Quem for "Read" pode abrir para ver, mas o form será bloqueado
    setEditingId(item.id);
    setFormData({
      name: item.name,
      brand: item.brand,
      size: item.size,
      photo_url: item.photo_url || "",
      price: item.price || 0,
    });
    setImageMode(item.photo_url?.includes("supabase") ? "file" : "url");
    setShowModal(true);
  }

  function handleNew() {
    if (isReadOnly) return toast.error("Sem permissão para criar.");
    setEditingId(null);
    setFormData({
      name: "",
      brand: "DaVinci",
      size: "1L",
      photo_url: "",
      price: 0,
    });
    setImageMode("url");
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (isReadOnly) return;
    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("supplies")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Insumo atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("supplies").insert(formData);
        if (error) throw error;
        toast.success("Insumo cadastrado com sucesso!");
      }
      setShowModal(false);
      fetchSupplies();
    } catch (err) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (isReadOnly) return toast.error("Sem permissão para excluir.");
    if (!confirm("Tem certeza que deseja excluir este insumo?")) return;

    try {
      const { error } = await supabase.from("supplies").delete().eq("id", id);
      if (error) throw error;
      toast.success("Insumo excluído.");
      fetchSupplies();
    } catch (err) {
      toast.error("Erro ao excluir: " + err.message);
    }
  }

  const filteredSupplies = supplies.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">
              Catálogo de Insumos
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Gerencie xaropes, pós, grãos e descartáveis.
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Link
              to="/recipes"
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 md:px-5 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all shrink-0"
              title="Receitas"
            >
              <ChefHat size={20} />{" "}
              <span className="hidden md:inline">Receitas</span>
            </Link>

            {!isReadOnly && (
              <button
                onClick={handleNew}
                className="bg-amiste-primary hover:bg-amiste-secondary text-white px-3 md:px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1 shrink-0"
                title="Novo Insumo"
              >
                <Plus size={20} />{" "}
                <span className="hidden md:inline">Novo Insumo</span>
              </button>
            )}
          </div>
        </div>

        {/* CONTEÚDO CONDICIONAL */}
        {loading ? (
          <p className="text-center text-gray-400 py-20 flex flex-col items-center">
            <Package className="animate-bounce opacity-50 mb-2" size={32} />
            Carregando catálogo...
          </p>
        ) : filteredSupplies.length === 0 ? (
          // --- EMPTY STATE ---
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center animate-fade-in max-w-2xl mx-auto mt-4">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <ShoppingCart size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              Nenhum insumo encontrado
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto mb-8 text-sm px-4">
              Não encontramos produtos no estoque com esse critério. Cadastre um
              novo item para começar.
            </p>
            {!isReadOnly && (
              <button
                onClick={handleNew}
                className="bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1"
              >
                <Plus size={20} /> Cadastrar Insumo
              </button>
            )}
          </div>
        ) : (
          // --- GRID DE INSUMOS ---
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                  {!isReadOnly && (
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 z-10"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 truncate">
                    {item.name}
                  </h3>
                  <div className="flex gap-2 mt-auto pt-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                      <Tag size={12} /> {item.brand}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                      <Scale size={12} /> {item.size}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL RESPONSIVO */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center shrink-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                  {isReadOnly ? (
                    <Package size={20} className="text-amiste-primary" />
                  ) : editingId ? (
                    <Edit2 size={20} className="text-amiste-primary" />
                  ) : (
                    <Plus size={20} className="text-amiste-primary" />
                  )}
                  {isReadOnly
                    ? "Visualizar Insumo"
                    : editingId
                      ? "Editar Insumo"
                      : "Novo Insumo"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isReadOnly) handleSave(e);
                }}
                className="p-5 space-y-4 overflow-y-auto"
              >
                {isReadOnly && (
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-bold flex items-center gap-2 mb-2">
                    Modo de visualização. Edições desabilitadas.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nome do Produto
                  </label>
                  <input
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Xarope de Maçã Verde"
                    disabled={isReadOnly}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Marca
                    </label>
                    <select
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amiste-primary disabled:bg-gray-50 disabled:text-gray-500"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      disabled={isReadOnly}
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
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amiste-primary disabled:bg-gray-50 disabled:text-gray-500"
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({ ...formData, size: e.target.value })
                      }
                      disabled={isReadOnly}
                    >
                      {SIZE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SELEÇÃO DE IMAGEM */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-3">
                    Imagem do Produto
                  </label>

                  {!isReadOnly && (
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200 mb-3">
                      <button
                        type="button"
                        onClick={() => setImageMode("url")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-all ${imageMode === "url" ? "bg-amiste-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                      >
                        <LinkIcon size={12} /> Link (URL)
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode("file")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition-all ${imageMode === "file" ? "bg-amiste-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                      >
                        <Upload size={12} /> Upload
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3 items-center">
                    {!isReadOnly &&
                      (imageMode === "url" ? (
                        <input
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amiste-primary outline-none"
                          value={formData.photo_url}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              photo_url: e.target.value,
                            })
                          }
                          placeholder="https://exemplo.com/foto.png"
                        />
                      ) : (
                        <div className="relative w-full">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="w-full p-2 border border-gray-200 rounded-xl text-sm bg-white file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {uploading && (
                            <div className="absolute right-3 top-2.5 text-xs text-blue-600 font-bold animate-pulse">
                              Enviando...
                            </div>
                          )}
                        </div>
                      ))}

                    {formData.photo_url && (
                      <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 p-1">
                        <img
                          src={formData.photo_url}
                          className="w-full h-full object-contain rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  {!isReadOnly ? (
                    <button
                      type="submit"
                      disabled={loading || uploading}
                      className="w-full py-3 bg-amiste-primary hover:bg-amiste-secondary text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                      <Save size={20} />{" "}
                      {loading ? "Salvando..." : "Salvar Insumo"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all"
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
