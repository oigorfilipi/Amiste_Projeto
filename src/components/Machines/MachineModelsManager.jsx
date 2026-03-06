import { Layers, Edit2, Trash2, RotateCcw, Plus, Save } from "lucide-react";

export function MachineModelsManager(props) {
  const {
    modelsList,
    editingModelIndex,
    handleEditModel,
    removeModel,
    handleCancelEditModel,
    tempModel,
    setTempModel,
    handleSaveModel,
    type,
    waterSystem,
    isReadOnly,
  } = props;

  return (
    <section className="space-y-4 animate-fade-in">
      <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
        <Layers size={14} /> Gerenciar Modelos
      </h3>

      {modelsList.length > 0 && (
        <div className="space-y-2 mb-6">
          {modelsList.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 border rounded-xl ${editingModelIndex === idx ? "bg-purple-50 border-purple-200 ring-1 ring-purple-200" : "bg-gray-50 border-gray-200"}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {m.photo_url && (
                  <img
                    src={m.photo_url}
                    className="w-8 h-8 object-contain rounded bg-white border shrink-0"
                  />
                )}
                <span className="font-bold text-sm text-gray-800 truncate">
                  {m.name}
                </span>
                {m.voltage && (
                  <span className="text-[10px] text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-100 hidden sm:inline-block">
                    {m.voltage}
                  </span>
                )}
              </div>
              {!isReadOnly && (
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEditModel(idx)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeModel(idx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isReadOnly && (
        <div
          className={`p-4 rounded-xl border transition-all ${editingModelIndex !== null ? "bg-purple-50 border-purple-200 ring-2 ring-purple-100" : "bg-gray-50 border-gray-200"}`}
        >
          <div className="flex justify-between items-center mb-3">
            <h4
              className={`text-sm font-bold ${editingModelIndex !== null ? "text-purple-800" : "text-gray-700"}`}
            >
              {editingModelIndex !== null
                ? "Editando Variação"
                : "Adicionar Variação"}
            </h4>
            {editingModelIndex !== null && (
              <button
                type="button"
                onClick={handleCancelEditModel}
                className="text-xs font-bold text-purple-600 hover:bg-purple-100 px-2 py-1 rounded flex items-center gap-1"
              >
                <RotateCcw size={12} /> Cancelar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">
                Nome do Modelo
              </label>
              <input
                className="w-full p-2 border rounded-lg text-sm outline-none focus:border-purple-400"
                placeholder="Ex: 15 Litros"
                value={tempModel.name}
                onChange={(e) =>
                  setTempModel({ ...tempModel, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">
                Foto Específica (URL)
              </label>
              <input
                className="w-full p-2 border rounded-lg text-sm bg-white"
                placeholder="Deixe vazio para usar a do pai"
                value={tempModel.photo_url}
                onChange={(e) =>
                  setTempModel({
                    ...tempModel,
                    photo_url: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">
                Vídeo Específico (URL)
              </label>
              <input
                className="w-full p-2 border rounded-lg text-sm bg-white"
                placeholder="Deixe vazio para usar o do pai"
                value={tempModel.video_url}
                onChange={(e) =>
                  setTempModel({
                    ...tempModel,
                    video_url: e.target.value,
                  })
                }
              />
            </div>

            <div className="h-px bg-gray-200 md:col-span-2 my-2"></div>
            <p className="md:col-span-2 text-xs text-gray-400 italic">
              Campos técnicos (Deixe vazio para herdar do Pai)
            </p>

            <input
              className="w-full p-2 border rounded-lg text-sm"
              placeholder="Voltagem (Ex: 220v)"
              value={tempModel.voltage}
              onChange={(e) =>
                setTempModel({
                  ...tempModel,
                  voltage: e.target.value,
                })
              }
            />
            <input
              className="w-full p-2 border rounded-lg text-sm"
              placeholder="Peso (Ex: 5kg)"
              value={tempModel.weight}
              onChange={(e) =>
                setTempModel({ ...tempModel, weight: e.target.value })
              }
            />
            <input
              className="w-full p-2 border rounded-lg text-sm"
              placeholder="Dimensões (LxAxP)"
              value={tempModel.dimensions}
              onChange={(e) =>
                setTempModel({
                  ...tempModel,
                  dimensions: e.target.value,
                })
              }
            />

            {type !== "Coado" && type !== "Moedor" && (
              <div className="md:col-span-2">
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">
                  Sistema de Abastecimento
                </label>
                <select
                  className="w-full p-2 border rounded-lg text-sm bg-white outline-none"
                  value={tempModel.water_system || ""}
                  onChange={(e) =>
                    setTempModel({
                      ...tempModel,
                      water_system: e.target.value,
                    })
                  }
                >
                  <option value="">Padrão do Pai ({waterSystem})</option>
                  <option value="Reservatório">Somente Tanque</option>
                  <option value="Rede Hídrica">Somente Rede</option>
                </select>
              </div>
            )}

            {(type === "Coado" || type === "Moedor") && (
              <input
                className="w-full p-2 border rounded-lg text-sm"
                placeholder={
                  type === "Moedor"
                    ? "Capacidade Cúpula"
                    : "Capacidade (Xícaras)"
                }
                value={tempModel.cups_capacity || ""}
                onChange={(e) =>
                  setTempModel({
                    ...tempModel,
                    cups_capacity: e.target.value,
                  })
                }
              />
            )}
            {type === "Coado" && (
              <input
                className="w-full p-2 border rounded-lg text-sm"
                placeholder="Tipo de Filtro"
                value={tempModel.filter_type || ""}
                onChange={(e) =>
                  setTempModel({
                    ...tempModel,
                    filter_type: e.target.value,
                  })
                }
              />
            )}
            {type === "Café em Grãos" && (
              <input
                className="w-full p-2 border rounded-lg text-sm"
                placeholder="Capacidade Borras"
                value={tempModel.dregs_capacity || ""}
                onChange={(e) =>
                  setTempModel({
                    ...tempModel,
                    dregs_capacity: e.target.value,
                  })
                }
              />
            )}
            {type !== "Coado" && type !== "Moedor" && (
              <input
                className="w-full p-2 border rounded-lg text-sm"
                placeholder="Tanque de Água (Litros)"
                value={tempModel.water_tank_size || ""}
                onChange={(e) =>
                  setTempModel({
                    ...tempModel,
                    water_tank_size: e.target.value,
                  })
                }
              />
            )}
          </div>
          <button
            type="button"
            onClick={handleSaveModel}
            className={`mt-4 w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 text-white transition-all active:scale-[0.98] ${editingModelIndex !== null ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {editingModelIndex !== null ? (
              <>
                <Save size={16} /> Salvar Alterações
              </>
            ) : (
              <>
                <Plus size={16} /> Adicionar à Lista
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
