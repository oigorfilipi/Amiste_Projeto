import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { ArrowRight, ArrowLeft, Save, AlertCircle } from "lucide-react";

export function Checklist() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [machinesList, setMachinesList] = useState([]); // Lista do Banco

  // --- ESTADOS DO PASSO 1 (DADOS BÁSICOS) ---
  const [installType, setInstallType] = useState("Cliente");
  const [clientName, setClientName] = useState("");
  const [installDate, setInstallDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDays, setEventDays] = useState("");
  const [pickupDate, setPickupDate] = useState("");

  // --- ESTADOS DO PASSO 2 (DADOS MÁQUINA) ---
  const [quantity, setQuantity] = useState(1);
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [selectedMachineData, setSelectedMachineData] = useState(null); // Objeto completo da máquina selecionada

  // Tabela Dinâmica (Repeater) para quando tem mais de 1 máquina
  // Cada item é um objeto: { voltage: '220v', patrimony: '', serial: '' }
  const [machineItems, setMachineItems] = useState([
    { voltage: "220v", patrimony: "", serial: "" },
  ]);

  // Configurações Técnicas
  const [hasGrinder, setHasGrinder] = useState("Não"); // Só para profissionais
  const [waterInstall, setWaterInstall] = useState("Não");
  const [sewageInstall, setSewageInstall] = useState("Não");
  const [paymentSystem, setPaymentSystem] = useState("Não");
  const [paymentType, setPaymentType] = useState("");
  const [steamWand, setSteamWand] = useState("Não");

  // 1. BUSCAR MÁQUINAS AO INICIAR
  useEffect(() => {
    async function fetchMachines() {
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .order("name");
      if (data) setMachinesList(data);
      setLoadingMachines(false);
    }
    fetchMachines();
  }, []);

  // 2. LÓGICA AO SELECIONAR UMA MÁQUINA (Preenchimento Automático)
  function handleMachineSelect(e) {
    const id = e.target.value;
    setSelectedMachineId(id);

    if (id) {
      const machine = machinesList.find((m) => m.id.toString() === id);
      setSelectedMachineData(machine);

      // Regras Automáticas baseadas no Cadastro
      if (machine) {
        // Se no cadastro diz que é Rede Hídrica, marcamos Sim. Se for Reservatório, marcamos Não.
        setWaterInstall(
          machine.water_system === "Rede Hídrica" ? "Sim" : "Não",
        );
        setSteamWand(machine.has_steamer === "Sim" ? "Sim" : "Não");
        // Reseta moinho se mudar máquina
        setHasGrinder("Não");
      }
    } else {
      setSelectedMachineData(null);
    }
  }

  // 3. LÓGICA DE QUANTIDADE (REPEATER)
  function handleQuantityChange(val) {
    const newQty = parseInt(val) || 1;
    setQuantity(newQty);

    // Redimensiona o array de itens mantendo os dados que já existem
    const newItems = [...machineItems];
    if (newQty > newItems.length) {
      // Adiciona novos itens vazios
      for (let i = newItems.length; i < newQty; i++) {
        newItems.push({ voltage: "220v", patrimony: "", serial: "" });
      }
    } else {
      // Corta o array se diminuiu a quantidade
      newItems.length = newQty;
    }
    setMachineItems(newItems);
  }

  // Atualiza um item específico da lista de máquinas (Serial/Patrimônio/Voltagem)
  function updateMachineItem(index, field, value) {
    const newItems = [...machineItems];
    newItems[index][field] = value;
    setMachineItems(newItems);
  }

  // --- NAVEGAÇÃO ---
  function nextStep() {
    // Validação Passo 1
    if (currentStep === 1) {
      if (installType === "Cliente" && (!clientName || !installDate))
        return alert("Preencha Nome e Data!");
      if (installType === "Evento" && (!eventName || !eventDays))
        return alert("Preencha dados do Evento!");
    }

    // Validação Passo 2
    if (currentStep === 2) {
      if (!selectedMachineId) return alert("Selecione um Modelo de Máquina!");
      if (quantity < 1) return alert("Quantidade mínima é 1!");
      if (paymentSystem === "Sim" && !paymentType)
        return alert("Informe o tipo de pagamento!");
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  }

  return (
    <div className="min-h-screen pb-20">
      {/* CABEÇALHO */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Novo Checklist
        </h1>
        <p className="text-gray-500">
          Passo {currentStep} de {totalSteps}
        </p>
      </div>

      {/* WIZARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-amiste-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
        {/* === PASSO 1: DADOS BÁSICOS === */}
        {currentStep === 1 && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-amiste-primary text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">
                1
              </span>
              Dados Básicos
            </h2>

            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tipo de Instalação
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex-1 border p-4 rounded-xl cursor-pointer ${installType === "Cliente" ? "border-amiste-primary bg-red-50 text-amiste-primary font-bold" : "border-gray-200"}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value="Cliente"
                        checked={installType === "Cliente"}
                        onChange={(e) => setInstallType(e.target.value)}
                        className="accent-amiste-primary"
                      />
                      Cliente Padrão
                    </div>
                  </label>
                  <label
                    className={`flex-1 border p-4 rounded-xl cursor-pointer ${installType === "Evento" ? "border-amiste-primary bg-red-50 text-amiste-primary font-bold" : "border-gray-200"}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value="Evento"
                        checked={installType === "Evento"}
                        onChange={(e) => setInstallType(e.target.value)}
                        className="accent-amiste-primary"
                      />
                      Evento Temporário
                    </div>
                  </label>
                </div>
              </div>

              {installType === "Cliente" ? (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-50 border rounded-lg"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Data Instalação *
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 bg-gray-50 border rounded-lg"
                      value={installDate}
                      onChange={(e) => setInstallDate(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nome Evento *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-50 border rounded-lg"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Qtd. Dias *
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 bg-gray-50 border rounded-lg"
                      value={eventDays}
                      onChange={(e) => setEventDays(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Data Instalação *
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 bg-gray-50 border rounded-lg"
                      value={installDate}
                      onChange={(e) => setInstallDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Data Retirada *
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 bg-gray-50 border rounded-lg"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === PASSO 2: DADOS DA MÁQUINA === */}
        {currentStep === 2 && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-amiste-primary text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">
                2
              </span>
              Dados da Máquina
            </h2>

            <div className="space-y-8 max-w-4xl">
              {/* Seleção de Modelo e Quantidade */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo da Máquina *
                  </label>
                  {loadingMachines ? (
                    <p className="text-sm text-gray-400">
                      Carregando catálogo...
                    </p>
                  ) : (
                    <select
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:border-amiste-primary outline-none"
                      value={selectedMachineId}
                      onChange={handleMachineSelect}
                    >
                      <option value="">Selecione um modelo...</option>
                      {machinesList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.voltage}) - {m.type}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade *
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      className="w-full p-3 bg-white border border-gray-200 rounded-l-lg focus:border-amiste-primary outline-none"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                    />
                    <span className="bg-gray-100 border border-l-0 border-gray-200 p-3 rounded-r-lg text-gray-500 font-bold">
                      un
                    </span>
                  </div>
                </div>
              </div>

              {/* OPÇÃO DE MOINHO (Só se for Profissional) */}
              {selectedMachineData?.type === "Profissional" && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg animate-fade-in">
                  <span className="block text-sm font-bold text-amber-800 mb-2">
                    Máquina Profissional Detectada
                  </span>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasGrinder === "Sim"}
                      onChange={(e) =>
                        setHasGrinder(e.target.checked ? "Sim" : "Não")
                      }
                      className="w-5 h-5 text-amiste-primary rounded"
                    />
                    <span className="text-gray-700">
                      Necessário levar <b>Moinho</b>? (Segue a mesma quantidade)
                    </span>
                  </label>
                </div>
              )}

              {/* REPEATER: Tabela de Séries e Voltagens */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Identificação das Unidades
                </h3>

                {quantity > 1 ? (
                  // MODO TABELA (Para 2+ máquinas)
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b">
                        <tr>
                          <th className="px-3 py-2">#</th>
                          <th className="px-3 py-2">Voltagem *</th>
                          <th className="px-3 py-2">Nº Série</th>
                          <th className="px-3 py-2">Patrimônio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {machineItems.map((item, index) => (
                          <tr
                            key={index}
                            className="bg-white border-b hover:bg-gray-50"
                          >
                            <td className="px-3 py-3 font-bold">{index + 1}</td>
                            <td className="px-3 py-3">
                              <select
                                className="bg-gray-50 border rounded p-1 w-full"
                                value={item.voltage}
                                onChange={(e) =>
                                  updateMachineItem(
                                    index,
                                    "voltage",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="110v">110v</option>
                                <option value="220v">220v</option>
                                <option value="Bivolt">Bivolt</option>
                              </select>
                            </td>
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                placeholder="Série..."
                                className="bg-gray-50 border rounded p-1 w-full"
                                value={item.serial}
                                onChange={(e) =>
                                  updateMachineItem(
                                    index,
                                    "serial",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                placeholder="Patrimônio..."
                                className="bg-gray-50 border rounded p-1 w-full"
                                value={item.patrimony}
                                onChange={(e) =>
                                  updateMachineItem(
                                    index,
                                    "patrimony",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // MODO SIMPLES (Para 1 máquina)
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                        Voltagem *
                      </label>
                      <select
                        className="w-full p-2 bg-white border rounded-lg"
                        value={machineItems[0].voltage}
                        onChange={(e) =>
                          updateMachineItem(0, "voltage", e.target.value)
                        }
                      >
                        <option value="110v">110v</option>
                        <option value="220v">220v</option>
                        <option value="Bivolt">Bivolt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                        Nº Série
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 bg-white border rounded-lg"
                        value={machineItems[0].serial}
                        onChange={(e) =>
                          updateMachineItem(0, "serial", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">
                        Patrimônio
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 bg-white border rounded-lg"
                        value={machineItems[0].patrimony}
                        onChange={(e) =>
                          updateMachineItem(0, "patrimony", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CONFIGURAÇÕES TÉCNICAS (Radio Buttons) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                {/* Instalação Hídrica */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Instalação Hídrica *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="water"
                        value="Sim"
                        checked={waterInstall === "Sim"}
                        onChange={(e) => setWaterInstall(e.target.value)}
                      />{" "}
                      Sim
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="water"
                        value="Não"
                        checked={waterInstall === "Não"}
                        onChange={(e) => setWaterInstall(e.target.value)}
                      />{" "}
                      Não
                    </label>
                  </div>
                  {waterInstall === "Não" && (
                    <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle size={12} /> Aviso: Necessário levar Galões
                      de água.
                    </p>
                  )}
                </div>

                {/* Esgoto */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Rede de Esgoto *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sewage"
                        value="Sim"
                        checked={sewageInstall === "Sim"}
                        onChange={(e) => setSewageInstall(e.target.value)}
                      />{" "}
                      Sim
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sewage"
                        value="Não"
                        checked={sewageInstall === "Não"}
                        onChange={(e) => setSewageInstall(e.target.value)}
                      />{" "}
                      Não
                    </label>
                  </div>
                </div>

                {/* Sistema de Pagamento */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Sistema de Pagamento *
                  </label>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="Sim"
                        checked={paymentSystem === "Sim"}
                        onChange={(e) => setPaymentSystem(e.target.value)}
                      />{" "}
                      Sim
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="Não"
                        checked={paymentSystem === "Não"}
                        onChange={(e) => setPaymentSystem(e.target.value)}
                      />{" "}
                      Não
                    </label>
                  </div>
                  {paymentSystem === "Sim" && (
                    <div className="mt-2 animate-fade-in">
                      <p className="text-xs text-amber-600 mb-2 flex items-center gap-1">
                        <AlertCircle size={12} /> Configurar Sistema:
                      </p>
                      <div className="flex gap-3">
                        <label className="text-sm">
                          <input
                            type="radio"
                            name="payType"
                            value="Stone"
                            onChange={(e) => setPaymentType(e.target.value)}
                          />{" "}
                          Stone
                        </label>
                        <label className="text-sm">
                          <input
                            type="radio"
                            name="payType"
                            value="Outro"
                            onChange={(e) => setPaymentType(e.target.value)}
                          />{" "}
                          Outro
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bico Vaporizador */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Bico Vaporizador *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="steam"
                        value="Sim"
                        checked={steamWand === "Sim"}
                        onChange={(e) => setSteamWand(e.target.value)}
                      />{" "}
                      Sim
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="steam"
                        value="Não"
                        checked={steamWand === "Não"}
                        onChange={(e) => setSteamWand(e.target.value)}
                      />{" "}
                      Não
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === RODAPÉ DE NAVEGAÇÃO === */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
          >
            <ArrowLeft size={20} />
            Voltar
          </button>

          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-amiste-primary font-bold hover:bg-red-50 rounded-lg transition-colors">
              <Save size={20} />
              <span className="hidden md:inline">Salvar Rascunho</span>
            </button>

            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
            >
              {currentStep === totalSteps ? "Finalizar" : "Próximo"}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
