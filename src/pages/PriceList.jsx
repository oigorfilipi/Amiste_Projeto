import { useEffect, useState, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  Search,
  Tag,
  Coffee,
  AlertCircle,
  Edit2,
  Check,
  X,
  DollarSign,
  ShoppingCart,
  Layers,
} from "lucide-react";

export function PriceList() {
  const { permissions } = useContext(AuthContext);
  const [machines, setMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Estados para edição rápida
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");

  // Permissão baseada no novo sistema
  const canEditPrice = permissions?.Financeiro === "Admin";

  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    try {
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .order("name");
      if (error) throw error;
      if (data) setMachines(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar tabela de preços.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePrice(machineId, modelIndex = null) {
    if (!canEditPrice) return toast.error("Sem permissão para alterar preços.");

    const finalPrice = editPrice === "" ? 0 : parseFloat(editPrice);

    try {
      if (modelIndex === null) {
        // Atualiza preço da máquina PAI
        const { error } = await supabase
          .from("machines")
          .update({ price: finalPrice })
          .eq("id", machineId);
        if (error) throw error;

        setMachines(
          machines.map((m) =>
            m.id === machineId ? { ...m, price: finalPrice } : m,
          ),
        );
      } else {
        // Atualiza preço do MODELO FILHO
        const machineToUpdate = machines.find((m) => m.id === machineId);
        if (!machineToUpdate) return;

        const newModels = [...machineToUpdate.models];
        newModels[modelIndex] = { ...newModels[modelIndex], price: finalPrice };

        const { error } = await supabase
          .from("machines")
          .update({ models: newModels })
          .eq("id", machineId);
        if (error) throw error;

        setMachines(
          machines.map((m) =>
            m.id === machineId ? { ...m, models: newModels } : m,
          ),
        );
      }

      setEditingId(null);
      toast.success("Preço atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar preço: " + error.message);
    }
  }

  function startEditing(idUnico, currentPrice) {
    setEditingId(idUnico);
    setEditPrice(
      currentPrice === undefined || currentPrice === 0 ? "" : currentPrice,
    );
  }

  // Achata a lista: Cria uma linha para o pai e linhas para os filhos
  const flattenedList = [];
  machines.forEach((m) => {
    // Adiciona o Pai
    flattenedList.push({
      ...m,
      uniqueId: m.id.toString(),
      isModel: false,
      displayName: m.name,
      displayPrice: m.price,
    });

    // Se tiver modelos, adiciona os Filhos
    if (m.models && m.models.length > 0) {
      m.models.forEach((mod, idx) => {
        flattenedList.push({
          ...m,
          uniqueId: `${m.id}-${idx}`,
          isModel: true,
          modelIndex: idx,
          displayName: `${m.name} - ${mod.name}`,
          displayPrice: mod.price,
        });
      });
    }
  });

  const filteredItems = flattenedList.filter(
    (item) =>
      item.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatMoney = (val) =>
    val
      ? val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 0,00";

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">
              Tabela de Preços
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
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

        {/* LOADING & EMPTY STATES */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <Tag size={48} className="mx-auto mb-4 opacity-20 animate-pulse" />
            <p>Carregando catálogo...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center animate-fade-in max-w-2xl mx-auto mt-4">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <ShoppingCart size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              Nenhuma máquina encontrada
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm px-4">
              Não encontramos equipamentos no catálogo. Cadastre máquinas na aba
              "Catálogo Máquinas" para definir preços.
            </p>
          </div>
        ) : (
          /* GRID RESPONSIVO */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.uniqueId}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1 relative ${
                  item.isModel
                    ? "border-purple-100 ring-1 ring-purple-50"
                    : "border-gray-100"
                }`}
              >
                {/* Imagem */}
                <div className="h-48 bg-gray-50 p-6 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-amiste-primary/0 group-hover:bg-amiste-primary/5 transition-colors duration-300"></div>

                  {/* Badge de Variação */}
                  {item.isModel && (
                    <div className="absolute top-3 left-3 bg-purple-100 text-purple-700 px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm z-10">
                      <Layers size={10} /> Variação
                    </div>
                  )}

                  {/* Lógica de Foto (Filho ou Pai) */}
                  {item.isModel && item.models[item.modelIndex].photo_url ? (
                    <img
                      src={item.models[item.modelIndex].photo_url}
                      className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : item.photo_url ? (
                    <img
                      src={item.photo_url}
                      className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <Coffee size={48} className="text-gray-300" />
                  )}

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-600 border border-gray-200 uppercase tracking-wide shadow-sm">
                    {item.brand}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  <h3
                    className="font-bold text-gray-800 text-lg leading-tight mb-1 truncate"
                    title={item.displayName}
                  >
                    {item.displayName}
                  </h3>
                  <p className="text-xs text-gray-500 mb-6 font-medium truncate">
                    {item.isModel
                      ? `Modelo: ${item.models[item.modelIndex].name}`
                      : `${item.model || "Modelo Padrão"}`}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex items-center gap-1">
                      <DollarSign size={10} /> Preço de Venda
                    </p>

                    <div className="flex justify-between items-end min-h-[40px]">
                      {editingId === item.uniqueId ? (
                        // MODO EDIÇÃO
                        <div className="flex items-center gap-2 animate-fade-in w-full">
                          <div className="relative flex-1">
                            <span className="absolute left-2 top-2 text-xs font-bold text-gray-400">
                              R$
                            </span>
                            <input
                              autoFocus
                              type="number"
                              className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-amiste-primary rounded-lg outline-none font-bold text-gray-800 text-sm"
                              value={editPrice}
                              placeholder="0.00"
                              onChange={(e) => setEditPrice(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                handleUpdatePrice(
                                  item.id,
                                  item.isModel ? item.modelIndex : null,
                                )
                              }
                            />
                          </div>

                          <button
                            onClick={() =>
                              handleUpdatePrice(
                                item.id,
                                item.isModel ? item.modelIndex : null,
                              )
                            }
                            className="h-8 w-8 flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="h-8 w-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        // MODO VISUALIZAÇÃO
                        <>
                          <div>
                            {item.displayPrice > 0 ? (
                              <div className="text-2xl font-bold text-amiste-primary tracking-tight">
                                {formatMoney(item.displayPrice)}
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-lg font-bold border border-amber-100">
                                <AlertCircle size={14} /> Consultar
                              </div>
                            )}
                          </div>

                          {canEditPrice && (
                            <button
                              onClick={() =>
                                startEditing(item.uniqueId, item.displayPrice)
                              }
                              className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
                              title="Editar Preço"
                            >
                              <Edit2 size={18} />
                            </button>
                          )}
                        </>
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
