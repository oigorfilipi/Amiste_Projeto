import { useEffect, useState, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import {
  Search,
  Tag,
  Package,
  Edit2,
  Check,
  X,
  DollarSign,
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
    const { data } = await supabase.from("supplies").select("*").order("name");
    if (data) setSupplies(data);
    setLoading(false);
  }

  async function handleUpdatePrice(id) {
    const finalPrice = editPrice === "" ? 0 : parseFloat(editPrice);
    try {
      await supabase
        .from("supplies")
        .update({ price: finalPrice })
        .eq("id", id);
      setSupplies(
        supplies.map((s) => (s.id === id ? { ...s, price: finalPrice } : s)),
      );
      setEditingId(null);
    } catch (error) {
      alert("Erro: " + error.message);
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
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-800">
              Preços de Insumos
            </h1>
            <p className="text-gray-500 mt-1">
              Catálogo de valores para venda de insumos.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none"
              placeholder="Buscar insumo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSupplies.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group hover:-translate-y-1"
            >
              <div className="h-40 bg-gray-50 p-4 flex items-center justify-center relative">
                {item.photo_url ? (
                  <img
                    src={item.photo_url}
                    className="h-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <Package size={40} className="text-gray-300" />
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-600 border border-gray-200 uppercase">
                  {item.brand}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 truncate">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 mb-4 font-medium">
                  {item.size}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                    <DollarSign size={10} /> Venda
                  </p>
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-amiste-primary/30">
                      <span className="text-xs font-bold text-gray-500 ml-1">
                        R$
                      </span>
                      <input
                        autoFocus
                        type="number"
                        className="w-full p-1 bg-transparent outline-none font-bold text-gray-800 text-sm"
                        value={editPrice}
                        placeholder="0.00"
                        onChange={(e) => setEditPrice(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleUpdatePrice(item.id)
                        }
                      />
                      <button
                        onClick={() => handleUpdatePrice(item.id)}
                        className="p-1.5 bg-green-500 text-white rounded"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-gray-200 text-gray-600 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
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
                          className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
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
      </div>
    </div>
  );
}
