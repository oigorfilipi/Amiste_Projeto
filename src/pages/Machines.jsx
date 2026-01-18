import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import {
  Coffee,
  Plus,
  Search,
  Save,
  X,
  Trash2,
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  Settings,
  Zap,
} from "lucide-react";

export function Machines() {
  const [view, setView] = useState("list"); // 'list' ou 'form'
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado do Formulário
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    brand: "",
    model: "",
    type: "Grãos",
    voltage: "220v",
    amperage: "10A", // Importante pro Checklist
    water_system: "Reservatório", // Importante pro Checklist
    has_steamer: "Não", // Importante pro Checklist
    color: "",
    dimensions: "",
    reservoirs: "",
    description: "",
    photo_url: "",
  });

  // Carregar dados
  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    setLoading(true);
    const { data } = await supabase.from("machines").select("*").order("name");
    if (data) setMachines(data);
    setLoading(false);
  }

  // --- AÇÕES ---

  function handleNew() {
    setFormData({
      id: null,
      name: "",
      brand: "",
      model: "",
      type: "Grãos",
      voltage: "220v",
      amperage: "10A",
      water_system: "Reservatório",
      has_steamer: "Não",
      color: "",
      dimensions: "",
      reservoirs: "",
      description: "",
      photo_url: "",
    });
    setView("form");
  }

  function handleEdit(machine) {
    setFormData({
      id: machine.id,
      name: machine.name || "",
      brand: machine.brand || "",
      model: machine.model || "",
      type: machine.type || "Grãos",
      voltage: machine.voltage || "220v",
      amperage: machine.amperage || "10A",
      water_system: machine.water_system || "Reservatório",
      has_steamer: machine.has_steamer || "Não",
      color: machine.color || "",
      dimensions: machine.dimensions || "",
      reservoirs: machine.reservoirs || "",
      description: machine.description || "",
      photo_url: machine.photo_url || "",
    });
    setView("form");
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!formData.name) return alert("Preencha o nome da máquina.");

    try {
      const payload = { ...formData };
      delete payload.id; // Não mandamos ID no payload do update/insert

      if (formData.id) {
        // UPDATE
        const { error } = await supabase
          .from("machines")
          .update(payload)
          .eq("id", formData.id);
        if (error) throw error;
        alert("Máquina atualizada!");
      } else {
        // INSERT
        const { error } = await supabase.from("machines").insert(payload);
        if (error) throw error;
        alert("Máquina cadastrada!");
      }

      fetchMachines();
      setView("list");
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Tem certeza? Isso pode quebrar checklists antigos que usam essa máquina.",
      )
    )
      return;
    try {
      const { error } = await supabase
        .from("machines")
        .delete()
        .eq("id", formData.id);
      if (error) throw error;
      alert("Máquina excluída.");
      fetchMachines();
      setView("list");
    } catch (error) {
      alert("Erro ao excluir: " + error.message);
    }
  }

  // Filtro de busca
  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* --- MODO LISTA --- */}
      {view === "list" && (
        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-800">
                Catálogo de Máquinas
              </h1>
              <p className="text-gray-500">
                Gerencie o inventário de equipamentos.
              </p>
            </div>
            <button
              onClick={handleNew}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-1"
            >
              <Plus size={20} /> Nova Máquina
            </button>
          </div>

          {/* Barra de Busca */}
          <div className="relative mb-6">
            <input
              className="w-full p-4 pl-12 border border-gray-200 rounded-xl shadow-sm focus:border-amiste-primary outline-none"
              placeholder="Buscar por nome ou marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-4 text-gray-400" size={20} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {filteredMachines.map((machine) => (
              <div
                key={machine.id}
                onClick={() => handleEdit(machine)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-amiste-primary transition-all group"
              >
                <div className="h-48 bg-gray-50 p-4 flex items-center justify-center relative">
                  {machine.photo_url ? (
                    <img
                      src={machine.photo_url}
                      className="h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <Coffee size={48} className="text-gray-300" />
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 px-2 py-1 text-xs font-bold rounded shadow-sm text-gray-600">
                    {machine.brand}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-lg truncate">
                    {machine.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{machine.model}</p>

                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                      {machine.voltage}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                      {machine.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODO FORMULÁRIO (EDIÇÃO/CRIAÇÃO) --- */}
      {view === "form" && (
        <div className="p-4 md:p-8 animate-fade-in">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={() => setView("list")}
                className="text-gray-500 hover:text-gray-800 font-bold flex items-center gap-2"
              >
                <ChevronLeft size={24} /> Voltar
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                {formData.id ? "Editar Máquina" : "Nova Máquina"}
              </h1>
            </div>

            <form
              onSubmit={handleSave}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Coluna Esquerda: Imagem e Infos Básicas */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                  <div className="w-full h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 overflow-hidden relative">
                    {formData.photo_url ? (
                      <img
                        src={formData.photo_url}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center">
                        <ImageIcon size={48} className="mb-2" />
                        <p className="text-sm">Sem imagem</p>
                      </div>
                    )}
                  </div>

                  <label className="block text-left text-sm font-bold mb-1">
                    URL da Imagem
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="w-full p-2 border rounded text-xs"
                      placeholder="https://..."
                      value={formData.photo_url}
                      onChange={(e) =>
                        setFormData({ ...formData, photo_url: e.target.value })
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-left">
                    Cole o link direto da imagem (hospedada no Imgur, Drive,
                    etc).
                  </p>
                </div>

                {formData.id && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 size={18} /> Excluir Máquina
                  </button>
                )}
              </div>

              {/* Coluna Direita: Dados Técnicos */}
              <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 border-b pb-2 mb-6 flex items-center gap-2">
                  <Settings size={18} /> Dados Principais
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Nome Comercial *
                    </label>
                    <input
                      className="w-full p-3 border rounded-lg"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Marca
                    </label>
                    <input
                      className="w-full p-3 border rounded-lg"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Modelo Técnico
                    </label>
                    <input
                      className="w-full p-3 border rounded-lg"
                      value={formData.model}
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Categoria
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg bg-white"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option>Grãos</option>
                      <option>Solúvel</option>
                      <option>Multibebidas</option>
                      <option>Profissional</option>
                      <option>Vending</option>
                    </select>
                  </div>
                </div>

                <h3 className="font-bold text-amiste-primary border-b pb-2 mb-6 flex items-center gap-2">
                  <Zap size={18} /> Especificações (Usado no Checklist)
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Voltagem
                    </label>
                    <select
                      className="w-full p-2 border rounded bg-gray-50"
                      value={formData.voltage}
                      onChange={(e) =>
                        setFormData({ ...formData, voltage: e.target.value })
                      }
                    >
                      <option>220v</option>
                      <option>110v</option>
                      <option>Bivolt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Amperagem
                    </label>
                    <select
                      className="w-full p-2 border rounded bg-gray-50"
                      value={formData.amperage}
                      onChange={(e) =>
                        setFormData({ ...formData, amperage: e.target.value })
                      }
                    >
                      <option>10A</option>
                      <option>20A</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Abast. Hídrico
                    </label>
                    <select
                      className="w-full p-2 border rounded bg-gray-50"
                      value={formData.water_system}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          water_system: e.target.value,
                        })
                      }
                    >
                      <option>Reservatório</option>
                      <option>Rede Hídrica</option>
                      <option>Ambos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      Bico Vapor?
                    </label>
                    <select
                      className="w-full p-2 border rounded bg-gray-50"
                      value={formData.has_steamer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          has_steamer: e.target.value,
                        })
                      }
                    >
                      <option>Não</option>
                      <option>Sim</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold mb-1">Cor</label>
                    <input
                      className="w-full p-3 border rounded-lg"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Dimensões
                    </label>
                    <input
                      className="w-full p-3 border rounded-lg"
                      placeholder="AxLxP mm"
                      value={formData.dimensions}
                      onChange={(e) =>
                        setFormData({ ...formData, dimensions: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Reservatórios
                    </label>
                    <input
                      className="w-full p-3 border rounded-lg"
                      placeholder="Ex: 1 Grão, 2 Solúveis"
                      value={formData.reservoirs}
                      onChange={(e) =>
                        setFormData({ ...formData, reservoirs: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">
                    Descrição Comercial
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg h-32"
                    placeholder="Texto que aparecerá no Portfólio..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  ></textarea>
                </div>

                <div className="flex justify-end pt-6 mt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg mr-4"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2"
                  >
                    <Save size={20} /> Salvar Dados
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
