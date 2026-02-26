import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import toast from "react-hot-toast";
import {
  Database,
  Plus,
  Search,
  Package,
  Coffee,
  Clock,
  Edit2,
  Trash2,
  X,
  Save,
} from "lucide-react";
import clsx from "clsx";

export function Stock() {
  const { permissions, userProfile } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("supplies"); // 'supplies' ou 'machines'
  const [searchTerm, setSearchTerm] = useState("");

  const [stockItems, setStockItems] = useState([]);
  const [machineOptions, setMachineOptions] = useState([]);
  const [supplyOptions, setSupplyOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", quantity: 0 });
  const [saving, setSaving] = useState(false);

  // MODO DE LEITURA (Read-Only)
  const isReadOnly = permissions?.Contagem === "Read";

  useEffect(() => {
    fetchStock();
    fetchOptions();
  }, []);

  async function fetchStock() {
    try {
      const { data, error } = await supabase
        .from("stock_items")
        .select("*")
        .order("name");
      if (error) throw error;
      setStockItems(data || []);
    } catch (error) {
      toast.error("Erro ao carregar o estoque.");
    } finally {
      setLoading(false);
    }
  }

  // Puxa os nomes das tabelas de catálogo para os selects
  async function fetchOptions() {
    try {
      const { data: mData } = await supabase
        .from("machines")
        .select("name")
        .order("name");
      if (mData) setMachineOptions(mData);

      const { data: sData } = await supabase
        .from("supplies")
        .select("name")
        .order("name");
      if (sData) setSupplyOptions(sData);
    } catch (error) {
      console.error("Erro ao carregar opções:", error);
    }
  }

  // --- ABRIR MODAL ---
  function handleOpenNew() {
    setEditingId(null);
    setFormData({ name: "", quantity: 0 });
    setIsModalOpen(true);
  }

  function handleOpenEdit(item) {
    setEditingId(item.id);
    setFormData({ name: item.name, quantity: item.quantity });
    setIsModalOpen(true);
  }

  // --- SALVAR ITEM (CREATE / UPDATE) ---
  async function handleSave(e) {
    e.preventDefault();
    if (!formData.name) return toast.error("Selecione um item.");

    setSaving(true);
    // Pega o nome do usuário logado (Dá preferência pro nickname)
    const userName =
      userProfile?.nickname ||
      userProfile?.full_name?.split(" ")[0] ||
      "Usuário";

    const payload = {
      type: activeTab,
      name: formData.name,
      quantity: Number(formData.quantity),
      updated_by: userName,
      updated_at: new Date().toISOString(), // Marca o horário exato da alteração
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("stock_items")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Estoque atualizado!");
      } else {
        const { error } = await supabase.from("stock_items").insert([payload]);
        if (error) throw error;
        toast.success("Item adicionado ao estoque!");
      }
      setIsModalOpen(false);
      fetchStock();
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  // --- DELETAR ITEM ---
  async function handleDelete(id, name) {
    if (!confirm(`Excluir o item "${name}" do controle de estoque?`)) return;

    try {
      const { error } = await supabase
        .from("stock_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Item excluído.");
      fetchStock();
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  }

  // Filtra os itens pela aba ativa e pela barra de pesquisa
  const filteredItems = stockItems.filter(
    (item) =>
      item.type === activeTab &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20 relative">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
          <Database className="text-amiste-primary" /> Contagem Geral
        </h1>
        <p className="text-gray-500 mt-1">
          Gestão de estoque de insumos e máquinas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-96 mb-6">
        <button
          onClick={() => setActiveTab("supplies")}
          className={clsx(
            "flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
            activeTab === "supplies"
              ? "bg-white text-amiste-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          <Package size={16} /> Insumos
        </button>
        <button
          onClick={() => setActiveTab("machines")}
          className={clsx(
            "flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
            activeTab === "machines"
              ? "bg-white text-amiste-primary shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          <Coffee size={16} /> Máquinas
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none"
            />
          </div>

          {!isReadOnly && (
            <button
              onClick={handleOpenNew}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
            >
              <Plus size={18} /> Novo Item
            </button>
          )}
        </div>

        {/* Tabela de Estoque */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center text-gray-400 py-10">
              Carregando estoque...
            </p>
          ) : filteredItems.length === 0 ? (
            <p className="text-center text-gray-400 py-10 italic">
              Nenhum item encontrado nesta categoria.
            </p>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                  <th className="pb-3 font-bold pl-4">Produto / Máquina</th>
                  <th className="pb-3 font-bold text-center">Quantidade</th>
                  <th className="pb-3 font-bold">Última Atualização</th>
                  {!isReadOnly && (
                    <th className="pb-3 font-bold text-right pr-4">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-4 font-bold text-gray-700 pl-4">
                      {item.name}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-lg font-bold text-lg inline-block min-w-[3rem] ${item.quantity <= 5 ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-800"}`}
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          {new Date(
                            item.updated_at,
                          ).toLocaleDateString()} às{" "}
                          {new Date(item.updated_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">
                          por {item.updated_by}
                        </span>
                      </div>
                    </td>

                    {!isReadOnly && (
                      <td className="py-4 text-right pr-4">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Apagar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL DE ADIÇÃO/EDIÇÃO --- */}
      {isModalOpen && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                {editingId ? (
                  <Edit2 size={18} className="text-blue-500" />
                ) : (
                  <Plus size={18} className="text-amiste-primary" />
                )}
                {editingId
                  ? "Editar Quantidade"
                  : `Novo Item (${activeTab === "machines" ? "Máquinas" : "Insumos"})`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Selecione o Item do Catálogo
                </label>
                <select
                  required
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amiste-primary outline-none text-sm font-medium disabled:opacity-60"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={editingId !== null} // Bloqueia a troca de nome na edição
                >
                  <option value="">-- Escolha um item --</option>
                  {activeTab === "machines"
                    ? machineOptions.map((m, idx) => (
                        <option key={idx} value={m.name}>
                          {m.name}
                        </option>
                      ))
                    : supplyOptions.map((s, idx) => (
                        <option key={idx} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                </select>
                {(!machineOptions.length && activeTab === "machines") ||
                (!supplyOptions.length && activeTab === "supplies") ? (
                  <p className="text-[10px] text-red-500 mt-1">
                    Nenhum item cadastrado no catálogo principal.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Quantidade Atual
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none text-lg font-bold text-gray-800"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {saving ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Save size={16} /> Salvar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
