import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import {
  Edit2,
  Plus,
  X,
  Save,
  ImageIcon,
  Youtube,
  Layers,
  RotateCcw,
  Trash2,
  Zap,
  Scale,
  MapPin,
  Droplet,
  Database,
  Clock,
  Filter,
  Trash,
} from "lucide-react";
import { MODEL_OPTIONS, BRAND_OPTIONS, TYPE_OPTIONS } from "./MachinesUI";

export function MachineForm(props) {
  const { permissions } = useContext(AuthContext);

  // MODO DE LEITURA (Read-Only)
  const isReadOnly = permissions?.Maquinas === "Read";

  const {
    showModal,
    setShowModal,
    editingId,
    handleSave,
    loading,
    uploading,
    name,
    setName,
    description,
    setDescription,
    imageMode,
    setImageMode,
    photoUrl,
    setPhotoUrl,
    handleImageUpload,
    videoUrl,
    setVideoUrl,
    brand,
    setBrand,
    customBrand,
    setCustomBrand,
    type,
    setType,
    customType,
    setCustomType,
    hasVariations,
    setHasVariations,
    modelsList,
    editingModelIndex,
    handleEditModel,
    removeModel,
    handleCancelEditModel,
    tempModel,
    setTempModel,
    handleSaveModel,
    weight,
    setWeight,
    environmentRecommendation,
    setEnvironmentRecommendation,
    waterSystem,
    setWaterSystem,
    hasSewage,
    setHasSewage,
    waterTankSize,
    setWaterTankSize,
    extractionCups,
    setExtractionCups,
    extractionNozzles,
    setExtractionNozzles,
    drinkCombinations,
    setDrinkCombinations,
    doseAutonomy,
    setDoseAutonomy,
    trayCount,
    setTrayCount,
    selectionCount,
    setSelectionCount,
    simultaneousDispenser,
    setSimultaneousDispenser,
    dregsCapacity,
    setDregsCapacity,
    cupsCapacity,
    setCupsCapacity,
    filterType,
    setFilterType,
    extraReservoirCapacity,
    setExtraReservoirCapacity,
    hasExtraReservoir,
    setHasExtraReservoir,
    reservoirCount,
    setReservoirCount,
    voltage,
    setVoltage,
    amperage,
    setAmperage,
    dimensions,
    setDimensions,
    serialNumber,
    setSerialNumber,
    patrimony,
    handlePatrimonyChange,
  } = props;

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER FIXO */}
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
            {editingId ? (
              <Edit2 size={20} className="text-amiste-primary" />
            ) : (
              <Plus size={20} className="text-amiste-primary" />
            )}
            {editingId ? "Editar Máquina" : "Nova Máquina"}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY SCROLLABLE */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isReadOnly) handleSave(e);
          }}
          className="p-5 md:p-8 space-y-8 overflow-y-auto"
        >
          {isReadOnly && (
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-bold flex items-center gap-2 mb-4">
              Você está em modo de visualização. As edições estão desabilitadas.
            </div>
          )}

          {/* Identificação */}
          <section className="space-y-4">
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
              <ImageIcon size={14} /> Identificação Principal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Nome Comercial *
                </label>
                <input
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Phedra Evo"
                  disabled={isReadOnly}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Descrição Comercial (Padrão)
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none h-24 resize-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              {/* UPLOAD / URL IMAGEM */}
              {!isReadOnly && (
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-3">
                    Foto Principal (Padrão)
                  </label>
                  <div className="flex bg-white rounded-lg p-1 border border-gray-200 mb-3 w-full md:w-1/2">
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${imageMode === "url" ? "bg-amiste-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("file")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${imageMode === "file" ? "bg-amiste-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                      Upload
                    </button>
                  </div>
                  <div className="flex gap-3 items-center">
                    {imageMode === "url" ? (
                      <input
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amiste-primary outline-none"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    ) : (
                      <div className="relative w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="w-full p-2 border border-gray-200 rounded-xl text-sm bg-white file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploading && (
                          <div className="absolute right-3 top-2.5 text-xs text-blue-600 font-bold animate-pulse">
                            Enviando...
                          </div>
                        )}
                      </div>
                    )}
                    {photoUrl && (
                      <div className="w-12 h-12 bg-white border rounded-lg p-1 shrink-0">
                        <img
                          src={photoUrl}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {isReadOnly && photoUrl && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Foto Principal
                  </label>
                  <img
                    src={photoUrl}
                    className="h-32 object-contain bg-gray-50 border rounded-xl"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                  <Youtube size={14} /> Link de Vídeo (Padrão)
                </label>
                <input
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Marca *
                </label>
                <select
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amiste-primary disabled:bg-gray-50 disabled:text-gray-500"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">Selecione...</option>
                  {BRAND_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                  <option value="Outro">Outro</option>
                </select>
                {brand === "Outro" && (
                  <input
                    className="mt-2 w-full p-2 border rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="Digite a marca"
                    disabled={isReadOnly}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Categoria *
                </label>
                <select
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amiste-primary disabled:bg-gray-50 disabled:text-gray-500"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">Selecione...</option>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                  <option value="Outro">Outro</option>
                </select>
                {type === "Outro" && (
                  <input
                    className="mt-2 w-full p-2 border rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Digite a categoria"
                    disabled={isReadOnly}
                  />
                )}
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-100"></div>

          {/* SELEÇÃO: POSSUI MODELOS? */}
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-purple-600">
                <Layers size={20} />
              </div>
              <div>
                <h4 className="font-bold text-purple-900 text-sm">
                  Múltiplos Modelos?
                </h4>
                <p className="text-xs text-purple-700">
                  Ex: 6L, 15L (Variações)
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={hasVariations}
                onChange={(e) =>
                  !isReadOnly && setHasVariations(e.target.checked)
                }
                disabled={isReadOnly}
              />
              <div
                className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isReadOnly ? "opacity-60 cursor-not-allowed" : "peer-checked:bg-purple-600"}`}
              ></div>
            </label>
          </div>

          {hasVariations ? (
            // --- MODO MULTI-MODELOS ---
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

                    {/* Campos de Variação Simplificados */}
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
                          <option value="">
                            Padrão do Pai ({waterSystem})
                          </option>
                          <option value="Reservatório">Somente Tanque</option>
                          <option value="Rede Hídrica">Somente Rede</option>
                        </select>
                      </div>
                    )}

                    {/* Campos Condicionais da Variação */}
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
          ) : (
            // --- MODO ÚNICO ---
            <section className="space-y-4 animate-fade-in">
              <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
                <Zap size={14} /> Especificações Técnicas (Padrão)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                <div>
                  <label className="block text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-1">
                    <Scale size={12} /> Peso (kg)
                  </label>
                  <input
                    className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white disabled:bg-blue-50 disabled:text-blue-500"
                    placeholder="Ex: 35 kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-1">
                    <MapPin size={12} /> Indicação de Ambiente
                  </label>
                  <input
                    className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white disabled:bg-blue-50 disabled:text-blue-500"
                    placeholder="Ex: Escritórios..."
                    value={environmentRecommendation}
                    onChange={(e) =>
                      setEnvironmentRecommendation(e.target.value)
                    }
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              {type !== "Coado" && type !== "Moedor" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      <Droplet size={12} className="inline" /> Abastecimento
                    </label>
                    <div className="flex gap-2">
                      {["Reservatório", "Rede Hídrica"].map((opt) => (
                        <label
                          key={opt}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border flex-1 text-center transition-all ${isReadOnly ? "opacity-70 cursor-not-allowed" : "cursor-pointer"} ${waterSystem === opt ? "bg-blue-500 text-white border-blue-500" : "bg-white border-gray-200 text-gray-500"}`}
                        >
                          <input
                            type="radio"
                            className="hidden"
                            checked={waterSystem === opt}
                            onChange={() => !isReadOnly && setWaterSystem(opt)}
                            disabled={isReadOnly}
                          />
                          {opt === "Reservatório" ? "Tanque" : "Rede"}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Rede de Esgoto
                    </label>
                    <div className="flex gap-2">
                      <label
                        className={`px-3 py-2 rounded-lg text-xs font-bold border flex-1 text-center transition-all ${isReadOnly ? "opacity-70 cursor-not-allowed" : "cursor-pointer"} ${hasSewage ? "bg-green-500 text-white border-green-500" : "bg-white border-gray-200 text-gray-500"}`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          checked={hasSewage}
                          onChange={() => !isReadOnly && setHasSewage(true)}
                          disabled={isReadOnly}
                        />{" "}
                        Sim
                      </label>
                      <label
                        className={`px-3 py-2 rounded-lg text-xs font-bold border flex-1 text-center transition-all ${isReadOnly ? "opacity-70 cursor-not-allowed" : "cursor-pointer"} ${!hasSewage ? "bg-gray-500 text-white border-gray-500" : "bg-white border-gray-200 text-gray-500"}`}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          checked={!hasSewage}
                          onChange={() => !isReadOnly && setHasSewage(false)}
                          disabled={isReadOnly}
                        />{" "}
                        Não
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {type !== "Coado" &&
                type !== "Moedor" &&
                waterSystem === "Reservatório" && (
                  <div className="animate-fade-in bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1">
                      Tamanho do Tanque de Água
                    </label>
                    <input
                      className="w-full p-2 border border-blue-200 rounded-lg text-sm bg-white disabled:bg-blue-50 disabled:text-blue-500"
                      placeholder="Ex: 4 Litros"
                      value={waterTankSize}
                      onChange={(e) => setWaterTankSize(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                )}

              {type === "Profissional" && (
                <div className="animate-fade-in bg-purple-50 p-4 rounded-xl border border-purple-100 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase mb-1">
                      Copos de Extração
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border border-purple-200 rounded-lg text-sm bg-white disabled:bg-purple-50 disabled:text-purple-500"
                      placeholder="Ex: 2"
                      value={extractionCups}
                      onChange={(e) => setExtractionCups(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-800 uppercase mb-1">
                      Bicos de Extração
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border border-purple-200 rounded-lg text-sm bg-white disabled:bg-purple-50 disabled:text-purple-500"
                      placeholder="Ex: 1"
                      value={extractionNozzles}
                      onChange={(e) => setExtractionNozzles(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              )}

              {type === "Multibebidas" && (
                <div className="animate-fade-in bg-indigo-50 p-4 rounded-xl border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-indigo-800 uppercase mb-1">
                      Variedade (Combinações)
                    </label>
                    <input
                      className="w-full p-2 border border-indigo-200 rounded-lg text-sm bg-white disabled:bg-indigo-50 disabled:text-indigo-500"
                      placeholder="Ex: 8 opções"
                      value={drinkCombinations}
                      onChange={(e) => setDrinkCombinations(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-800 uppercase mb-1">
                      Autonomia de Doses
                    </label>
                    <input
                      className="w-full p-2 border border-indigo-200 rounded-lg text-sm bg-white disabled:bg-indigo-50 disabled:text-indigo-500"
                      placeholder="Ex: 50 doses/dia"
                      value={doseAutonomy}
                      onChange={(e) => setDoseAutonomy(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              )}

              {(type === "Snacks" || type === "Vending") && (
                <div className="animate-fade-in bg-pink-50 p-4 rounded-xl border border-pink-100 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-pink-800 uppercase mb-1">
                      Número de Bandejas
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border border-pink-200 rounded-lg text-sm bg-white disabled:bg-pink-50 disabled:text-pink-500"
                      placeholder="Ex: 6"
                      value={trayCount}
                      onChange={(e) => setTrayCount(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-pink-800 uppercase mb-1">
                      Número de Seleções
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border border-pink-200 rounded-lg text-sm bg-white disabled:bg-pink-50 disabled:text-pink-500"
                      placeholder="Ex: 32"
                      value={selectionCount}
                      onChange={(e) => setSelectionCount(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              )}

              {type === "Café em Grãos" && (
                <div className="animate-fade-in bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-4">
                  <label
                    className={`flex items-center gap-3 ${isReadOnly ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 border-gray-300"
                      checked={simultaneousDispenser}
                      onChange={(e) =>
                        !isReadOnly &&
                        setSimultaneousDispenser(e.target.checked)
                      }
                      disabled={isReadOnly}
                    />
                    <span className="text-sm font-bold text-amber-900">
                      Dispensador Simultâneo
                    </span>
                  </label>
                  <div>
                    <label className="block text-xs font-bold text-amber-800 uppercase mb-1 flex items-center gap-1">
                      <Trash size={12} /> Capacidade de Borras
                    </label>
                    <input
                      className="w-full p-2 border border-amber-200 rounded-lg text-sm bg-white disabled:bg-amber-50 disabled:text-amber-500"
                      placeholder="Ex: 15 borras / 1kg"
                      value={dregsCapacity}
                      onChange={(e) => setDregsCapacity(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              )}

              {type === "Coado" && (
                <div className="animate-fade-in bg-orange-50 p-4 rounded-xl border border-orange-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-orange-800 uppercase mb-1 flex items-center gap-1">
                      <Clock size={12} /> Capacidade (Xícaras)
                    </label>
                    <input
                      className="w-full p-2 border border-orange-200 rounded-lg text-sm bg-white disabled:bg-orange-50 disabled:text-orange-500"
                      placeholder="Ex: 100/hora"
                      value={cupsCapacity}
                      onChange={(e) => setCupsCapacity(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-orange-800 uppercase mb-1 flex items-center gap-1">
                      <Filter size={12} /> Tipo de Filtro
                    </label>
                    <input
                      className="w-full p-2 border border-orange-200 rounded-lg text-sm bg-white disabled:bg-orange-50 disabled:text-orange-500"
                      placeholder="Ex: Papel, Metal..."
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              )}

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                {type === "Moedor" ? (
                  <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-orange-800 uppercase flex items-center gap-1">
                        <Database size={12} /> Capacidade Cúpula
                      </label>
                    </div>
                    <input
                      className="w-full p-2 border border-orange-200 rounded-lg text-sm disabled:bg-orange-50 disabled:text-orange-500"
                      placeholder="Ex: 1.5kg"
                      value={extraReservoirCapacity}
                      onChange={(e) =>
                        setExtraReservoirCapacity(e.target.value)
                      }
                      disabled={isReadOnly}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-orange-800 uppercase flex items-center gap-1">
                        <Database size={12} /> Reservatórios de Insumos
                      </label>
                      <label
                        className={`flex items-center gap-2 ${isReadOnly ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-amiste-primary rounded"
                          checked={!hasExtraReservoir}
                          onChange={(e) =>
                            !isReadOnly &&
                            setHasExtraReservoir(!e.target.checked)
                          }
                          disabled={isReadOnly}
                        />
                        <span className="text-xs text-orange-700 font-medium">
                          Não possui
                        </span>
                      </label>
                    </div>

                    {hasExtraReservoir && (
                      <div className="animate-fade-in space-y-3">
                        <div>
                          <label className="block text-[10px] text-orange-600 font-bold mb-1">
                            Quantidade
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            className="w-full p-2 border border-orange-200 rounded-lg text-sm disabled:bg-orange-50 disabled:text-orange-500"
                            placeholder="Qtd (ex: 3)"
                            value={reservoirCount}
                            onChange={(e) => setReservoirCount(e.target.value)}
                            disabled={isReadOnly}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-orange-600 font-bold mb-1">
                            Capidade por Reservatório
                          </label>
                          <input
                            className="w-full p-2 border border-orange-200 rounded-lg text-sm disabled:bg-orange-50 disabled:text-orange-500"
                            placeholder="Ex: 1kg"
                            value={extraReservoirCapacity}
                            onChange={(e) =>
                              setExtraReservoirCapacity(e.target.value)
                            }
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Voltagem
                  </label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                    disabled={isReadOnly}
                  >
                    <option>220v</option>
                    <option>110v</option>
                    <option>Bivolt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Amperagem
                  </label>
                  <div className="flex gap-2 mt-2">
                    {["10A", "20A"].map((opt) => (
                      <label
                        key={opt}
                        className={`flex-1 text-center py-2 rounded-lg text-sm font-bold border transition-all ${isReadOnly ? "cursor-not-allowed opacity-70" : "cursor-pointer"} ${amperage === opt ? "bg-amiste-primary text-white border-amiste-primary" : "bg-white border-gray-200 text-gray-600"}`}
                      >
                        <input
                          type="radio"
                          name="amp"
                          value={opt}
                          checked={amperage === opt}
                          onChange={() => !isReadOnly && setAmperage(opt)}
                          className="hidden"
                          disabled={isReadOnly}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Dimensões (LxAxP)
                  </label>
                  <div className="flex gap-1">
                    <input
                      placeholder="L"
                      className="w-1/3 p-2 border rounded-lg text-center text-sm outline-none focus:border-amiste-primary disabled:bg-gray-50 disabled:text-gray-500"
                      value={dimensions.w}
                      onChange={(e) =>
                        setDimensions({ ...dimensions, w: e.target.value })
                      }
                      disabled={isReadOnly}
                    />
                    <input
                      placeholder="A"
                      className="w-1/3 p-2 border rounded-lg text-center text-sm outline-none focus:border-amiste-primary disabled:bg-gray-50 disabled:text-gray-500"
                      value={dimensions.h}
                      onChange={(e) =>
                        setDimensions({ ...dimensions, h: e.target.value })
                      }
                      disabled={isReadOnly}
                    />
                    <input
                      placeholder="P"
                      className="w-1/3 p-2 border rounded-lg text-center text-sm outline-none focus:border-amiste-primary disabled:bg-gray-50 disabled:text-gray-500"
                      value={dimensions.d}
                      onChange={(e) =>
                        setDimensions({ ...dimensions, d: e.target.value })
                      }
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nº Série
                  </label>
                  <div className="relative">
                    <Database
                      size={16}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <input
                      className="w-full pl-9 p-3 border border-gray-200 rounded-xl outline-none disabled:bg-gray-50 disabled:text-gray-500"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="ABC-123"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Patrimônio
                  </label>
                  <input
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none disabled:bg-gray-50 disabled:text-gray-500"
                    value={patrimony}
                    onChange={handlePatrimonyChange}
                    placeholder="Só números"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </section>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors"
            >
              {isReadOnly ? "Fechar" : "Cancelar"}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-8 py-3 bg-amiste-primary hover:bg-amiste-secondary text-white rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                <Save size={20} /> {loading ? "Salvando..." : "Salvar Máquina"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
