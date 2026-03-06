import {
  Search,
  Plus,
  Coffee,
  Layers,
  Trash2,
  Settings,
  Loader2,
  Database,
} from "lucide-react";

export function MachinesList({
  permissions,
  loading,
  deletingId,
  filteredMachines,
  searchTerm,
  setSearchTerm,
  handleNew,
  handleEdit,
  handleDelete,
  handleOpenConfigs,
}) {
  const isReadOnly = permissions?.Maquinas === "Read";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <Coffee className="text-amiste-primary" size={24} />
            </div>
            Catálogo de Máquinas
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Gerencie modelos, especificações e configurações técnicas.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search
              className="absolute left-3.5 top-3 text-gray-400"
              size={20}
            />
            <input
              className="w-full pl-11 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all shadow-sm"
              placeholder="Buscar modelo ou marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {!isReadOnly && (
            <button
              onClick={handleNew}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-1 active:scale-[0.98] shrink-0"
            >
              <Plus size={20} />{" "}
              <span className="hidden md:inline">Nova Máquina</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        // SKELETON
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse flex flex-col h-[320px]"
            >
              <div className="h-48 bg-gray-100"></div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-auto"></div>
                <div className="h-10 bg-gray-50 rounded-lg w-full mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredMachines.length === 0 ? (
        // EMPTY STATE
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center animate-fade-in max-w-2xl mx-auto mt-4 shadow-sm">
          <div className="bg-gray-50 p-6 rounded-full mb-4 border border-gray-100">
            <Database size={48} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Nenhuma máquina encontrada
          </h3>
          <p className="text-gray-400 max-w-sm mx-auto text-sm px-4">
            Não encontramos nenhum equipamento com esse nome. Verifique os
            termos da busca ou cadastre uma nova.
          </p>
        </div>
      ) : (
        // GRID
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredMachines.map((machine) => (
            <div
              key={machine.id}
              onClick={() => handleEdit(machine)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-amiste-primary/30 transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-1"
            >
              {/* Imagem */}
              <div className="h-48 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-amiste-primary/0 group-hover:bg-amiste-primary/5 transition-colors duration-300 z-0"></div>
                {machine.models?.length > 0 && (
                  <div className="absolute top-3 left-3 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-sm z-10">
                    <Layers size={10} /> Multi-Modelos
                  </div>
                )}
                {machine.photo_url ? (
                  <img
                    src={machine.photo_url}
                    className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500 relative z-10 p-2"
                    alt={machine.name}
                  />
                ) : (
                  <Coffee
                    size={48}
                    className="text-gray-300 group-hover:scale-110 transition-transform duration-500 relative z-10"
                  />
                )}

                {!isReadOnly && (
                  <button
                    onClick={(e) => handleDelete(machine.id, e)}
                    disabled={deletingId === machine.id}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 z-20 disabled:opacity-50"
                    title="Excluir"
                  >
                    {deletingId === machine.id ? (
                      <Loader2
                        size={16}
                        className="animate-spin text-red-500"
                      />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                )}
              </div>

              {/* Conteúdo */}
              <div className="p-4 md:p-5 flex-1 flex flex-col bg-white z-20">
                <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 truncate">
                  {machine.name}
                </h3>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-4">
                  {machine.brand}
                </p>

                <div className="mt-auto pt-3 border-t border-gray-50">
                  <button
                    onClick={(e) => handleOpenConfigs(machine, e)}
                    className="w-full py-2.5 bg-gray-50 hover:bg-amiste-primary hover:text-white text-gray-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Settings size={16} /> Configurações
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
