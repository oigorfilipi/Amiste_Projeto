import { useEffect, useState, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  Search,
  Package,
  Edit2,
  Check,
  X,
  DollarSign,
  ShoppingCart,
} from "lucide-react";

export function SupplyPriceList() {
  const { userProfile } = useContext(AuthContext);
  const [supplies, setSupplies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");

  const canEditPrice = ["DEV", "Dono", "Comercial", "Vendedor"].includes(
    userProfile?.role,
  );

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
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar lista de preços.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePrice(id) {
    const finalPrice = editPrice === "" ? 0 : parseFloat(editPrice);
    try {
      const { error } = await supabase
        .from("supplies")
        .update({ price: finalPrice })
        .eq("id", id);

      if (error) throw error;

      setSupplies(
        supplies.map((s) => (s.id === id ? { ...s, price: finalPrice } : s)),
      );
      setEditingId(null);
      toast.success("Preço atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar: " + error.message);
    }
  }

  const filteredSupplies = supplies.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatMoney = (val) =>
    val
      ? val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 0,00";

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      {/* Ajuste de Padding: px-4 no mobile */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">
              Preços de Insumos
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Catálogo de valores para venda.
            </p>
          </div>

          {/* Busca (Input maior para toque) */}
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={20}
            />
            <input
              className="w-full pl-12 h-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none shadow-sm transition-all"
              placeholder="Buscar por nome ou marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* CONDICIONAL: LOADING ou EMPTY STATE ou GRID */}
        {loading ? (
          <p className="text-center text-gray-400 py-20 flex flex-col items-center gap-2">
            <Package className="animate-bounce opacity-50" size={32} />
            Carregando preços...
          </p>
        ) : filteredSupplies.length === 0 ? (
          // --- EMPTY STATE ---
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center animate-fade-in max-w-2xl mx-auto mt-4 mx-4">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <ShoppingCart size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              Nenhum insumo encontrado
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm px-4">
              Não encontramos produtos com esse nome. Tente buscar por outra
              marca ou categoria.
            </p>
          </div>
        ) : (
          // --- GRID DE PREÇOS ---
          // Responsividade refinada: 1 col (mobile), 2 (tablet), 3 (laptop), 4 (desktop)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredSupplies.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              >
                {/* Imagem */}
                <div className="h-48 bg-gray-50 p-6 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-amiste-primary/0 group-hover:bg-amiste-primary/5 transition-colors duration-300"></div>
                  {item.photo_url ? (
                    <img
                      src={item.photo_url}
                      className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                      alt={item.name}
                    />
                  ) : (
                    <Package size={48} className="text-gray-300" />
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-600 border border-gray-200 uppercase shadow-sm">
                    {item.brand}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wide">
                    {item.size}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                      <DollarSign size={10} /> Valor Unitário
                    </p>

                    {/* MODO EDIÇÃO */}
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2 animate-fade-in">
                        <div className="relative flex-1">
                          <span className="absolute left-2 top-2 text-xs font-bold text-gray-400">
                            R$
                          </span>
                          <input
                            autoFocus
                            type="number"
                            className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-amiste-primary rounded-lg outline-none font-bold text-gray-800 text-sm"
                            value={editPrice}
                            placeholder="0.00"
                            onChange={(e) => setEditPrice(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleUpdatePrice(item.id)
                            }
                          />
                        </div>
                        <button
                          onClick={() => handleUpdatePrice(item.id)}
                          className="h-9 w-9 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm transition-colors"
                          title="Salvar"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="h-9 w-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      // MODO VISUALIZAÇÃO
                      <div className="flex justify-between items-end">
                        <div className="text-2xl font-bold text-amiste-primary tracking-tight">
                          {formatMoney(item.price)}
                        </div>
                        {canEditPrice && (
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditPrice(item.price || "");
                            }}
                            className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
                            title="Editar Preço"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                      </div>
                    )}
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
