import { Wrench, Coffee } from "lucide-react";
import { FormSection, RadioGroup, ToggleCard } from "./ChecklistUI";

export function ChecklistPrep(props) {
  const {
    configStatus,
    setConfigStatus,
    configDate,
    setConfigDate,
    testStatus,
    setTestStatus,
    testDate,
    setTestDate,
    catalogData,
    tools,
    setTools,
    waterInstall,
    sewageInstall,
    gallonQty,
    setGallonQty,
    selectedDrinks,
    toggleItem,
    setSelectedDrinks,
    updateItemValue,
    isReadOnly,
  } = props;

  return (
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
  );
}
