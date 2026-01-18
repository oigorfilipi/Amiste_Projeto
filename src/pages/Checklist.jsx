import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Search,
  Calendar,
  Coffee,
  MoreHorizontal,
} from "lucide-react";

export function Checklist() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // --- CONTROLE DE TELA (LISTA vs WIZARD) ---
  const [view, setView] = useState("list"); // 'list' ou 'wizard'

  // --- ESTADOS GERAIS ---
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [machinesList, setMachinesList] = useState([]);
  const [checklistsHistory, setChecklistsHistory] = useState([]);

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

  // Configs Técnicas Máquina
  const [waterInstall, setWaterInstall] = useState("Não");
  const [sewageInstall, setSewageInstall] = useState("Não"); // Novo
  const [paymentSystem, setPaymentSystem] = useState("Não");
  const [paymentType, setPaymentType] = useState("");
  const [steamWand, setSteamWand] = useState("Não"); // Novo

  // --- PASSO 3: APARATOS ---
  const [tools, setTools] = useState({
    caixaFerramentas: false,
    luvas: false,
    transformador: false,
    extensao: false,
    pano: false,
    balde: false,
    adaptador: false,
    // Hídrica Sim
    conexoes: false,
    filtro: false,
    mangueiras: false,
    tampoes: false,
    // Hídrica Não / Esgoto
    galao: false,
    mangueiraEsgoto: false,
  });
  const [gallonQty, setGallonQty] = useState("");

  // --- PASSO 4: PREPARATIVOS ---
  const [configStatus, setConfigStatus] = useState("Não");
  const [configDate, setConfigDate] = useState("");
  const [testStatus, setTestStatus] = useState("Não");
  const [testDate, setTestDate] = useState("");

  // --- PASSO 5: BEBIDAS ---
  const [selectedDrinks, setSelectedDrinks] = useState({});
  const [customDrinks, setCustomDrinks] = useState([]);

  // --- PASSO 6: ACESSÓRIOS ---
  const [selectedAccessories, setSelectedAccessories] = useState({});
  const [customAccessories, setCustomAccessories] = useState([]); // [{ name: '', qty: '' }]
  const [noAccessories, setNoAccessories] = useState(false);

  // --- PASSO 7: INSUMOS (ESTRUTURA COMPLEXA) ---
  const [noSupplies, setNoSupplies] = useState(false);
  const [suppliesData, setSuppliesData] = useState({
    solubles: {
      "Café Gourmet (Solúvel)": { active: false, qty: "" },
      Chocolate: { active: false, qty: "" },
      Cappuccino: { active: false, qty: "" },
      "Cappuccino Zero": { active: false, qty: "" },
      "Chocolate Zero": { active: false, qty: "" },
      "Latte Zero": { active: false, qty: "" },
    },
    grains: {
      "Café Gourmet": { active: false, qty: "" },
      "Café Premium": { active: false, qty: "" },
      "Café Superior": { active: false, qty: "" },
      "Alta Mogiana": { active: false, qty: "" },
      "Região Vulcânica": { active: false, qty: "" },
      "Cerrado Mineiro": { active: false, qty: "" },
      "Pioneiro do Paraná": { active: false, qty: "" },
    },
    frappes: {
      Original: { active: false, qty: "" },
      Chocolate: { active: false, qty: "" },
      Iogurte: { active: false, qty: "" },
      Baunilha: { active: false, qty: "" },
    },
    syrups: {
      // Vora
      "Vora - Maçã Verde": { active: false, qty: "" },
      "Vora - Maracujá": { active: false, qty: "" },
      "Vora - Morango": { active: false, qty: "" },
      "Vora - Cranberry": { active: false, qty: "" },
      "Vora - Blue Lemonade": { active: false, qty: "" },
      "Vora - Pink Lemonade": { active: false, qty: "" },
      "Vora - Limão Siciliano": { active: false, qty: "" },
      "Vora - Caramelo": { active: false, qty: "" },
      "Vora - Caramelo Salgado": { active: false, qty: "" },
      "Vora - Melancia": { active: false, qty: "" },
      "Vora - Baunilha": { active: false, qty: "" },
      // DaVinci
      "DaVinci - Coco": { active: false, qty: "" },
      "DaVinci - Kiwi": { active: false, qty: "" },
      "DaVinci - Maracujá Vermelho": { active: false, qty: "" },
      "DaVinci - Jabuticaba": { active: false, qty: "" },
      "DaVinci - Morango": { active: false, qty: "" },
      "DaVinci - Melancia": { active: false, qty: "" },
      // Fabri
      "Fabri - Maracujá": { active: false, qty: "" },
      "Fabri - Maça Verde": { active: false, qty: "" },
      "Fabri - Morango": { active: false, qty: "" },
      "Fabri - Limão": { active: false, qty: "" },
      "Fabri - Banana": { active: false, qty: "" },
    },
  });
  const [customSupplies, setCustomSupplies] = useState([]); // [{category: '', name: '', qty: ''}]

  // --- PASSO 8: PREPARAÇÃO LOCAL ---
  const [localSocket, setLocalSocket] = useState("");
  const [localWater, setLocalWater] = useState("");
  const [localSewage, setLocalSewage] = useState(""); // Novo
  const [trainedPeople, setTrainedPeople] = useState(""); // Novo

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

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    fetchMachines();
    fetchChecklists();
  }, []);

  async function fetchMachines() {
    const { data } = await supabase.from("machines").select("*").order("name");
    if (data) setMachinesList(data);
  }

  async function fetchChecklists() {
    const { data } = await supabase
      .from("checklists")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setChecklistsHistory(data);
    setLoading(false);
  }

  // --- LOGICA DE CRIAÇÃO (Novo Checklist) ---
  function handleNewChecklist() {
    // Resetar todos os estados para padrão
    setCurrentStep(1);
    setInstallType("Cliente");
    setClientName("");
    setInstallDate("");
    setEventName("");
    setEventDays("");
    setPickupDate("");
    setQuantity(1);
    setSelectedMachineId("");
    setSelectedMachineData(null);
    setMachineItems([{ voltage: "220v", patrimony: "", serial: "" }]);
    setWaterInstall("Não");
    setSewageInstall("Não");
    setPaymentSystem("Não");
    setPaymentType("");
    setSteamWand("Não");
    setTools({
      caixaFerramentas: false,
      luvas: false,
      transformador: false,
      extensao: false,
      pano: false,
      balde: false,
      adaptador: false,
      conexoes: false,
      filtro: false,
      mangueiras: false,
      tampoes: false,
      galao: false,
      mangueiraEsgoto: false,
    });
    setGallonQty("");
    setConfigStatus("Não");
    setConfigDate("");
    setTestStatus("Não");
    setTestDate("");
    setSelectedDrinks({});
    setCustomDrinks([]);
    setSelectedAccessories({});
    setCustomAccessories([]);
    setNoAccessories(false);
    setNoSupplies(false);
    // Resetar suppliesData é complexo, ideal seria ter o objeto initialstate separado, mas vamos manter assim por brevidade
    setCustomSupplies([]);
    setLocalSocket("");
    setLocalWater("");
    setLocalSewage("");
    setTrainedPeople("");
    setContractNum("");
    setInstallFileNum("");
    setSalesObs("");
    setClientChanges("");
    setValMachine(0);
    setValSupplies(0);
    setValServices(0);
    setValExtras(0);

    setView("wizard");
  }

  // --- HELPERS MÁQUINA ---
  function handleMachineSelect(e) {
    const id = e.target.value;
    setSelectedMachineId(id);
    if (id) {
      const machine = machinesList.find((m) => m.id.toString() === id);
      setSelectedMachineData(machine);
      if (machine) {
        // Regras Automáticas baseadas no cadastro
        setWaterInstall(
          machine.water_system === "Rede Hídrica" ? "Sim" : "Não",
        );
        setSteamWand(machine.has_steamer === "Sim" ? "Sim" : "Não");
        // Resetamos outros por segurança
        setSewageInstall("Não");
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

  // --- HELPERS LISTAS SIMPLES ---
  const toggleItem = (state, setState, key, defaultValue = " ") => {
    const newState = { ...state };
    if (newState[key]) delete newState[key];
    else newState[key] = defaultValue;
    setState(newState);
  };
  const updateItemValue = (state, setState, key, val) => {
    setState({ ...state, [key]: val });
  };

  // --- HELPERS INSUMOS (COMPLEXO) ---
  const toggleSupply = (category, itemKey) => {
    setSuppliesData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemKey]: {
          ...prev[category][itemKey],
          active: !prev[category][itemKey].active,
        },
      },
    }));
  };
  const updateSupplyQty = (category, itemKey, qty) => {
    setSuppliesData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemKey]: {
          ...prev[category][itemKey],
          qty: qty,
        },
      },
    }));
  };

  // --- SALVAMENTO (FINAL OU RASCUNHO) ---
  async function handleSave(status = "Finalizado") {
    if (status === "Finalizado") {
      // Validações finais apenas se for finalizar
      if (!contractNum)
        return alert("Por favor, preencha o número do Contrato no passo 9.");
    }

    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        status: status,
        install_type: installType,
        client_name: installType === "Cliente" ? clientName : null,
        event_name: installType === "Evento" ? eventName : null,
        event_days: installType === "Evento" ? eventDays : null,
        install_date: installDate || null,
        pickup_date: pickupDate || null,
        machine_id: selectedMachineId,
        machine_name: selectedMachineData?.name,
        quantity: quantity,
        machine_data: selectedMachineData,
        machine_units: machineItems,
        tech_water: waterInstall,
        tech_sewage: sewageInstall,
        tech_payment: paymentSystem,
        tech_steam: steamWand,
        tools_list: { ...tools, gallonQty },
        preparations: { configStatus, configDate, testStatus, testDate },
        drinks_list: { standard: selectedDrinks, custom: customDrinks },
        accessories_list: {
          standard: selectedAccessories,
          custom: customAccessories,
          noAccessories,
        },
        supplies_list: {
          standard: suppliesData,
          custom: customSupplies,
          noSupplies,
        }, // Nova estrutura
        local_validation: {
          localSocket,
          localWater,
          localSewage,
          trainedPeople,
        },
        contract_num: contractNum,
        install_file_num: installFileNum,
        sales_obs: salesObs,
        client_changes: clientChanges,
        financials: {
          machine: valMachine,
          supplies: valSupplies,
          services: valServices,
          extras: valExtras,
          total: valMachine + valSupplies + valServices + valExtras,
        },
      };

      const { error } = await supabase.from("checklists").insert(payload);
      if (error) throw error;

      alert(
        status === "Rascunho" ? "Rascunho salvo!" : "Checklist Finalizado!",
      );
      fetchChecklists(); // Atualiza lista
      setView("list"); // Volta pra lista
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  // --- NAVEGAÇÃO WIZARD ---
  function nextStep() {
    if (currentStep === 1) {
      if (installType === "Cliente" && !clientName)
        return alert("Preencha o Nome do Cliente");
      if (installType === "Evento" && !eventName)
        return alert("Preencha o Nome do Evento");
    }
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

  // --- CONSTANTES ---
  const drinksList = [
    "Café Expresso",
    "Café Longo",
    "Leite",
    "Café c/ Leite",
    "Cappuccino",
    "Cappuccino Zero",
    "Chocolate",
    "Chocolate Zero",
    "Moccaccino",
    "Moccaccino Zero",
    "Mocca",
  ];
  const accessoriesList = [
    "Pitcher",
    "Balança",
    "Tamper",
    "Tapete de Compactação",
    "Nivelador",
    "Pincel",
    "Porta Borras",
  ];

  // --- RENDERIZAR ---
  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* TELA 1: LISTA DE CHECKLISTS */}
      {view === "list" && (
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-800">
                Checklists de Instalação
              </h1>
              <p className="text-gray-500">Gerencie as ordens de serviço.</p>
            </div>
            <button
              onClick={handleNewChecklist}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-1"
            >
              <Plus size={20} /> Novo Checklist
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {checklistsHistory.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                Nenhum checklist encontrado.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b">
                  <tr>
                    <th className="p-4">Cliente / Evento</th>
                    <th className="p-4">Máquina</th>
                    <th className="p-4">Data Inst.</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {checklistsHistory.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-bold text-gray-800">
                          {c.client_name || c.event_name}
                        </p>
                        <span className="text-xs text-gray-400">
                          {c.install_type}
                        </span>
                      </td>
                      <td className="p-4">{c.machine_name}</td>
                      <td className="p-4">
                        {c.install_date
                          ? new Date(c.install_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${c.status === "Finalizado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/checklists/${c.id}`}
                          className="text-amiste-primary hover:underline font-bold text-xs"
                        >
                          Ver Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TELA 2: WIZARD DE CRIAÇÃO */}
      {view === "wizard" && (
        <div className="p-4 md:p-8 animate-fade-in">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-800">
                Novo Checklist
              </h1>
              <p className="text-gray-500">
                Passo {currentStep} de {totalSteps}
              </p>
            </div>
            <button
              onClick={() => setView("list")}
              className="text-gray-500 hover:text-amiste-primary"
            >
              Cancelar
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-amiste-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* === PASSO 1: DADOS BÁSICOS === */}
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
                          Data Instalação *
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
                          Nome do Evento *
                        </label>
                        <input
                          className="w-full p-3 border rounded-lg"
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
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
                        {/* Correção Item 4: Data de Instalação no Evento */}
                        <div>
                          <label className="block text-sm font-bold mb-1">
                            Data Instalação *
                          </label>
                          <input
                            type="date"
                            className="w-full p-3 border rounded-lg"
                            value={installDate}
                            onChange={(e) => setInstallDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-1">
                            Data Retirada *
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

            {/* === PASSO 2: MÁQUINA === */}
            {currentStep === 2 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6">2. Dados da Máquina</h2>
                <div className="space-y-6 max-w-4xl">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-bold mb-1">
                        Modelo *
                      </label>
                      <select
                        className="w-full p-3 border rounded-lg bg-white"
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
                      <label className="block text-sm font-bold mb-1">
                        Qtd
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-3 border rounded-lg"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Correção Item 5: Label Voltagem */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">
                      Identificação das Unidades
                    </h3>
                    {machineItems.map((item, idx) => (
                      <div key={idx} className="flex gap-2 mb-2 items-center">
                        <span className="font-bold w-6">{idx + 1}.</span>
                        <div className="w-32">
                          <label className="text-[10px] text-gray-400 font-bold block">
                            Voltagem
                          </label>
                          <select
                            className="p-2 border rounded w-full bg-white"
                            value={item.voltage}
                            onChange={(e) =>
                              updateMachineItem(idx, "voltage", e.target.value)
                            }
                          >
                            <option>220v</option>
                            <option>110v</option>
                            <option>Bivolt</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-400 font-bold block">
                            Série
                          </label>
                          <input
                            className="p-2 border rounded w-full"
                            placeholder="Nº Série"
                            value={item.serial}
                            onChange={(e) =>
                              updateMachineItem(idx, "serial", e.target.value)
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-400 font-bold block">
                            Patrimônio
                          </label>
                          <input
                            className="p-2 border rounded w-full"
                            placeholder="Patrimônio"
                            value={item.patrimony}
                            onChange={(e) =>
                              updateMachineItem(
                                idx,
                                "patrimony",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Correção Item 3: Campos Faltantes (Esgoto, Vapor, Conexões) */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                    <div>
                      <span className="block font-bold text-sm mb-2">
                        Instalação Hídrica?
                      </span>
                      <div className="flex gap-4 mb-2">
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
                    <div>
                      <span className="block font-bold text-sm mb-2">
                        Rede de Esgoto?
                      </span>
                      <div className="flex gap-4">
                        <label>
                          <input
                            type="radio"
                            name="sew"
                            value="Sim"
                            checked={sewageInstall === "Sim"}
                            onChange={(e) => setSewageInstall(e.target.value)}
                          />{" "}
                          Sim
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="sew"
                            value="Não"
                            checked={sewageInstall === "Não"}
                            onChange={(e) => setSewageInstall(e.target.value)}
                          />{" "}
                          Não
                        </label>
                      </div>
                    </div>
                    <div>
                      <span className="block font-bold text-sm mb-2">
                        Sistema Pagamento?
                      </span>
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
                      {paymentSystem === "Sim" && (
                        <div className="mt-2 text-sm">
                          Configurar:{" "}
                          <label className="ml-2">
                            <input
                              type="radio"
                              name="pt"
                              value="Stone"
                              onChange={(e) => setPaymentType(e.target.value)}
                            />{" "}
                            Stone
                          </label>
                          <label className="ml-2">
                            <input
                              type="radio"
                              name="pt"
                              value="Outro"
                              onChange={(e) => setPaymentType(e.target.value)}
                            />{" "}
                            Outro
                          </label>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="block font-bold text-sm mb-2">
                        Bico Vaporizador?
                      </span>
                      <div className="flex gap-4">
                        <label>
                          <input
                            type="radio"
                            name="vap"
                            value="Sim"
                            checked={steamWand === "Sim"}
                            onChange={(e) => setSteamWand(e.target.value)}
                          />{" "}
                          Sim
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="vap"
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

            {/* === PASSO 3: APARATOS === */}
            {currentStep === 3 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6">3. Aparatos</h2>
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

                  {/* Item 3: Conexões Hídricas aparecem se Sim */}
                  {waterInstall === "Sim" && (
                    <div className="col-span-2 md:col-span-3 bg-blue-50 p-4 rounded-lg border border-blue-200 mt-2">
                      <p className="font-bold text-blue-800 text-sm mb-2">
                        Rede Hídrica Ativa:
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        {["conexoes", "filtro", "mangueiras", "tampoes"].map(
                          (key) => (
                            <label
                              key={key}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={tools[key]}
                                onChange={(e) =>
                                  setTools({
                                    ...tools,
                                    [key]: e.target.checked,
                                  })
                                }
                                className="accent-blue-600"
                              />
                              <span className="capitalize text-sm font-medium">
                                {key}
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hídrica Não */}
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

                  {/* Esgoto Sim */}
                  {sewageInstall === "Sim" && (
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer bg-green-50 border-green-200">
                      <input
                        type="checkbox"
                        checked={tools.mangueiraEsgoto}
                        onChange={(e) =>
                          setTools({
                            ...tools,
                            mangueiraEsgoto: e.target.checked,
                          })
                        }
                        className="accent-green-600 w-5 h-5"
                      />
                      <span className="font-medium text-green-900">
                        Mangueira Esgoto
                      </span>
                    </label>
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

            {/* === PASSO 5: BEBIDAS (Item 6 corrigido) === */}
            {currentStep === 5 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6">
                  5. Configuração de Bebidas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drinksList.map((drink) => (
                    <div
                      key={drink}
                      className={`p-3 border rounded-lg flex flex-col gap-2 ${selectedDrinks[drink] !== undefined ? "bg-red-50 border-amiste-primary shadow-sm" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-amiste-primary"
                          checked={selectedDrinks[drink] !== undefined}
                          onChange={() =>
                            toggleItem(
                              selectedDrinks,
                              setSelectedDrinks,
                              drink,
                              " ",
                            )
                          }
                        />
                        <span className="font-medium text-sm">{drink}</span>
                      </div>
                      {selectedDrinks[drink] !== undefined && (
                        <input
                          type="text"
                          placeholder="Qtd ML"
                          className="w-full p-2 text-sm border rounded bg-white"
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

                <div className="mt-6 border-t pt-4">
                  <p className="font-bold text-sm mb-2">Outras Bebidas:</p>
                  {customDrinks.map((cd, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        placeholder="Nome"
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
                    <Plus size={16} /> Adicionar
                  </button>
                </div>
              </div>
            )}

            {/* === PASSO 6: ACESSÓRIOS (Item 7 corrigido) === */}
            {currentStep === 6 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6">6. Acessórios</h2>

                <div className="mb-4">
                  <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noAccessories}
                      onChange={(e) => setNoAccessories(e.target.checked)}
                      className="w-5 h-5 accent-gray-600"
                    />
                    Sem Acessórios
                  </label>
                </div>

                {!noAccessories && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                    <div className="border-t pt-4">
                      <p className="font-bold text-sm mb-2">
                        Outros Acessórios:
                      </p>
                      {customAccessories.map((ca, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input
                            placeholder="Nome do Acessório"
                            className="flex-1 p-2 border rounded"
                            value={ca.name}
                            onChange={(e) => {
                              const n = [...customAccessories];
                              n[idx].name = e.target.value;
                              setCustomAccessories(n);
                            }}
                          />
                          <input
                            placeholder="Qtd"
                            className="w-24 p-2 border rounded"
                            value={ca.qty}
                            onChange={(e) => {
                              const n = [...customAccessories];
                              n[idx].qty = e.target.value;
                              setCustomAccessories(n);
                            }}
                          />
                          <button
                            onClick={() => {
                              const n = [...customAccessories];
                              n.splice(idx, 1);
                              setCustomAccessories(n);
                            }}
                            className="text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          setCustomAccessories([
                            ...customAccessories,
                            { name: "", qty: "" },
                          ])
                        }
                        className="flex items-center gap-1 text-sm text-amiste-primary font-bold mt-2"
                      >
                        <Plus size={16} /> Adicionar Outro
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* === PASSO 7: INSUMOS (Item 8 Corrigido - CATEGORIAS) === */}
            {currentStep === 7 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6">7. Insumos</h2>

                <div className="mb-6">
                  <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noSupplies}
                      onChange={(e) => setNoSupplies(e.target.checked)}
                      className="w-5 h-5 accent-gray-600"
                    />
                    Sem Insumos
                  </label>
                </div>

                {!noSupplies && (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {/* Solúveis */}
                    <div className="min-w-[250px] bg-white border rounded-lg p-4">
                      <h3 className="font-bold text-amiste-primary border-b pb-2 mb-3 uppercase text-sm">
                        Solúveis
                      </h3>
                      {Object.keys(suppliesData.solubles).map((key) => (
                        <div key={key} className="mb-2">
                          <label className="flex items-center gap-2 text-sm cursor-pointer mb-1">
                            <input
                              type="checkbox"
                              checked={suppliesData.solubles[key].active}
                              onChange={() => toggleSupply("solubles", key)}
                            />
                            {key}
                          </label>
                          {suppliesData.solubles[key].active && (
                            <input
                              type="text"
                              placeholder="Qtd (ex: 1kg)"
                              className="w-full p-1 border rounded text-xs"
                              value={suppliesData.solubles[key].qty}
                              onChange={(e) =>
                                updateSupplyQty("solubles", key, e.target.value)
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Grãos */}
                    <div className="min-w-[250px] bg-white border rounded-lg p-4">
                      <h3 className="font-bold text-amiste-primary border-b pb-2 mb-3 uppercase text-sm">
                        Grãos
                      </h3>
                      {Object.keys(suppliesData.grains).map((key) => (
                        <div key={key} className="mb-2">
                          <label className="flex items-center gap-2 text-sm cursor-pointer mb-1">
                            <input
                              type="checkbox"
                              checked={suppliesData.grains[key].active}
                              onChange={() => toggleSupply("grains", key)}
                            />
                            {key}
                          </label>
                          {suppliesData.grains[key].active && (
                            <input
                              type="text"
                              placeholder="Qtd"
                              className="w-full p-1 border rounded text-xs"
                              value={suppliesData.grains[key].qty}
                              onChange={(e) =>
                                updateSupplyQty("grains", key, e.target.value)
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Frappés */}
                    <div className="min-w-[250px] bg-white border rounded-lg p-4">
                      <h3 className="font-bold text-amiste-primary border-b pb-2 mb-3 uppercase text-sm">
                        Frappés
                      </h3>
                      {Object.keys(suppliesData.frappes).map((key) => (
                        <div key={key} className="mb-2">
                          <label className="flex items-center gap-2 text-sm cursor-pointer mb-1">
                            <input
                              type="checkbox"
                              checked={suppliesData.frappes[key].active}
                              onChange={() => toggleSupply("frappes", key)}
                            />
                            {key}
                          </label>
                          {suppliesData.frappes[key].active && (
                            <input
                              type="text"
                              placeholder="Qtd"
                              className="w-full p-1 border rounded text-xs"
                              value={suppliesData.frappes[key].qty}
                              onChange={(e) =>
                                updateSupplyQty("frappes", key, e.target.value)
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Xaropes (Com subcategorias visuais) */}
                    <div className="min-w-[250px] bg-white border rounded-lg p-4">
                      <h3 className="font-bold text-amiste-primary border-b pb-2 mb-3 uppercase text-sm">
                        Xaropes
                      </h3>
                      {Object.keys(suppliesData.syrups).map((key) => {
                        // Pequena lógica visual para separar marcas
                        const brand = key.split(" - ")[0];
                        const prevKey = Object.keys(suppliesData.syrups)[
                          Object.keys(suppliesData.syrups).indexOf(key) - 1
                        ];
                        const prevBrand = prevKey
                          ? prevKey.split(" - ")[0]
                          : "";

                        return (
                          <div key={key}>
                            {brand !== prevBrand && (
                              <p className="text-xs font-bold text-gray-400 mt-2 mb-1 uppercase">
                                {brand}
                              </p>
                            )}
                            <div className="mb-2 pl-2 border-l-2 border-gray-100">
                              <label className="flex items-center gap-2 text-sm cursor-pointer mb-1">
                                <input
                                  type="checkbox"
                                  checked={suppliesData.syrups[key].active}
                                  onChange={() => toggleSupply("syrups", key)}
                                />
                                {key.split(" - ")[1] || key}
                              </label>
                              {suppliesData.syrups[key].active && (
                                <input
                                  type="text"
                                  placeholder="Qtd"
                                  className="w-full p-1 border rounded text-xs"
                                  value={suppliesData.syrups[key].qty}
                                  onChange={(e) =>
                                    updateSupplyQty(
                                      "syrups",
                                      key,
                                      e.target.value,
                                    )
                                  }
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* === PASSO 8: VALIDAÇÃO LOCAL (Item 9 Corrigido) === */}
            {currentStep === 8 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6">8. Validação Local</h2>

                {/* Tomada com Alerta de Amperagem */}
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
                  {selectedMachineData?.amperage &&
                    localSocket &&
                    selectedMachineData.amperage !== localSocket && (
                      <div className="bg-amber-100 text-amber-800 p-3 rounded-lg flex items-center gap-2 font-bold animate-pulse">
                        <AlertCircle size={20} />
                        ALERTA: A máquina é {selectedMachineData.amperage}, mas
                        o local é {localSocket}. Informe o cliente!
                      </div>
                    )}
                </div>

                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <p className="font-bold mb-2">Ponto de Água?</p>
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
                      hídrica!
                    </div>
                  )}
                </div>

                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <p className="font-bold mb-2">Rede de Esgoto?</p>
                  <div className="flex gap-4 mb-2">
                    <label>
                      <input
                        type="radio"
                        name="lsw"
                        value="Sim"
                        onChange={(e) => setLocalSewage(e.target.value)}
                      />{" "}
                      Sim
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="lsw"
                        value="Não"
                        onChange={(e) => setLocalSewage(e.target.value)}
                      />{" "}
                      Não
                    </label>
                  </div>
                  {sewageInstall === "Sim" && localSewage === "Não" && (
                    <div className="bg-red-100 text-red-700 p-2 rounded text-sm font-bold flex items-center gap-2">
                      <AlertCircle size={16} /> ATENÇÃO: Máquina precisa de
                      esgoto!
                    </div>
                  )}
                </div>

                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <p className="font-bold mb-2">
                    Quantas pessoas para treinar?
                  </p>
                  <input
                    type="number"
                    className="p-2 border rounded w-32"
                    placeholder="Ex: 3"
                    value={trainedPeople}
                    onChange={(e) => setTrainedPeople(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* === PASSO 9: FINALIZAÇÃO === */}
            {currentStep === 9 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6">9. Finalização</h2>
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
                      Ficha Instalação
                    </label>
                    <input
                      className="w-full p-3 border rounded-lg"
                      value={installFileNum}
                      onChange={(e) => setInstallFileNum(e.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-gray-800 text-white p-6 rounded-xl mb-6">
                  <h3 className="font-bold border-b border-gray-600 pb-2 mb-4">
                    Valores
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-400">Máquina</label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 border-none rounded text-white"
                        value={valMachine}
                        onChange={(e) =>
                          setValMachine(parseFloat(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Insumos</label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 border-none rounded text-white"
                        value={valSupplies}
                        onChange={(e) =>
                          setValSupplies(parseFloat(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Serviços</label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 border-none rounded text-white"
                        value={valServices}
                        onChange={(e) =>
                          setValServices(parseFloat(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Extras</label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 border-none rounded text-white"
                        value={valExtras}
                        onChange={(e) =>
                          setValExtras(parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  <div className="text-right text-2xl font-bold text-green-400">
                    Total: R${" "}
                    {(
                      valMachine +
                      valSupplies +
                      valServices +
                      valExtras
                    ).toFixed(2)}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-1">
                    Observações Venda
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    rows="2"
                    value={salesObs}
                    onChange={(e) => setSalesObs(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-1">
                    Alterações Solicitadas
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    rows="2"
                    value={clientChanges}
                    onChange={(e) => setClientChanges(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}

            {/* === RODAPÉ === */}
            <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
              >
                <ArrowLeft size={20} /> Voltar
              </button>
              <div className="flex gap-4">
                {/* Correção Item 2: Salvar Rascunho funcional */}
                <button
                  onClick={() => handleSave("Rascunho")}
                  className="flex items-center gap-2 px-4 py-2 text-amiste-primary font-bold hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Save size={20} />{" "}
                  <span className="hidden md:inline">Salvar Rascunho</span>
                </button>
                <button
                  onClick={
                    currentStep === totalSteps
                      ? () => handleSave("Finalizado")
                      : nextStep
                  }
                  disabled={saving}
                  className="flex items-center gap-2 bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {saving ? (
                    "Salvando..."
                  ) : currentStep === totalSteps ? (
                    <>
                      <Check size={20} /> Finalizar
                    </>
                  ) : (
                    <>
                      Próximo <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
