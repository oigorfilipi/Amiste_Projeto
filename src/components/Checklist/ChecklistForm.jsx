import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  ArrowLeft,
  XCircle,
  Save,
  Check,
  Calendar,
  Coffee,
  Layers,
  Wrench,
  Package,
  MapPin,
  Zap,
  Droplet,
  FileText,
} from "lucide-react";
import { FormSection, RadioGroup, ToggleCard } from "./ChecklistUI";

export function ChecklistForm(props) {
  const { permissions } = useContext(AuthContext);

  // Se a permissão for apenas Read, ativamos o modo de visualização.
  const isReadOnly = permissions?.Checklist === "Read";

  const {
    editingId,
    setView,
    handleCancelChecklist,
    handleSave,
    installType,
    setInstallType,
    clientName,
    setClientName,
    installDate,
    setInstallDate,
    eventName,
    setEventName,
    eventDays,
    setEventDays,
    pickupDate,
    setPickupDate,
    selectedMachineId,
    handleMachineSelect,
    machinesList,
    quantity,
    handleQuantityChange,
    selectedMachineData,
    selectedModelIndex,
    handleModelSelect,
    machineItems,
    updateMachineItem,
    waterInstall,
    setWaterInstall,
    sewageInstall,
    setSewageInstall,
    steamWand,
    setSteamWand,
    paymentSystem,
    setPaymentSystem,
    configStatus,
    setConfigStatus,
    configDate,
    setConfigDate,
    testStatus,
    setTestStatus,
    testDate,
    setTestDate,

    // Props Dinâmicas
    catalogData, // { tools: [], drinks: [], accessories: [], supplies: {} }
    tools,
    setTools,
    gallonQty,
    setGallonQty,
    selectedDrinks,
    toggleItem,
    setSelectedDrinks,
    updateItemValue,
    suppliesData,
    toggleSupply,
    updateSupplyQty,
    selectedAccessories,
    setSelectedAccessories,

    localSocket,
    setLocalSocket,
    localWater,
    setLocalWater,
    localSewage,
    setLocalSewage,
    trainedPeople,
    setTrainedPeople,
    contractNum,
    setContractNum,
    salesObs,
    setSalesObs,
    valMachine,
    valSupplies,
    valServices,
    valExtras,
    setValMachine,
    setValSupplies,
    setValServices,
    setValExtras,
  } = props;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pb-20 animate-fade-in">
      {/* HEADER FIXO */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 -mx-4 md:-mx-8 mb-6 border-b border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3 transition-all">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setView("list")}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="truncate">
            <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">
              {editingId ? "Editar Checklist" : "Novo Checklist"}
            </h1>
            <p className="text-xs text-gray-500 hidden md:block">
              {isReadOnly
                ? "Modo de Visualização"
                : "Preencha os dados da instalação."}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {/* Só mostra Cancelar Edição se NÃO for modo leitura e estiver editando */}
          {editingId && !isReadOnly && (
            <button
              onClick={handleCancelChecklist}
              className="px-3 md:px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <XCircle size={16} />{" "}
              <span className="hidden sm:inline">Cancelar</span>
            </button>
          )}

          {/* Botões de Salvar ocultos no modo leitura */}
          {!isReadOnly && (
            <>
              <button
                onClick={() => handleSave("Rascunho")}
                className="flex-1 md:flex-none px-3 md:px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg font-bold text-xs md:text-sm flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Save size={16} /> Rascunho
              </button>
              <button
                onClick={() => handleSave("Finalizado")}
                className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-amiste-primary hover:bg-amiste-secondary text-white rounded-lg font-bold text-xs md:text-sm shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Check size={16} /> Finalizar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        {/* --- DADOS GERAIS --- */}
        <FormSection title="Dados Gerais" icon={Calendar}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="col-span-full">
              <RadioGroup
                label="Tipo de Serviço"
                options={["Cliente", "Evento"]}
                value={installType}
                onChange={setInstallType}
                disabled={isReadOnly}
              />
            </div>
            {installType === "Cliente" ? (
              <>
                <div className="col-span-full">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Padaria Central"
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Data Instalação *
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    value={installDate}
                    onChange={(e) => setInstallDate(e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="col-span-full">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nome do Evento *
                  </label>
                  <input
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 md:contents">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Qtd. Dias
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      value={eventDays}
                      onChange={(e) => setEventDays(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Data Instalação
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                      value={installDate}
                      onChange={(e) => setInstallDate(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Data Retirada
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              </>
            )}
          </div>
        </FormSection>

        {/* --- EQUIPAMENTO --- */}
        <FormSection title="Equipamento" icon={Coffee}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Modelo da Máquina *
              </label>
              <select
                className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                value={selectedMachineId}
                onChange={handleMachineSelect}
                disabled={isReadOnly}
              >
                <option value="">Selecione...</option>
                {machinesList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Quantidade
              </label>
              <input
                type="number"
                min="1"
                className="w-full p-3 border border-gray-200 rounded-xl outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {selectedMachineData &&
            selectedMachineData.models &&
            selectedMachineData.models.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6 animate-fade-in">
                <label className="block text-xs font-bold text-purple-800 uppercase mb-1 flex items-center gap-1">
                  <Layers size={12} /> Selecione a Versão/Modelo
                </label>
                <select
                  className="w-full p-2 border border-purple-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-purple-50 disabled:text-gray-500"
                  value={selectedModelIndex}
                  onChange={handleModelSelect}
                  disabled={isReadOnly}
                >
                  <option value="">-- Padrão (Sem variação) --</option>
                  {selectedMachineData.models.map((mod, idx) => (
                    <option key={idx} value={idx}>
                      {mod.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

          <div className="space-y-3">
            {machineItems.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <span className="font-bold text-gray-400 self-start sm:self-center text-sm">
                  #{idx + 1}
                </span>
                <div className="grid grid-cols-2 sm:flex sm:flex-1 gap-3 w-full">
                  <select
                    className="p-2 rounded-lg border-gray-200 text-sm bg-white w-full sm:w-auto disabled:bg-gray-100 disabled:text-gray-500"
                    value={item.voltage}
                    onChange={(e) =>
                      updateMachineItem(idx, "voltage", e.target.value)
                    }
                    disabled={isReadOnly}
                  >
                    <option>220v</option>
                    <option>110v</option>
                    <option>Bivolt</option>
                  </select>
                  <input
                    className="flex-1 p-2 rounded-lg border border-gray-200 text-sm outline-none w-full disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Nº Série"
                    value={item.serial}
                    onChange={(e) =>
                      updateMachineItem(idx, "serial", e.target.value)
                    }
                    disabled={isReadOnly}
                  />
                  <input
                    className="flex-1 p-2 rounded-lg border border-gray-200 text-sm outline-none col-span-2 sm:col-span-1 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Patrimônio"
                    value={item.patrimony}
                    onChange={(e) =>
                      updateMachineItem(idx, "patrimony", e.target.value)
                    }
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <RadioGroup
              label="Rede Hídrica"
              options={["Sim", "Não"]}
              value={waterInstall}
              onChange={setWaterInstall}
              disabled={isReadOnly}
            />
            <RadioGroup
              label="Esgoto"
              options={["Sim", "Não"]}
              value={sewageInstall}
              onChange={setSewageInstall}
              disabled={isReadOnly}
            />
            <RadioGroup
              label="Vapor"
              options={["Sim", "Não"]}
              value={steamWand}
              onChange={setSteamWand}
              disabled={isReadOnly}
            />
            <RadioGroup
              label="Pagamento"
              options={["Sim", "Não"]}
              value={paymentSystem}
              onChange={setPaymentSystem}
              disabled={isReadOnly}
            />
          </div>
        </FormSection>

        {/* --- PREPARAÇÃO E TESTES --- */}
        <FormSection title="Preparação e Testes" icon={Wrench}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
            <div className="bg-gray-50 p-4 md:p-5 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-700 text-sm md:text-base">
                  Configuração
                </span>
                <RadioGroup
                  options={["Configurado", "Não"]}
                  value={configStatus}
                  onChange={setConfigStatus}
                  disabled={isReadOnly}
                />
              </div>
              {configStatus === "Configurado" && (
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg text-sm transition-all animate-fade-in disabled:bg-gray-100 disabled:text-gray-500"
                  value={configDate}
                  onChange={(e) => setConfigDate(e.target.value)}
                  disabled={isReadOnly}
                />
              )}
            </div>
            <div className="bg-gray-50 p-4 md:p-5 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-700 text-sm md:text-base">
                  Testes
                </span>
                <RadioGroup
                  options={["Testado", "Não"]}
                  value={testStatus}
                  onChange={setTestStatus}
                  disabled={isReadOnly}
                />
              </div>
              {testStatus === "Testado" && (
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg text-sm transition-all animate-fade-in disabled:bg-gray-100 disabled:text-gray-500"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  disabled={isReadOnly}
                />
              )}
            </div>
          </div>

          <h4 className="font-bold text-gray-400 text-xs uppercase mb-3 flex items-center gap-2">
            <Wrench size={16} /> Ferramentas Necessárias
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {catalogData?.tools?.map((name) => (
              <ToggleCard
                key={name}
                label={name}
                checked={tools[name]}
                onChange={(val) => setTools({ ...tools, [name]: val })}
                disabled={isReadOnly}
              />
            ))}

            {waterInstall === "Não" && (
              <div className="col-span-2 md:col-span-1">
                <ToggleCard
                  label="Galões"
                  checked={tools.galao}
                  onChange={(val) => setTools({ ...tools, galao: val })}
                  disabled={isReadOnly}
                />
                {tools.galao && (
                  <input
                    type="number"
                    placeholder="Quantos?"
                    className="w-full mt-2 p-2 border rounded text-sm animate-fade-in disabled:bg-gray-100 disabled:text-gray-500"
                    value={gallonQty}
                    onChange={(e) => setGallonQty(e.target.value)}
                    disabled={isReadOnly}
                  />
                )}
              </div>
            )}
            {sewageInstall === "Sim" && (
              <ToggleCard
                label="Mangueira Esgoto"
                checked={tools.mangueiraEsgoto}
                onChange={(val) => setTools({ ...tools, mangueiraEsgoto: val })}
                disabled={isReadOnly}
              />
            )}
          </div>

          <h4 className="font-bold text-gray-400 text-xs uppercase mb-3 flex items-center gap-2">
            <Coffee size={16} /> Bebidas Habilitadas
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {catalogData?.drinks?.map((drink) => (
              <div
                key={drink}
                className={`p-3 rounded-xl border transition-all ${selectedDrinks[drink] !== undefined ? "bg-red-50 border-amiste-primary" : "bg-white"} ${isReadOnly ? "opacity-70" : ""}`}
              >
                <div
                  onClick={() =>
                    !isReadOnly &&
                    toggleItem(selectedDrinks, setSelectedDrinks, drink, " ")
                  }
                  className={`flex items-center gap-2 mb-2 ${isReadOnly ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border shrink-0 ${selectedDrinks[drink] !== undefined ? "bg-amiste-primary border-amiste-primary" : "border-gray-300"}`}
                  ></div>
                  <span className="text-sm font-bold text-gray-700 truncate">
                    {drink}
                  </span>
                </div>
                {selectedDrinks[drink] !== undefined && (
                  <input
                    type="text"
                    placeholder="ML"
                    className="w-full p-1 text-xs border rounded bg-white disabled:bg-gray-100 disabled:text-gray-500"
                    value={selectedDrinks[drink]}
                    onChange={(e) =>
                      updateItemValue(
                        selectedDrinks,
                        setSelectedDrinks,
                        drink,
                        e.target.value,
                      )
                    }
                    disabled={isReadOnly}
                  />
                )}
              </div>
            ))}
          </div>
        </FormSection>

        {/* --- INSUMOS E ACESSÓRIOS --- */}
        <FormSection title="Insumos e Acessórios" icon={Package}>
          <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-thin">
            {Object.entries(suppliesData).map(([cat, items]) => (
              <div
                key={cat}
                className="min-w-[240px] md:min-w-[260px] bg-gray-50 rounded-xl p-4 border border-gray-100 shrink-0"
              >
                <h5 className="font-bold text-xs uppercase mb-3 text-amiste-primary flex items-center gap-2">
                  <div className="w-2 h-2 bg-amiste-primary rounded-full"></div>{" "}
                  {cat}
                </h5>
                <div className="space-y-2">
                  {Object.keys(items).map((key) => (
                    <div key={key}>
                      <div
                        onClick={() => !isReadOnly && toggleSupply(cat, key)}
                        className={`flex items-center gap-2 p-1 rounded ${isReadOnly ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-gray-100"}`}
                      >
                        <div
                          className={`w-3 h-3 rounded border shrink-0 ${items[key].active ? "bg-green-500 border-green-500" : "border-gray-400"}`}
                        ></div>
                        <span className="text-xs font-medium text-gray-600 truncate">
                          {key}
                        </span>
                      </div>
                      {items[key].active && (
                        <input
                          type="text"
                          placeholder="Qtd"
                          className="w-full p-1 text-xs border rounded mt-1 bg-white animate-fade-in disabled:bg-gray-100 disabled:text-gray-500"
                          value={items[key].qty}
                          onChange={(e) =>
                            updateSupplyQty(cat, key, e.target.value)
                          }
                          disabled={isReadOnly}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <h4 className="font-bold text-gray-400 text-xs uppercase mb-3">
            Acessórios
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {catalogData?.accessories?.map((acc) => (
              <div
                key={acc}
                className={`p-3 rounded-xl border transition-all ${selectedAccessories[acc] !== undefined ? "bg-blue-50 border-blue-300" : "bg-white"} ${isReadOnly ? "opacity-70" : ""}`}
              >
                <div
                  onClick={() =>
                    !isReadOnly &&
                    toggleItem(
                      selectedAccessories,
                      setSelectedAccessories,
                      acc,
                      "1",
                    )
                  }
                  className={`flex items-center gap-2 mb-1 ${isReadOnly ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div
                    className={`w-3 h-3 rounded border shrink-0 ${selectedAccessories[acc] !== undefined ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}
                  ></div>
                  <span className="text-sm text-gray-700 truncate">{acc}</span>
                </div>
                {selectedAccessories[acc] !== undefined && (
                  <input
                    type="text"
                    placeholder="Qtd"
                    className="w-full p-1 text-xs border rounded bg-white animate-fade-in disabled:bg-gray-100 disabled:text-gray-500"
                    value={selectedAccessories[acc]}
                    onChange={(e) =>
                      updateItemValue(
                        selectedAccessories,
                        setSelectedAccessories,
                        acc,
                        e.target.value,
                      )
                    }
                    disabled={isReadOnly}
                  />
                )}
              </div>
            ))}
          </div>
        </FormSection>

        {/* --- LOCAL --- */}
        <FormSection title="Local de Instalação" icon={MapPin}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="block text-xs font-bold text-gray-500 uppercase mb-2">
                <Zap size={12} className="inline mr-1" /> Tomada
              </span>
              <RadioGroup
                options={["10A", "20A"]}
                value={localSocket}
                onChange={setLocalSocket}
                disabled={isReadOnly}
              />
              {selectedMachineData?.amperage &&
                localSocket &&
                selectedMachineData.amperage !== localSocket && (
                  <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded mt-2">
                    ⚠️ {selectedMachineData.amperage}!
                  </div>
                )}
            </div>
            <div className="p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="block text-xs font-bold text-gray-500 uppercase mb-2">
                <Droplet size={12} className="inline mr-1" /> Água
              </span>
              <RadioGroup
                options={["Sim", "Não"]}
                value={localWater}
                onChange={setLocalWater}
                disabled={isReadOnly}
              />
              {waterInstall === "Sim" && localWater === "Não" && (
                <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded mt-2">
                  ⚠️ Hidráulica
                </div>
              )}
            </div>
            <div className="p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Esgoto
              </span>
              <RadioGroup
                options={["Sim", "Não"]}
                value={localSewage}
                onChange={setLocalSewage}
                disabled={isReadOnly}
              />
              {sewageInstall === "Sim" && localSewage === "Não" && (
                <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded mt-2">
                  ⚠️ Esgoto
                </div>
              )}
            </div>
            <div className="p-3 md:p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Treinamento
              </span>
              <input
                type="number"
                placeholder="Qtd Pessoas"
                className="w-full p-2 border rounded-lg bg-white outline-none disabled:bg-gray-100 disabled:text-gray-500"
                value={trainedPeople}
                onChange={(e) => setTrainedPeople(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </FormSection>

        {/* --- FINALIZAÇÃO --- */}
        <FormSection title="Finalização" icon={FileText}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Nº Contrato
              </label>
              <input
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-amiste-primary disabled:bg-gray-100 disabled:text-gray-500"
                value={contractNum}
                onChange={(e) => setContractNum(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Obs Venda
              </label>
              <textarea
                rows="3"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-amiste-primary resize-none disabled:bg-gray-100 disabled:text-gray-500"
                value={salesObs}
                onChange={(e) => setSalesObs(e.target.value)}
                disabled={isReadOnly}
              ></textarea>
            </div>
          </div>
          <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-end mb-6 border-b border-gray-700 pb-4">
              <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">
                Valor Total Serviço
              </span>
              <span className="text-3xl font-bold text-green-400">
                R${" "}
                {(valMachine + valSupplies + valServices + valExtras).toFixed(
                  2,
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { l: "Máquina", v: valMachine, s: setValMachine },
                { l: "Insumos", v: valSupplies, s: setValSupplies },
                { l: "Serviços", v: valServices, s: setValServices },
                { l: "Extras", v: valExtras, s: setValExtras },
              ].map((item, i) => (
                <div key={i}>
                  <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">
                    {item.l}
                  </label>
                  <div
                    className={`flex items-center bg-gray-800 rounded-lg overflow-hidden border transition-colors ${isReadOnly ? "border-gray-700 opacity-80" : "border-gray-700 focus-within:border-green-500"}`}
                  >
                    <span className="pl-3 text-gray-500 text-xs">R$</span>
                    <input
                      type="number"
                      className="w-full p-2 bg-transparent text-white text-sm outline-none font-bold disabled:text-gray-400"
                      value={item.v}
                      onChange={(e) => item.s(parseFloat(e.target.value) || 0)}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FormSection>
      </div>
    </div>
  );
}
