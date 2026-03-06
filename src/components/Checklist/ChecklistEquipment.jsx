import { Coffee, Layers } from "lucide-react";
import { FormSection, RadioGroup } from "./ChecklistUI";

export function ChecklistEquipment(props) {
  const {
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
    isReadOnly,
  } = props;

  return (
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
  );
}
