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
} from "lucide-react";

export function PriceList() {
  const { userProfile } = useContext(AuthContext); // Pegamos o perfil para verificar o cargo exato
  const [machines, setMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Estados para edição rápida
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");

  // --- REGRA DE OURO: QUEM MEXE NO PREÇO? ---
  // DEV, Dono, Comercial e Vendedor.
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
    // Se deixar vazio, assume 0
    const finalPrice = editPrice === "" ? 0 : parseFloat(editPrice);

    try {
      const { error } = await supabase
        .from("machines")
        .update({ price: finalPrice })
        .eq("id", id);

      if (error) throw error;

      // Atualiza localmente para não precisar recarregar tudo do banco
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
    setEditPrice(machine.price === 0 ? "" : machine.price); // Se for 0, deixa vazio pra digitar fácil
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
    <div className="animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Tabela de Preços
          </h1>
          <p className="text-gray-500">Catálogo oficial de venda.</p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            className="w-full pl-10 p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
            placeholder="Buscar modelo, marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Carregando catálogo...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMachines.map((machine) => (
            <div
              key={machine.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Imagem */}
              <div className="h-48 bg-gray-50 p-4 flex items-center justify-center relative">
                {machine.photo_url ? (
                  <img
                    src={machine.photo_url}
                    className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Coffee size={48} className="text-gray-300" />
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-600 border border-gray-200 uppercase tracking-wide">
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
                <p className="text-xs text-gray-500 mb-4">
                  {machine.model} • {machine.voltage}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 flex justify-between">
                    Preço de Venda
                    {canEditPrice && editingId !== machine.id && (
                      <span
                        className="text-[9px] text-blue-500 cursor-pointer hover:underline"
                        onClick={() => startEditing(machine)}
                      >
                        Editar Preço
                      </span>
                    )}
                  </p>

                  {/* LÓGICA DE VISUALIZAÇÃO vs EDIÇÃO */}
                  {editingId === machine.id ? (
                    // MODO EDIÇÃO
                    <div className="flex items-center gap-2 animate-fade-in">
                      <span className="text-sm font-bold text-gray-500">
                        R$
                      </span>
                      <input
                        type="number"
                        autoFocus
                        className="w-full p-1 border-b-2 border-amiste-primary outline-none font-bold text-gray-800 bg-transparent"
                        value={editPrice}
                        placeholder="0.00"
                        onChange={(e) => setEditPrice(e.target.value)}
                      />
                      <button
                        onClick={() => handleUpdatePrice(machine.id)}
                        className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        title="Salvar"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        title="Cancelar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    // MODO VISUALIZAÇÃO
                    <div className="flex justify-between items-end">
                      {machine.price > 0 ? (
                        <div className="text-2xl font-bold text-amiste-primary">
                          {formatMoney(machine.price)}
                        </div>
                      ) : (
                        <div className="bg-amber-50 text-amber-700 text-xs px-2 py-1.5 rounded font-bold flex items-center gap-2 border border-amber-100">
                          <AlertCircle size={14} /> Consultar Estoque
                        </div>
                      )}

                      {/* Botão de Lápis Grande (Só aparece se tiver permissão) */}
                      {canEditPrice && (
                        <button
                          onClick={() => startEditing(machine)}
                          className="h-8 w-8 rounded-full bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-400 flex items-center justify-center transition-colors"
                          title="Alterar Preço"
                        >
                          <Edit2 size={16} />
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
  );
}
