import {
  Search,
  Plus,
  Coffee,
  ImageIcon,
  Layers,
  Trash2,
  Settings,
} from "lucide-react";

export function MachinesList({
  permissions,
  loading,
  filteredMachines,
  searchTerm,
  setSearchTerm,
  handleNew,
  handleEdit,
  handleDelete,
  handleOpenConfigs,
}) {
  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Catálogo de Máquinas
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie modelos e configurações técnicas.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
              placeholder="Buscar máquina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {permissions.canManageMachines && (
            <button
              onClick={handleNew}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1"
            >
              <Plus size={20} />{" "}
              <span className="hidden md:inline">Nova Máquina</span>
            </button>
          )}
        </div>
      </div>

      {/* GRID DE MÁQUINAS */}
      {loading ? (
        <p className="text-center text-gray-400 py-10">
          Carregando catálogo...
        </p>
      ) : filteredMachines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 text-center animate-fade-in mx-auto max-w-2xl mt-8">
          <div className="bg-gray-50 p-6 rounded-full mb-4">
            <Coffee size={48} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            Nenhuma máquina encontrada
          </h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-8 text-sm">
            Não encontramos nenhum equipamento.
          </p>
          {permissions.canManageMachines && (
            <button
              onClick={handleNew}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1"
            >
              <Plus size={20} /> Cadastrar Máquina
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMachines.map((machine) => {
            const isMultiModel = machine.models && machine.models.length > 0;
            return (
              <div
                key={machine.id}
                onClick={() => handleEdit(machine)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-1"
              >
                <div className="h-56 bg-gray-50 relative flex items-center justify-center p-6">
                  <div className="absolute inset-0 bg-amiste-primary/0 group-hover:bg-amiste-primary/5 transition-colors duration-300"></div>
                  {machine.photo_url ? (
                    <img
                      src={machine.photo_url}
                      className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-gray-300">
                      <ImageIcon size={48} />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex gap-1">
                    {isMultiModel ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded border bg-purple-50 text-purple-700 border-purple-100 flex items-center gap-1">
                        <Layers size={10} /> +Modelos
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded border ${
                          machine.voltage === "220v"
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-blue-50 text-blue-700 border-blue-100"
                        }`}
                      >
                        {machine.voltage}
                      </span>
                    )}
                  </div>

                  {permissions.canManageMachines && (
                    <button
                      onClick={(e) => handleDelete(machine.id, e)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 z-10"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">
                    {machine.name}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-4">
                    {machine.brand}
                  </p>

                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => handleOpenConfigs(machine, e)}
                      className="w-full py-2 bg-gray-50 hover:bg-amiste-primary hover:text-white text-gray-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Settings size={16} /> Configurações
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
