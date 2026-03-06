import { MapPin, Zap, Droplet, FileText } from "lucide-react";
import { FormSection, RadioGroup } from "./ChecklistUI";

export function ChecklistLocationAndFinal(props) {
  const {
    localSocket,
    setLocalSocket,
    localWater,
    setLocalWater,
    localSewage,
    setLocalSewage,
    trainedPeople,
    setTrainedPeople,
    waterInstall,
    sewageInstall,
    selectedMachineData,
    contractNum,
    setContractNum,
    salesObs,
    setSalesObs,
    valMachine,
    setValMachine,
    valSupplies,
    setValSupplies,
    valServices,
    setValServices,
    valExtras,
    setValExtras,
    isReadOnly,
  } = props;

  return (
    <>
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
              {(valMachine + valSupplies + valServices + valExtras).toFixed(2)}
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
    </>
  );
}
