import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  Database,
  Plus,
  Search,
  Package,
  Coffee,
  Clock,
  Edit2,
  Trash2,
} from "lucide-react";
import clsx from "clsx";

export function Stock() {
  const { permissions } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("supplies"); // 'supplies' ou 'machines'
  const [searchTerm, setSearchTerm] = useState("");

  // MODO DE LEITURA (Read-Only)
  const isReadOnly = permissions?.Contagem === "Read";

  // Dados simulados para a interface inicial (depois ligamos ao Supabase)
  const [items, setItems] = useState([
    {
      id: 1,
      type: "supplies",
      name: "Café em Grão Gourmet 1kg",
      quantity: 45,
      lastModified: "2026-02-23",
      modifiedBy: "João Silva",
    },
    {
      id: 2,
      type: "machines",
      name: "Saeco Lirika",
      quantity: 12,
      lastModified: "2026-02-21",
      modifiedBy: "Maria Souza",
    },
  ]);

  const filteredItems = items.filter(
    (item) =>
      item.type === activeTab &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
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
              : "text-gray-500",
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
              : "text-gray-500",
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

          {/* Só mostra botão novo se tiver permissão ALL */}
          {!isReadOnly && (
            <button className="bg-amiste-primary hover:bg-amiste-secondary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors">
              <Plus size={18} /> Novo Item
            </button>
          )}
        </div>

        {/* Tabela de Estoque */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-3 font-bold">Produto</th>
                <th className="pb-3 font-bold text-center">Quantidade</th>
                <th className="pb-3 font-bold">Última Atualização</th>

                {/* Coluna de ações some para quem é Read */}
                {!isReadOnly && (
                  <th className="pb-3 font-bold text-right">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="py-4 font-bold text-gray-700">{item.name}</td>
                  <td className="py-4 text-center">
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg font-bold text-lg">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="py-4">
                    <button className="text-left group flex flex-col">
                      <span className="text-xs font-bold text-gray-800 group-hover:text-amiste-primary transition-colors flex items-center gap-1">
                        <Clock size={12} /> {item.lastModified}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        por {item.modifiedBy}
                      </span>
                    </button>
                  </td>

                  {/* Botões de ação somem para quem é Read */}
                  {!isReadOnly && (
                    <td className="py-4 text-right">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-1">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
