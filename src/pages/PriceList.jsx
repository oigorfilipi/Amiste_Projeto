import { useEffect, useState, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import { Search, Tag, Coffee, AlertCircle } from "lucide-react";

export function PriceList() {
  const { permissions } = useContext(AuthContext);
  const [machines, setMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Estados para edição rápida (Só para quem pode gerenciar máquinas)
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    const { data } = await supabase.from("machines").select("*").order("name");

    if (data) setMachines(data);
    setLoading(false);
  }

  // Função para salvar preço (Inline edit)
  async function handleUpdatePrice(id) {
    if (!editPrice) return setEditingId(null);

    try {
      const { error } = await supabase
        .from("machines")
        .update({ price: parseFloat(editPrice) })
        .eq("id", id);

      if (error) throw error;

      alert("Preço atualizado!");
      setEditingId(null);
      fetchMachines();
    } catch (error) {
      alert("Erro: " + error.message);
    }
  }

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatMoney = (val) =>
    val
      ? val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "Consulte";

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Tabela de Preços
          </h1>
          <p className="text-gray-500">
            Catálogo rápido para atendimento ao cliente.
          </p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            className="w-full pl-10 p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
            placeholder="Buscar por modelo ou marca..."
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
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-600 border border-gray-200">
                  {machine.brand}
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">
                  {machine.name}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  {machine.model} • {machine.voltage}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">
                      Preço Venda
                    </p>

                    {/* Lógica de Edição Rápida (Só quem gerencia máquinas pode mudar preço aqui) */}
                    {editingId === machine.id &&
                    permissions.canManageMachines ? (
                      <div className="flex gap-1 mt-1">
                        <input
                          type="number"
                          autoFocus
                          className="w-24 p-1 border rounded text-sm"
                          placeholder={machine.price}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                        <button
                          onClick={() => handleUpdatePrice(machine.id)}
                          className="bg-green-500 text-white p-1 rounded text-xs"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-red-500 text-white p-1 rounded text-xs"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`text-2xl font-bold ${machine.price > 0 ? "text-amiste-primary" : "text-gray-400"}`}
                        onDoubleClick={() => {
                          if (permissions.canManageMachines) {
                            // Duplo clique para editar se tiver permissão
                            setEditingId(machine.id);
                            setEditPrice(machine.price);
                          }
                        }}
                        title={
                          permissions.canManageMachines
                            ? "Duplo clique para editar preço"
                            : ""
                        }
                      >
                        {formatMoney(machine.price)}
                      </div>
                    )}
                  </div>

                  {/* Tag Visual */}
                  <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center text-amiste-primary">
                    <Tag size={20} />
                  </div>
                </div>

                {machine.price === 0 && (
                  <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded flex items-center gap-2">
                    <AlertCircle size={12} /> Consultar estoque/preço
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
