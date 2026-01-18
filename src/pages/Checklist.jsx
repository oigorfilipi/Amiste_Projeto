import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import {
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Check,
} from "lucide-react";

export function Checklist() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [machinesList, setMachinesList] = useState([]);

  // --- PASSO 1: DADOS BÁSICOS ---
  const [installType, setInstallType] = useState("Cliente");
  const [clientName, setClientName] = useState("");
  const [installDate, setInstallDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDays, setEventDays] = useState("");
  const [pickupDate, setPickupDate] = useState("");

  // --- PASSO 2: MÁQUINA ---
  const [quantity, setQuantity] = useState(1);
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [selectedMachineData, setSelectedMachineData] = useState(null);
  const [machineItems, setMachineItems] = useState([
    { voltage: "220v", patrimony: "", serial: "" },
  ]);
  const [hasGrinder, setHasGrinder] = useState("Não");
  const [waterInstall, setWaterInstall] = useState("Não"); // "Como será instalado?"
  const [sewageInstall, setSewageInstall] = useState("Não");
  const [paymentSystem, setPaymentSystem] = useState("Não");
  const [paymentType, setPaymentType] = useState("");
  const [steamWand, setSteamWand] = useState("Não");

  // --- PASSO 3: APARATOS (Checkboxes simples) ---
  const [tools, setTools] = useState({
    caixaFerramentas: false,
    luvas: false,
    transformador: false,
    extensao: false,
    pano: false,
    balde: false,
    adaptador: false,
    conexoes: false,
    filtro: false,
    mangueiras: false, // Hídrica Sim
    galao: false,
    mangueiraEsgoto: false, // Hídrica Não / Esgoto Sim
  });
  const [gallonQty, setGallonQty] = useState("");

  // --- PASSO 4: PREPARATIVOS ---
  const [configStatus, setConfigStatus] = useState("Não");
  const [configDate, setConfigDate] = useState("");
  const [testStatus, setTestStatus] = useState("Não");
  const [testDate, setTestDate] = useState("");

  // --- PASSO 5: BEBIDAS (Objeto: { 'Café': '50ml' }) ---
  const [selectedDrinks, setSelectedDrinks] = useState({});
  const [customDrinks, setCustomDrinks] = useState([]); // [{ name: '', ml: '' }]

  // --- PASSO 6: ACESSÓRIOS (Objeto: { 'Pitcher': '2' }) ---
  const [selectedAccessories, setSelectedAccessories] = useState({});
  const [customAccessories, setCustomAccessories] = useState([]); // [{ name: '', qty: '' }]

  // --- PASSO 7: INSUMOS (Objeto: { 'Café Grão': '1kg' }) ---
  const [selectedSupplies, setSelectedSupplies] = useState({});
  const [customSupplies, setCustomSupplies] = useState([]); // [{ category: '', name: '', qty: '' }]

  // --- PASSO 8: PREPARAÇÃO LOCAL ---
  const [localSocket, setLocalSocket] = useState(""); // 10A ou 20A
  const [localWater, setLocalWater] = useState(""); // Tem ou Não Tem
  const [localSewage, setLocalSewage] = useState(""); // Tem ou Não Tem
  const [trainedPeople, setTrainedPeople] = useState("");

  // --- PASSO 9: FINALIZAÇÃO ---
  const [contractNum, setContractNum] = useState("");
  const [installFileNum, setInstallFileNum] = useState("");
  const [salesObs, setSalesObs] = useState("");
  const [clientChanges, setClientChanges] = useState("");
  // Valores
  const [valMachine, setValMachine] = useState(0);
  const [valSupplies, setValSupplies] = useState(0);
  const [valServices, setValServices] = useState(0);
  const [valExtras, setValExtras] = useState(0);

  // --- BUSCA MÁQUINAS ---
  useEffect(() => {
    async function fetchMachines() {
      const { data } = await supabase
        .from("machines")
        .select("*")
        .order("name");
      if (data) setMachinesList(data);
      setLoadingMachines(false);
    }
    fetchMachines();
  }, []);

  // --- LÓGICA PASSO 2 (Recapitulando) ---
  function handleMachineSelect(e) {
    const id = e.target.value;
    setSelectedMachineId(id);
    if (id) {
      const machine = machinesList.find((m) => m.id.toString() === id);
      setSelectedMachineData(machine);
      if (machine) {
        setWaterInstall(
          machine.water_system === "Rede Hídrica" ? "Sim" : "Não",
        );
        setSteamWand(machine.has_steamer === "Sim" ? "Sim" : "Não");
      }
    } else {
      setSelectedMachineData(null);
    }
  }

  function handleQuantityChange(val) {
    const newQty = parseInt(val) || 1;
    setQuantity(newQty);
    const newItems = [...machineItems];
    if (newQty > newItems.length) {
      for (let i = newItems.length; i < newQty; i++)
        newItems.push({ voltage: "220v", patrimony: "", serial: "" });
    } else {
      newItems.length = newQty;
    }
    setMachineItems(newItems);
  }

  function updateMachineItem(index, field, value) {
    const newItems = [...machineItems];
    newItems[index][field] = value;
    setMachineItems(newItems);
  }

  // --- HELPERS PARA LISTAS (Bebidas/Acessórios) ---
  const toggleItem = (state, setState, key, defaultValue = " ") => {
    const newState = { ...state };
    if (newState[key])
      delete newState[key]; // Se existe, remove
    else newState[key] = defaultValue; // Se não, adiciona
    setState(newState);
  };

  const updateItemValue = (state, setState, key, val) => {
    setState({ ...state, [key]: val });
  };

  // --- NAVEGAÇÃO ---
  function nextStep() {
    // Validação Passo 1
    if (currentStep === 1) {
      if (installType === "Cliente" && !clientName)
        return alert("Preencha o Nome do Cliente");
      if (installType === "Evento" && !eventName)
        return alert("Preencha o Nome do Evento");
    }
    // Validação Passo 2
    if (currentStep === 2 && !selectedMachineId)
      return alert("Selecione a Máquina");

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

  // --- LISTAS PADRÃO (Para renderizar fácil) ---
  const drinksList = [
    "Café Expresso",
    "Café Longo",
    "Leite",
    "Café c/ Leite",
    "Cappuccino",
    "Chocolate",
    "Moccaccino",
  ];
  const accessoriesList = [
    "Pitcher",
    "Balança",
    "Tamper",
    "Tapete",
    "Nivelador",
    "Pincel",
    "Porta Borras",
  ];
  const suppliesList = [
    "Café Gourmet (Solúvel)",
    "Chocolate (Solúvel)",
    "Cappuccino (Solúvel)",
    "Grão Gourmet",
    "Grão Premium",
    "Xarope Baunilha",
    "Xarope Caramelo",
  ];

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Novo Checklist
        </h1>
        <p className="text-gray-500">
          Passo {currentStep} de {totalSteps}
        </p>
      </div>

      {/* PROGRESS BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-amiste-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
        {/* === PASSO 1 === */}
        {currentStep === 1 && (
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6">1. Dados Básicos</h2>
            <div className="space-y-6 max-w-2xl">
              <div className="flex gap-4">
                <label
                  className={`flex-1 border p-4 rounded-xl cursor-pointer ${installType === "Cliente" ? "border-amiste-primary bg-red-50 text-amiste-primary font-bold" : "border-gray-200"}`}
                >
                  <input
                    type="radio"
                    className="mr-2"
                    checked={installType === "Cliente"}
                    onChange={() => setInstallType("Cliente")}
                  />{" "}
                  Cliente
                </label>
                <label
                  className={`flex-1 border p-4 rounded-xl cursor-pointer ${installType === "Evento" ? "border-amiste-primary bg-red-50 text-amiste-primary font-bold" : "border-gray-200"}`}
                >
                  <input
                    type="radio"
                    className="mr-2"
                    checked={installType === "Evento"}
                    onChange={() => setInstallType("Evento")}
                  />{" "}
                  Evento
                </label>
              </div>
              {installType === "Cliente" ? (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Cliente *
                    </label>
                    <input
                      className="w-full p-3 border rounded-lg"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border rounded-lg"
                      value={installDate}
                      onChange={(e) => setInstallDate(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      Evento *
                    </label>
                    <input
                      className="w-full p-3 border rounded-lg"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold mb-1">
                        Dias
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border rounded-lg"
                        value={eventDays}
                        onChange={(e) => setEventDays(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold mb-1">
                        Retirada
                      </label>
                      <input
                        type="date"
                        className="w-full p-3 border rounded-lg"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* === PASSO 2 === */}
        {currentStep === 2 && (
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6">2. Dados da Máquina</h2>
            <div className="space-y-6 max-w-3xl">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-1">
                    Modelo *
                  </label>
                  <select
                    className="w-full p-3 border rounded-lg"
                    value={selectedMachineId}
                    onChange={handleMachineSelect}
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
                  <label className="block text-sm font-bold mb-1">Qtd</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-3 border rounded-lg"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Tabela Repeater */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                {machineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <span className="font-bold w-6">{idx + 1}.</span>
                    <select
                      className="p-2 border rounded"
                      value={item.voltage}
                      onChange={(e) =>
                        updateMachineItem(idx, "voltage", e.target.value)
                      }
                    >
                      <option>220v</option>
                      <option>110v</option>
                    </select>
                    <input
                      className="p-2 border rounded flex-1"
                      placeholder="Série"
                      value={item.serial}
                      onChange={(e) =>
                        updateMachineItem(idx, "serial", e.target.value)
                      }
                    />
                    <input
                      className="p-2 border rounded flex-1"
                      placeholder="Patrimônio"
                      value={item.patrimony}
                      onChange={(e) =>
                        updateMachineItem(idx, "patrimony", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Configs Técnicas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="block font-bold text-sm mb-2">Hídrica?</span>
                  <div className="flex gap-4">
                    <label>
                      <input
                        type="radio"
                        name="w"
                        value="Sim"
                        checked={waterInstall === "Sim"}
                        onChange={(e) => setWaterInstall(e.target.value)}
                      />{" "}
                      Sim
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="w"
                        value="Não"
                        checked={waterInstall === "Não"}
                        onChange={(e) => setWaterInstall(e.target.value)}
                      />{" "}
                      Não
                    </label>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="block font-bold text-sm mb-2">Pgto?</span>
                  <div className="flex gap-4">
                    <label>
                      <input
                        type="radio"
                        name="p"
                        value="Sim"
                        checked={paymentSystem === "Sim"}
                        onChange={(e) => setPaymentSystem(e.target.value)}
                      />{" "}
                      Sim
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="p"
                        value="Não"
                        checked={paymentSystem === "Não"}
                        onChange={(e) => setPaymentSystem(e.target.value)}
                      />{" "}
                      Não
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === PASSO 3: APARATOS === */}
        {currentStep === 3 && (
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6">3. Aparatos Necessários</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "caixaFerramentas",
                "luvas",
                "transformador",
                "extensao",
                "pano",
                "balde",
                "adaptador",
              ].map((key) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${tools[key] ? "bg-red-50 border-amiste-primary" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={tools[key]}
                    onChange={(e) =>
                      setTools({ ...tools, [key]: e.target.checked })
                    }
                    className="accent-amiste-primary w-5 h-5"
                  />
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                </label>
              ))}

              {/* Condicionais Hídrica */}
              {waterInstall === "Sim" && (
                <>
                  {["conexoes", "filtro", "mangueiras"].map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer bg-blue-50 border-blue-200"
                    >
                      <input
                        type="checkbox"
                        checked={tools[key]}
                        onChange={(e) =>
                          setTools({ ...tools, [key]: e.target.checked })
                        }
                        className="accent-blue-500 w-5 h-5"
                      />
                      <span className="capitalize font-medium text-blue-900">
                        {key}
                      </span>
                    </label>
                  ))}
                </>
              )}

              {/* Condicionais Sem Hídrica */}
              {waterInstall === "Não" && (
                <div className="col-span-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <label className="flex items-center gap-2 mb-2 font-bold text-amber-900">
                    <input
                      type="checkbox"
                      checked={tools.galao}
                      onChange={(e) =>
                        setTools({ ...tools, galao: e.target.checked })
                      }
                      className="accent-amber-600 w-5 h-5"
                    />
                    Levar Galões de Água
                  </label>
                  {tools.galao && installType === "Evento" && (
                    <input
                      type="number"
                      placeholder="Qtd Galões"
                      className="w-full p-2 border rounded"
                      value={gallonQty}
                      onChange={(e) => setGallonQty(e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === PASSO 4: PREPARATIVOS === */}
        {currentStep === 4 && (
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6">4. Preparativos</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-bold mb-2">Máquina já Configurada?</p>
                <div className="flex gap-4 mb-2">
                  {["Não", "Aguardando", "Configurado"].map((op) => (
                    <label
                      key={op}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="cfg"
                        value={op}
                        checked={configStatus === op}
                        onChange={(e) => setConfigStatus(e.target.value)}
                      />{" "}
                      {op}
                    </label>
                  ))}
                </div>
                {configStatus === "Configurado" && (
                  <input
                    type="date"
                    className="p-2 border rounded"
                    value={configDate}
                    onChange={(e) => setConfigDate(e.target.value)}
                  />
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-bold mb-2">Bebidas Testadas?</p>
                <div className="flex gap-4 mb-2">
                  {["Não", "Aguardando", "Testado"].map((op) => (
                    <label
                      key={op}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="tst"
                        value={op}
                        checked={testStatus === op}
                        onChange={(e) => setTestStatus(e.target.value)}
                      />{" "}
                      {op}
                    </label>
                  ))}
                </div>
                {testStatus === "Testado" && (
                  <input
                    type="date"
                    className="p-2 border rounded"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* === PASSO 5: BEBIDAS === */}
        {currentStep === 5 && (
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6">
              5. Configuração de Bebidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drinksList.map((drink) => (
                <div
                  key={drink}
                  className={`p-3 border rounded-lg flex items-center gap-3 ${selectedDrinks[drink] !== undefined ? "bg-red-50 border-amiste-primary" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-amiste-primary"
                    checked={selectedDrinks[drink] !== undefined}
                    onChange={() =>
                      toggleItem(selectedDrinks, setSelectedDrinks, drink, " ")
                    }
                  />
                  <span className="flex-1 font-medium">{drink}</span>
                  {selectedDrinks[drink] !== undefined && (
                    <input
                      type="text"
                      placeholder="ML"
                      className="w-20 p-1 text-sm border rounded bg-white"
                      value={selectedDrinks[drink]}
                      onChange={(e) =>
                        updateItemValue(
                          selectedDrinks,
                          setSelectedDrinks,
                          drink,
                          e.target.value,
                        )
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Outros (Dinâmico) */}
            <div className="mt-6">
              <p className="font-bold text-sm mb-2">Outras Bebidas:</p>
              {customDrinks.map((cd, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    placeholder="Nome da Bebida"
                    className="flex-1 p-2 border rounded"
                    value={cd.name}
                    onChange={(e) => {
                      const n = [...customDrinks];
                      n[idx].name = e.target.value;
                      setCustomDrinks(n);
                    }}
                  />
                  <input
                    placeholder="ML"
                    className="w-24 p-2 border rounded"
                    value={cd.ml}
                    onChange={(e) => {
                      const n = [...customDrinks];
                      n[idx].ml = e.target.value;
                      setCustomDrinks(n);
                    }}
                  />
                  <button
                    onClick={() => {
                      const n = [...customDrinks];
                      n.splice(idx, 1);
                      setCustomDrinks(n);
                    }}
                    className="text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setCustomDrinks([...customDrinks, { name: "", ml: "" }])
                }
                className="flex items-center gap-1 text-sm text-amiste-primary font-bold mt-2"
              >
                <Plus size={16} /> Adicionar Bebida
              </button>
            </div>
          </div>
        )}

        {/* === PASSO 6: ACESSÓRIOS === */}
        {currentStep === 6 && (
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6">6. Acessórios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {accessoriesList.map((acc) => (
                <div
                  key={acc}
                  className={`p-3 border rounded-lg flex flex-col gap-2 ${selectedAccessories[acc] !== undefined ? "bg-red-50 border-amiste-primary" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-amiste-primary"
                      checked={selectedAccessories[acc] !== undefined}
                      onChange={() =>
                        toggleItem(
                          selectedAccessories,
                          setSelectedAccessories,
                          acc,
                          "1",
                        )
                      }
                    />
                    <span className="font-medium">{acc}</span>
                  </div>
                  {selectedAccessories[acc] !== undefined && (
                    <input
                      type="text"
                      placeholder="Qtd"
                      className="w-full p-1 text-sm border rounded bg-white"
                      value={selectedAccessories[acc]}
                      onChange={(e) =>
                        updateItemValue(
                          selectedAccessories,
                          setSelectedAccessories,
                          acc,
                          e.target.value,
                        )
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === PASSO 7: INSUMOS === */}
        {currentStep === 7 && (
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6">7. Insumos Iniciais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliesList.map((item) => (
                <div
                  key={item}
                  className={`p-3 border rounded-lg flex items-center gap-3 ${selectedSupplies[item] !== undefined ? "bg-red-50 border-amiste-primary" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-amiste-primary"
                    checked={selectedSupplies[item] !== undefined}
                    onChange={() =>
                      toggleItem(
                        selectedSupplies,
                        setSelectedSupplies,
                        item,
                        "1",
                      )
                    }
                  />
                  <span className="flex-1 font-medium text-sm">{item}</span>
                  {selectedSupplies[item] !== undefined && (
                    <input
                      type="text"
                      placeholder="Qtd"
                      className="w-20 p-1 text-sm border rounded bg-white"
                      value={selectedSupplies[item]}
                      onChange={(e) =>
                        updateItemValue(
                          selectedSupplies,
                          setSelectedSupplies,
                          item,
                          e.target.value,
                        )
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === PASSO 8: PREPARAÇÃO DO LOCAL (Com Validação) === */}
        {currentStep === 8 && (
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6">8. Validação do Local</h2>

            {/* Tomada */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <p className="font-bold mb-2">Tomada do Cliente (Parede)</p>
              <div className="flex gap-4 mb-2">
                <label>
                  <input
                    type="radio"
                    name="ls"
                    value="10A"
                    onChange={(e) => setLocalSocket(e.target.value)}
                  />{" "}
                  10A
                </label>
                <label>
                  <input
                    type="radio"
                    name="ls"
                    value="20A"
                    onChange={(e) => setLocalSocket(e.target.value)}
                  />{" "}
                  20A
                </label>
              </div>
              {/* Lógica de Aviso: Se máquina é 20A e local é 10A */}
              {machineItems[0]?.voltage &&
                localSocket &&
                machineItems.some((m) => m.voltage !== localSocket) && (
                  // Nota: Aqui estou comparando string voltage x socket, idealmente teríamos a amperagem da máquina no state.
                  // Vou assumir a lógica visual: se o usuário marcar diferente, avisa.
                  <div className="text-amber-600 text-sm flex items-center gap-1">
                    <AlertCircle size={14} /> Verifique se a tomada é compatível
                    com a máquina ({selectedMachineData?.amperage}).
                  </div>
                )}
            </div>

            {/* Hídrica */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <p className="font-bold mb-2">O Local possui Ponto de Água?</p>
              <div className="flex gap-4 mb-2">
                <label>
                  <input
                    type="radio"
                    name="lw"
                    value="Sim"
                    onChange={(e) => setLocalWater(e.target.value)}
                  />{" "}
                  Sim
                </label>
                <label>
                  <input
                    type="radio"
                    name="lw"
                    value="Não"
                    onChange={(e) => setLocalWater(e.target.value)}
                  />{" "}
                  Não
                </label>
              </div>
              {waterInstall === "Sim" && localWater === "Não" && (
                <div className="bg-red-100 text-red-700 p-2 rounded text-sm font-bold flex items-center gap-2">
                  <AlertCircle size={16} /> ATENÇÃO: Máquina precisa de rede
                  hídrica, mas local não tem! Avise o cliente.
                </div>
              )}
            </div>
          </div>
        )}

        {/* === PASSO 9: FINALIZAÇÃO === */}
        {currentStep === 9 && (
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6">
              9. Finalização e Contrato
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Nº Contrato *
                </label>
                <input
                  className="w-full p-3 border rounded-lg"
                  value={contractNum}
                  onChange={(e) => setContractNum(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Ficha Instalação (Opcional)
                </label>
                <input
                  className="w-full p-3 border rounded-lg"
                  value={installFileNum}
                  onChange={(e) => setInstallFileNum(e.target.value)}
                />
              </div>
            </div>

            {/* Financeiro */}
            <div className="bg-gray-800 text-white p-6 rounded-xl mb-6">
              <h3 className="font-bold border-b border-gray-600 pb-2 mb-4">
                Valores Negociados
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-400">Valor Máquina</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700 border-none rounded text-white"
                    value={valMachine}
                    onChange={(e) => setValMachine(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Insumos</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700 border-none rounded text-white"
                    value={valSupplies}
                    onChange={(e) => setValSupplies(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Serviços</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700 border-none rounded text-white"
                    value={valServices}
                    onChange={(e) => setValServices(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">Extras</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700 border-none rounded text-white"
                    value={valExtras}
                    onChange={(e) => setValExtras(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <div className="text-right text-2xl font-bold text-green-400">
                Total: R${" "}
                {(valMachine + valSupplies + valServices + valExtras).toFixed(
                  2,
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">
                Observações da Venda
              </label>
              <textarea
                className="w-full p-3 border rounded-lg"
                rows="3"
                value={salesObs}
                onChange={(e) => setSalesObs(e.target.value)}
              ></textarea>
            </div>
          </div>
        )}

        {/* === BOTÕES DE NAVEGAÇÃO === */}
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
              {currentStep === totalSteps ? (
                <>
                  {" "}
                  <Check size={20} /> Finalizar{" "}
                </>
              ) : (
                <>
                  {" "}
                  Próximo <ArrowRight size={20} />{" "}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
