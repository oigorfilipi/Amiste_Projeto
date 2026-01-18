import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Search,
  Edit,
  MoreHorizontal,
  X,
  Coffee,
  Calendar, // <--- ADICIONE ESTES DOIS
} from "lucide-react";

export function Checklist() {
  const { user } = useContext(AuthContext);

  // --- CONTROLE DE TELA ---
  const [view, setView] = useState("list"); // 'list' ou 'wizard'
  const [editingId, setEditingId] = useState(null); // ID do checklist sendo editado
  const [filterStatus, setFilterStatus] = useState("Todos"); // Todos, Finalizado, Rascunho

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

  const [waterInstall, setWaterInstall] = useState("Não");
  const [sewageInstall, setSewageInstall] = useState("Não");
  const [paymentSystem, setPaymentSystem] = useState("Não");
  const [paymentType, setPaymentType] = useState("");
  const [steamWand, setSteamWand] = useState("Não");

  // --- PASSO 3: APARATOS ---
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
    mangueiras: false,
    tampoes: false,
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
  const [customAccessories, setCustomAccessories] = useState([]);
  const [noAccessories, setNoAccessories] = useState(false);

  // --- PASSO 7: INSUMOS ---
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
      "DaVinci - Coco": { active: false, qty: "" },
      "DaVinci - Kiwi": { active: false, qty: "" },
      "DaVinci - Maracujá Vermelho": { active: false, qty: "" },
      "DaVinci - Jabuticaba": { active: false, qty: "" },
      "DaVinci - Morango": { active: false, qty: "" },
      "DaVinci - Melancia": { active: false, qty: "" },
      "Fabri - Maracujá": { active: false, qty: "" },
      "Fabri - Maça Verde": { active: false, qty: "" },
      "Fabri - Morango": { active: false, qty: "" },
      "Fabri - Limão": { active: false, qty: "" },
      "Fabri - Banana": { active: false, qty: "" },
    },
  });
  const [customSupplies, setCustomSupplies] = useState([]);

  // --- PASSO 8: PREPARAÇÃO LOCAL ---
  const [localSocket, setLocalSocket] = useState("");
  const [localWater, setLocalWater] = useState("");
  const [localSewage, setLocalSewage] = useState("");
  const [trainedPeople, setTrainedPeople] = useState("");

  // --- PASSO 9: FINALIZAÇÃO ---
  const [contractNum, setContractNum] = useState("");
  const [installFileNum, setInstallFileNum] = useState("");
  const [salesObs, setSalesObs] = useState("");
  const [clientChanges, setClientChanges] = useState("");
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

  // --- LÓGICA DE EXCLUSÃO ---
  async function handleDelete(id) {
    if (
      !confirm(
        "Tem certeza que deseja excluir este checklist? Essa ação não pode ser desfeita.",
      )
    )
      return;

    try {
      const { error } = await supabase.from("checklists").delete().eq("id", id);
      if (error) throw error;
      alert("Checklist excluído!");
      fetchChecklists();
    } catch (error) {
      alert("Erro ao excluir: " + error.message);
    }
  }

  // --- LÓGICA DE EDIÇÃO (CARREGAR DADOS) ---
  function handleEdit(checklist) {
    // 1. Setar ID para saber que é edição
    setEditingId(checklist.id);

    // 2. Preencher Passo 1
    setInstallType(checklist.install_type || "Cliente");
    setClientName(checklist.client_name || "");
    setEventName(checklist.event_name || "");
    setEventDays(checklist.event_days || "");
    setInstallDate(checklist.install_date || "");
    setPickupDate(checklist.pickup_date || "");

    // 3. Preencher Passo 2 (Máquina)
    setQuantity(checklist.quantity || 1);
    setSelectedMachineId(
      checklist.machine_id ? checklist.machine_id.toString() : "",
    );
    setSelectedMachineData(checklist.machine_data || null);
    setMachineItems(
      checklist.machine_units || [
        { voltage: "220v", patrimony: "", serial: "" },
      ],
    );

    // Configs Técnicas
    setWaterInstall(checklist.tech_water || "Não");
    setSewageInstall(checklist.tech_sewage || "Não");
    setPaymentSystem(checklist.tech_payment || "Não");
    setSteamWand(checklist.tech_steam || "Não");
    // Obs: paymentType não estava no DB, teria que adicionar se fosse crítico, ou assumir 'Não'

    // 4. Listas (JSON)
    if (checklist.tools_list) {
      const { gallonQty: gQty, ...tList } = checklist.tools_list;
      setTools(tList);
      setGallonQty(gQty || "");
    }

    if (checklist.preparations) {
      setConfigStatus(checklist.preparations.configStatus || "Não");
      setConfigDate(checklist.preparations.configDate || "");
      setTestStatus(checklist.preparations.testStatus || "Não");
      setTestDate(checklist.preparations.testDate || "");
    }

    if (checklist.drinks_list) {
      setSelectedDrinks(checklist.drinks_list.standard || {});
      setCustomDrinks(checklist.drinks_list.custom || []);
    }

    if (checklist.accessories_list) {
      setSelectedAccessories(checklist.accessories_list.standard || {});
      setCustomAccessories(checklist.accessories_list.custom || []);
      setNoAccessories(checklist.accessories_list.noAccessories || false);
    }

    if (checklist.supplies_list) {
      // Mescla o que veio do banco com o objeto padrão para não quebrar chaves novas
      setSuppliesData((prev) => ({
        ...prev,
        ...checklist.supplies_list.standard,
      }));
      setCustomSupplies(checklist.supplies_list.custom || []);
      setNoSupplies(checklist.supplies_list.noSupplies || false);
    }

    if (checklist.local_validation) {
      setLocalSocket(checklist.local_validation.localSocket || "");
      setLocalWater(checklist.local_validation.localWater || "");
      setLocalSewage(checklist.local_validation.localSewage || "");
      setTrainedPeople(checklist.local_validation.trainedPeople || "");
    }

    // 5. Finalização
    setContractNum(checklist.contract_num || "");
    setInstallFileNum(checklist.install_file_num || "");
    setSalesObs(checklist.sales_obs || "");
    setClientChanges(checklist.client_changes || ""); // Campo novo

    if (checklist.financials) {
      setValMachine(checklist.financials.machine || 0);
      setValSupplies(checklist.financials.supplies || 0);
      setValServices(checklist.financials.services || 0);
      setValExtras(checklist.financials.extras || 0);
    }

    // 6. Mudar tela
    setCurrentStep(1);
    setView("wizard");
  }

  // --- INICIAR NOVO ---
  function handleNewChecklist() {
    setEditingId(null); // Limpa ID para ser um insert
    // Reset manual dos campos
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
    // Reset tools...
    const cleanTools = {
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
    };
    setTools(cleanTools);
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
    setCustomSupplies([]);
    // Reset suppliesData é pesado, vou assumir o state inicial ou fazer reload se necessário
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

  // --- HELPERS E FUNÇÕES AUXILIARES ---
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

  const toggleItem = (state, setState, key, defaultValue = " ") => {
    const newState = { ...state };
    if (newState[key]) delete newState[key];
    else newState[key] = defaultValue;
    setState(newState);
  };
  const updateItemValue = (state, setState, key, val) => {
    setState({ ...state, [key]: val });
  };

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
        [itemKey]: { ...prev[category][itemKey], qty: qty },
      },
    }));
  };

  // --- SALVAR OU ATUALIZAR ---
  async function handleSave(status = "Finalizado") {
    if (status === "Finalizado" && !contractNum)
      return alert("Preencha o Contrato no passo 9.");

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
        },
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

      if (editingId) {
        // ATUALIZAR (UPDATE)
        const { error } = await supabase
          .from("checklists")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        alert("Checklist atualizado com sucesso!");
      } else {
        // CRIAR NOVO (INSERT)
        const { error } = await supabase.from("checklists").insert(payload);
        if (error) throw error;
        alert(status === "Rascunho" ? "Rascunho criado!" : "Checklist criado!");
      }

      fetchChecklists();
      setView("list");
      setEditingId(null);
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

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* TELA 1: LISTA */}
      {view === "list" && (
        <div className="p-8">
          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-800">
                Checklists de Instalação
              </h1>
              <p className="text-gray-500">
                Gerencie as ordens de serviço e instalações.
              </p>
            </div>
            <button
              onClick={handleNewChecklist}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-transform"
            >
              <Plus size={20} /> Novo Checklist
            </button>
          </div>

          {/* BARRA DE FILTROS (NOVO) */}
          <div className="bg-white p-2 rounded-lg border border-gray-200 inline-flex mb-6 shadow-sm">
            {["Todos", "Finalizado", "Rascunho"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  filterStatus === status
                    ? "bg-gray-800 text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {status === "Todos"
                  ? "Todos"
                  : status === "Finalizado"
                    ? "Finalizados"
                    : "Rascunhos"}
              </button>
            ))}
          </div>

          {/* TABELA ATUALIZADA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {checklistsHistory.filter(
              (c) => filterStatus === "Todos" || c.status === filterStatus,
            ).length === 0 ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                <Search size={48} className="mb-4 opacity-20" />
                <p>
                  Nenhum checklist encontrado com o filtro "{filterStatus}".
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b">
                    <tr>
                      <th className="p-4">Data Criação / Usuário</th>
                      <th className="p-4">Cliente / Evento</th>
                      <th className="p-4">Máquina</th>
                      <th className="p-4">Data Instalação</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {checklistsHistory
                      .filter(
                        (c) =>
                          filterStatus === "Todos" || c.status === filterStatus,
                      )
                      .map((c) => (
                        <tr
                          key={c.id}
                          className="hover:bg-gray-50 group transition-colors"
                        >
                          {/* Coluna 1: Criação e Usuário */}
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700">
                                {new Date(c.created_at).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(c.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              <span className="mt-1 text-xs bg-gray-100 px-2 py-0.5 rounded w-fit text-gray-500 border border-gray-200">
                                {c.user_id === user?.id
                                  ? "Você"
                                  : "Outro Usuário"}
                              </span>
                            </div>
                          </td>

                          {/* Coluna 2: Cliente */}
                          <td className="p-4">
                            <p className="font-bold text-gray-800 text-lg">
                              {c.client_name || c.event_name}
                            </p>
                            <span className="text-xs font-bold text-amiste-primary bg-red-50 px-2 py-0.5 rounded border border-red-100">
                              {c.install_type}
                            </span>
                          </td>

                          {/* Coluna 3: Máquina */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Coffee size={16} className="text-gray-400" />
                              <span className="font-medium text-gray-700">
                                {c.machine_name}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                x{c.quantity}
                              </span>
                            </div>
                          </td>

                          {/* Coluna 4: Data Instalação */}
                          <td className="p-4 text-gray-600">
                            {c.install_date ? (
                              <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" />
                                {new Date(c.install_date).toLocaleDateString()}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>

                          {/* Coluna 5: Status */}
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                c.status === "Finalizado"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>

                          {/* Coluna 6: Ações */}
                          <td className="p-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              {/* Botão Editar (Lápis) */}
                              <button
                                onClick={() => handleEdit(c)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Editar Checklist"
                              >
                                <Edit size={18} />
                              </button>

                              {/* Botão Ver Detalhes (Olho/Lupa) - AGORA VISÍVEL PARA TODOS */}
                              <Link
                                to={`/checklists/${c.id}`}
                                className="flex items-center gap-1 p-2 text-amiste-primary hover:bg-red-50 rounded transition-colors font-bold text-xs"
                                title="Ver Detalhes e PDF"
                              >
                                <Search size={16} /> Detalhes
                              </Link>

                              {/* Botão Excluir (Lixeira) */}
                              <button
                                onClick={() => handleDelete(c.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TELA 2: WIZARD */}
      {view === "wizard" && (
        <div className="p-4 md:p-8 animate-fade-in">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-800">
                {editingId ? "Editando Checklist" : "Novo Checklist"}
              </h1>
              <p className="text-gray-500">
                Passo {currentStep} de {totalSteps}
              </p>
            </div>
            <button
              onClick={() => setView("list")}
              className="text-gray-500 hover:text-red-500 font-bold flex items-center gap-1"
            >
              <X size={20} /> Cancelar
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
            {/* PASSOS DO WIZARD (CÓDIGO IDÊNTICO AO ANTERIOR, JÁ CORRIGIDO) */}
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

            {currentStep === 4 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6">4. Preparativos</h2>
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
                  {/* A data aparece aqui se estiver Configurado */}
                  {configStatus === "Configurado" && (
                    <div className="mt-2 animate-fade-in">
                      <label className="text-xs font-bold text-gray-500">
                        Data da Configuração:
                      </label>
                      <input
                        type="date"
                        className="p-2 border rounded w-full md:w-auto block mt-1"
                        value={configDate}
                        onChange={(e) => setConfigDate(e.target.value)}
                      />
                    </div>
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
                  {/* A data aparece aqui se estiver Testado */}
                  {testStatus === "Testado" && (
                    <div className="mt-2 animate-fade-in">
                      <label className="text-xs font-bold text-gray-500">
                        Data do Teste:
                      </label>
                      <input
                        type="date"
                        className="p-2 border rounded w-full md:w-auto block mt-1"
                        value={testDate}
                        onChange={(e) => setTestDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6">5. Bebidas</h2>
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
              </div>
            )}

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
                )}
              </div>
            )}

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
                            />{" "}
                            {key}
                          </label>
                          {suppliesData.solubles[key].active && (
                            <input
                              type="text"
                              placeholder="Qtd"
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
                            />{" "}
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
                            />{" "}
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
                    <div className="min-w-[250px] bg-white border rounded-lg p-4">
                      <h3 className="font-bold text-amiste-primary border-b pb-2 mb-3 uppercase text-sm">
                        Xaropes
                      </h3>
                      {Object.keys(suppliesData.syrups).map((key) => (
                        <div key={key} className="mb-2">
                          <label className="flex items-center gap-2 text-sm cursor-pointer mb-1">
                            <input
                              type="checkbox"
                              checked={suppliesData.syrups[key].active}
                              onChange={() => toggleSupply("syrups", key)}
                            />{" "}
                            {key}
                          </label>
                          {suppliesData.syrups[key].active && (
                            <input
                              type="text"
                              placeholder="Qtd"
                              className="w-full p-1 border rounded text-xs"
                              value={suppliesData.syrups[key].qty}
                              onChange={(e) =>
                                updateSupplyQty("syrups", key, e.target.value)
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 8 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6">8. Validação Local</h2>

                {/* 1. Tomada */}
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <p className="font-bold mb-2">Tomada do Cliente (Parede)</p>
                  <div className="flex gap-4 mb-2">
                    <label className="cursor-pointer flex items-center gap-2">
                      <input
                        type="radio"
                        name="ls"
                        value="10A"
                        checked={localSocket === "10A"}
                        onChange={(e) => setLocalSocket(e.target.value)}
                      />{" "}
                      10A
                    </label>
                    <label className="cursor-pointer flex items-center gap-2">
                      <input
                        type="radio"
                        name="ls"
                        value="20A"
                        checked={localSocket === "20A"}
                        onChange={(e) => setLocalSocket(e.target.value)}
                      />{" "}
                      20A
                    </label>
                  </div>
                  {selectedMachineData?.amperage &&
                    localSocket &&
                    selectedMachineData.amperage !== localSocket && (
                      <div className="bg-amber-100 text-amber-800 p-3 rounded-lg flex items-center gap-2 font-bold animate-pulse mt-2">
                        <AlertCircle size={20} />
                        ALERTA: A máquina é {selectedMachineData.amperage}, mas
                        o local é {localSocket}. Informe o cliente!
                      </div>
                    )}
                </div>

                {/* 2. Ponto de Água */}
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <p className="font-bold mb-2">
                    O Local possui Ponto de Água?
                  </p>
                  <div className="flex gap-4 mb-2">
                    <label className="cursor-pointer flex items-center gap-2">
                      <input
                        type="radio"
                        name="lw"
                        value="Sim"
                        checked={localWater === "Sim"}
                        onChange={(e) => setLocalWater(e.target.value)}
                      />{" "}
                      Sim
                    </label>
                    <label className="cursor-pointer flex items-center gap-2">
                      <input
                        type="radio"
                        name="lw"
                        value="Não"
                        checked={localWater === "Não"}
                        onChange={(e) => setLocalWater(e.target.value)}
                      />{" "}
                      Não
                    </label>
                  </div>
                  {waterInstall === "Sim" && localWater === "Não" && (
                    <div className="bg-red-100 text-red-700 p-2 rounded text-sm font-bold flex items-center gap-2 mt-2">
                      <AlertCircle size={16} /> ATENÇÃO: Máquina precisa de rede
                      hídrica, mas o local não tem!
                    </div>
                  )}
                </div>

                {/* 3. Rede de Esgoto */}
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <p className="font-bold mb-2">
                    O Local possui Rede de Esgoto?
                  </p>
                  <div className="flex gap-4 mb-2">
                    <label className="cursor-pointer flex items-center gap-2">
                      <input
                        type="radio"
                        name="lsw"
                        value="Sim"
                        checked={localSewage === "Sim"}
                        onChange={(e) => setLocalSewage(e.target.value)}
                      />{" "}
                      Sim
                    </label>
                    <label className="cursor-pointer flex items-center gap-2">
                      <input
                        type="radio"
                        name="lsw"
                        value="Não"
                        checked={localSewage === "Não"}
                        onChange={(e) => setLocalSewage(e.target.value)}
                      />{" "}
                      Não
                    </label>
                  </div>
                  {sewageInstall === "Sim" && localSewage === "Não" && (
                    <div className="bg-red-100 text-red-700 p-2 rounded text-sm font-bold flex items-center gap-2 mt-2">
                      <AlertCircle size={16} /> ATENÇÃO: Máquina precisa de
                      esgoto, mas o local não tem!
                    </div>
                  )}
                </div>

                {/* 4. Treinamento */}
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <p className="font-bold mb-2">
                    Quantas pessoas serão treinadas?
                  </p>
                  <input
                    type="number"
                    className="p-2 border rounded w-full md:w-32"
                    placeholder="Ex: 3"
                    value={trainedPeople}
                    onChange={(e) => setTrainedPeople(e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentStep === 9 && (
              <div className="p-8">
                <h2 className="text-xl font-bold mb-6">9. Finalização</h2>

                {/* Contrato e Ficha */}
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

                {/* Financeiro (VOLTOU OS INPUTS) */}
                <div className="bg-gray-800 text-white p-6 rounded-xl mb-6 shadow-lg">
                  <h3 className="font-bold border-b border-gray-600 pb-2 mb-4 text-amiste-primary">
                    Fechamento de Valores
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold block mb-1">
                        Valor Máquina
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-gray-500 text-xs">
                          R$
                        </span>
                        <input
                          type="number"
                          className="w-full bg-gray-700 border-none rounded text-white pl-6 py-2"
                          value={valMachine}
                          onChange={(e) =>
                            setValMachine(parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold block mb-1">
                        Valor Insumos
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-gray-500 text-xs">
                          R$
                        </span>
                        <input
                          type="number"
                          className="w-full bg-gray-700 border-none rounded text-white pl-6 py-2"
                          value={valSupplies}
                          onChange={(e) =>
                            setValSupplies(parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold block mb-1">
                        Serviços
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-gray-500 text-xs">
                          R$
                        </span>
                        <input
                          type="number"
                          className="w-full bg-gray-700 border-none rounded text-white pl-6 py-2"
                          value={valServices}
                          onChange={(e) =>
                            setValServices(parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold block mb-1">
                        Extras
                      </label>
                      <div className="relative">
                        <span className="absolute left-2 top-2 text-gray-500 text-xs">
                          R$
                        </span>
                        <input
                          type="number"
                          className="w-full bg-gray-700 border-none rounded text-white pl-6 py-2"
                          value={valExtras}
                          onChange={(e) =>
                            setValExtras(parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-right border-t border-gray-700 pt-4">
                    <span className="text-gray-400 text-sm mr-2">
                      Valor Total:
                    </span>
                    <span className="text-2xl font-bold text-green-400">
                      R${" "}
                      {(
                        valMachine +
                        valSupplies +
                        valServices +
                        valExtras
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Observações */}
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-1">
                    Observações da Venda
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg focus:border-amiste-primary outline-none"
                    rows="2"
                    value={salesObs}
                    onChange={(e) => setSalesObs(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-1">
                    Alterações Solicitadas pelo Cliente
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg focus:border-amiste-primary outline-none"
                    rows="2"
                    value={clientChanges}
                    onChange={(e) => setClientChanges(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}

            {/* RODAPÉ */}
            <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
              >
                <ArrowLeft size={20} /> Voltar
              </button>
              <div className="flex gap-4">
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
