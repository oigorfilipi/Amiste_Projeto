import {
  Zap,
  Scale,
  MapPin,
  Droplet,
  Database,
  Clock,
  Filter,
  Trash,
} from "lucide-react";

export function MachineTechSpecs(props) {
  const {
    type,
    weight,
    setWeight,
    environmentRecommendation,
    setEnvironmentRecommendation,
    waterSystem,
    setWaterSystem,
    hasSewage,
    setHasSewage,
    hasPayment,
    setHasPayment,
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
    isReadOnly,
  } = props;

  return (
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
            onChange={(e) => setEnvironmentRecommendation(e.target.value)}
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

            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer w-max">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-amiste-primary rounded border-gray-300 focus:ring-amiste-primary"
                  checked={hasPayment}
                  onChange={(e) =>
                    !isReadOnly && setHasPayment(e.target.checked)
                  }
                  disabled={isReadOnly}
                />
                <span className="text-sm font-bold text-gray-700">
                  Possui Sistema de Pagamento?
                </span>
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
                !isReadOnly && setSimultaneousDispenser(e.target.checked)
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
              onChange={(e) => setExtraReservoirCapacity(e.target.value)}
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
                    !isReadOnly && setHasExtraReservoir(!e.target.checked)
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
                    onChange={(e) => setExtraReservoirCapacity(e.target.value)}
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
  );
}
