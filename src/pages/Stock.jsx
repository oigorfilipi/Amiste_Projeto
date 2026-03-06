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
  Loader2,
  Inbox,
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

  // Estados de Ação
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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
      toast.error("Erro ao carregar o estoque: " + error.message);
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
      console.error("Erro ao carregar opções:", error.message);
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
        toast.success("Estoque atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("stock_items").insert([payload]);
        if (error) throw error;
        toast.success("Item adicionado ao estoque!");
      }
      setIsModalOpen(false);
      await fetchStock();
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  // --- DELETAR ITEM ---
  async function handleDelete(id, name) {
    if (!window.confirm(`Excluir o item "${name}" do controle de estoque?`))
      return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("stock_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Item excluído com sucesso.");
      await fetchStock();
    } catch (error) {
      toast.error("Erro ao excluir: " + error.message);
    } finally {
      setDeletingId(null);
    }
  }

  // Filtra os itens pela aba ativa e pela barra de pesquisa
  const filteredItems = stockItems.filter(
    (item) =>
      item.type === activeTab &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20 relative px-4 md:px-8 pt-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
          <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <Database className="text-amiste-primary" size={24} />
          </div>
          Contagem Geral
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          Gestão e contagem de estoque físico de insumos e máquinas.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1.5 rounded-xl w-full md:w-96 mb-6 shadow-inner">
        <button
          onClick={() => setActiveTab("supplies")}
          className={clsx(
            "flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
            activeTab === "supplies"
              ? "bg-white text-amiste-primary shadow-sm ring-1 ring-black/5"
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
              ? "bg-white text-amiste-primary shadow-sm ring-1 ring-black/5"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          <Coffee size={16} /> Máquinas
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3.5 top-3 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amiste-primary outline-none transition-colors text-sm font-medium"
            />
          </div>

          {!isReadOnly && (
            <button
              onClick={handleOpenNew}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md hover:-translate-y-0.5"
            >
              <Plus size={18} /> Novo Item
            </button>
          )}
        </div>

        {/* Tabela de Estoque */}
        <div className="overflow-x-auto">
          {loading ? (
            // Skeleton de Tabela
            <div className="space-y-4 py-4 animate-pulse">
              <div className="flex justify-between pb-2 border-b border-gray-100">
                <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/6 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-b border-gray-50"
                >
                  <div className="w-1/3 h-5 bg-gray-100 rounded"></div>
                  <div className="w-12 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="w-1/4 h-8 bg-gray-50 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 mt-2">
              <div className="bg-white p-4 rounded-full mb-3 shadow-sm border border-gray-100">
                <Inbox size={32} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium">
                Nenhum item encontrado nesta categoria.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400">
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
                    className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="py-4 font-bold text-gray-700 pl-4">
                      {item.name}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-lg font-bold text-lg inline-block min-w-[3rem] ${item.quantity <= 5 ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-100 text-gray-800 border border-gray-200"}`}
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                          <Clock size={14} className="text-gray-400" />
                          {new Date(item.updated_at).toLocaleDateString(
                            "pt-BR",
                          )}{" "}
                          às{" "}
                          {new Date(item.updated_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-1 font-bold">
                          por{" "}
                          <span className="text-amiste-primary">
                            {item.updated_by}
                          </span>
                        </span>
                      </div>
                    </td>

                    {!isReadOnly && (
                      <td className="py-4 text-right pr-4">
                        <div className="flex justify-end gap-1.5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            disabled={deletingId === item.id}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-colors disabled:opacity-50"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            disabled={deletingId === item.id}
                            className="p-2.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-colors disabled:opacity-50"
                            title="Apagar"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                {editingId ? (
                  <Edit2 size={20} className="text-blue-500" />
                ) : (
                  <Plus size={20} className="text-amiste-primary" />
                )}
                {editingId
                  ? "Editar Quantidade"
                  : `Novo Item (${activeTab === "machines" ? "Máquinas" : "Insumos"})`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Item do Catálogo
                </label>
                <select
                  required
                  className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amiste-primary outline-none text-sm font-medium disabled:opacity-60 transition-all"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={editingId !== null} // Bloqueia a troca de nome na edição
                >
                  <option value="">-- Selecione uma opção --</option>
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
                  <p className="text-[10px] text-red-500 mt-2 font-bold bg-red-50 p-2 rounded-lg">
                    ⚠️ Nenhum item cadastrado no catálogo principal.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Quantidade Atual
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none text-xl font-black text-gray-800 transition-all text-center"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  disabled={saving}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Salvando
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Salvar Estoque
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
