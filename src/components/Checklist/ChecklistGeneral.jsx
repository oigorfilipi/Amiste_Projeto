import { Calendar } from "lucide-react";
import { FormSection, RadioGroup } from "./ChecklistUI";

export function ChecklistGeneral(props) {
  const {
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
    isReadOnly,
  } = props;

  return (
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
  );
}
