import { useEffect, useState, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import {
  Search,
  Tag,
  Coffee,
  AlertCircle,
  Edit2,
  Check,
  X,
  DollarSign,
  ShoppingCart, // <--- Novo ícone para empty state
} from "lucide-react";

export function PriceList() {
  const { userProfile } = useContext(AuthContext);
  const [machines, setMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Estados para edição rápida
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");

  const canEditPrice = ["DEV", "Dono", "Comercial", "Vendedor"].includes(
    userProfile?.role,
  );

  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    const { data } = await supabase.from("machines").select("*").order("name");
    if (data) setMachines(data);
    setLoading(false);
  }

  async function handleUpdatePrice(id) {
    const finalPrice = editPrice === "" ? 0 : parseFloat(editPrice);
    try {
      const { error } = await supabase
        .from("machines")
        .update({ price: finalPrice })
        .eq("id", id);

      if (error) throw error;

      setMachines(
        machines.map((m) => (m.id === id ? { ...m, price: finalPrice } : m)),
      );
      setEditingId(null);
    } catch (error) {
      alert("Erro: " + error.message);
    }
  }

  function startEditing(machine) {
    setEditingId(machine.id);
    setEditPrice(machine.price === 0 ? "" : machine.price);
  }

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatMoney = (val) =>
    val
      ? val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 0,00";

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      {/* CABEÇALHO */}
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-800">
              Tabela de Preços
            </h1>
            <p className="text-gray-500 mt-1">
              Catálogo oficial de venda e consulta rápida.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
              placeholder="Buscar modelo, marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* CONDICIONAL: LOADING ou EMPTY STATE ou GRID */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <Tag size={48} className="mx-auto mb-4 opacity-20" />
            <p>Carregando catálogo...</p>
          </div>
        ) : filteredMachines.length === 0 ? (
          // --- EMPTY STATE (NENHUMA MÁQUINA ENCONTRADA) ---
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 text-center animate-fade-in max-w-2xl mx-auto mt-8">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <ShoppingCart size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              Nenhuma máquina encontrada
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm">
              Não encontramos equipamentos no catálogo. Cadastre máquinas na aba
              "Catálogo Máquinas" para definir preços.
            </p>
          </div>
        ) : (
          // --- GRID DE PREÇOS ---
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMachines.map((machine) => (
              <div
                key={machine.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1 relative"
              >
                {/* Imagem */}
                <div className="h-56 bg-gray-50 p-6 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-amiste-primary/0 group-hover:bg-amiste-primary/5 transition-colors duration-300"></div>
                  {machine.photo_url ? (
                    <img
                      src={machine.photo_url}
                      className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <Coffee size={48} className="text-gray-300" />
                  )}

                  {/* Badge Marca */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-600 border border-gray-200 uppercase tracking-wide shadow-sm">
                    {machine.brand}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3
                    className="font-bold text-gray-800 text-lg leading-tight mb-1 truncate"
                    title={machine.name}
                  >
                    {machine.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-6 font-medium">
                    {machine.model || "Modelo Padrão"} • {machine.voltage}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-end">
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                          <DollarSign size={10} /> Preço de Venda
                        </p>

                        {editingId === machine.id ? (
                          // MODO EDIÇÃO
                          <div className="flex items-center gap-2 animate-fade-in bg-gray-50 p-1 rounded-lg border border-amiste-primary/30">
                            <span className="text-xs font-bold text-gray-500 ml-1">
                              R$
                            </span>
                            <input
                              autoFocus
                              type="number"
                              className="w-full p-1 bg-transparent border-none outline-none font-bold text-gray-800 text-sm"
                              value={editPrice}
                              placeholder="0.00"
                              onChange={(e) => setEditPrice(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                handleUpdatePrice(machine.id)
                              }
                            />
                            <button
                              onClick={() => handleUpdatePrice(machine.id)}
                              className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors shadow-sm"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          // MODO VISUALIZAÇÃO
                          <div>
                            {machine.price > 0 ? (
                              <div className="text-2xl font-bold text-amiste-primary tracking-tight">
                                {formatMoney(machine.price)}
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-lg font-bold border border-amber-100">
                                <AlertCircle size={14} /> Consultar Estoque
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Botão de Editar (Só se tiver permissão e não estiver editando) */}
                      {canEditPrice && editingId !== machine.id && (
                        <button
                          onClick={() => startEditing(machine)}
                          className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all ml-2"
                          title="Editar Preço"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
