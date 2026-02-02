import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Save,
  Plus,
  Trash2,
  Check,
  Search,
  Edit2,
  Coffee,
  Calendar,
  Wrench,
  MapPin,
  FileText,
  Package,
  Droplet,
  Zap,
  ArrowLeft,
  XCircle,
  ClipboardList,
} from "lucide-react";

// --- COMPONENTES VISUAIS REUTILIZÁVEIS ---

const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-all hover:shadow-md">
    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div className="p-2 bg-white rounded-lg shadow-sm text-amiste-primary">
        <Icon size={20} />
      </div>
      <h3 className="font-bold text-gray-800 uppercase tracking-wide text-sm">
        {title}
      </h3>
    </div>
    <div className="p-6 md:p-8">{children}</div>
  </div>
);

const RadioGroup = ({ options, value, onChange, label }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
        {label}
      </label>
    )}
    <div className="flex bg-gray-100 p-1 rounded-lg">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${
            value === opt
              ? "bg-white text-amiste-primary shadow-sm ring-1 ring-black/5"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const ToggleCard = ({ label, checked, onChange, icon: Icon }) => (
  <div
    onClick={() => onChange(!checked)}
    className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center gap-3 ${
      checked
        ? "bg-red-50 border-amiste-primary/50 ring-1 ring-amiste-primary/50"
        : "bg-white border-gray-200 hover:border-gray-300"
    }`}
  >
    <div
      className={`p-2 rounded-full ${checked ? "bg-amiste-primary text-white" : "bg-gray-100 text-gray-400"}`}
    >
      {Icon ? <Icon size={14} /> : <Check size={14} />}
    </div>
    <span
      className={`text-sm font-medium ${checked ? "text-amiste-primary" : "text-gray-600"}`}
    >
      {label}
    </span>
  </div>
);

export function Checklist() {
  const { user, permissions } = useContext(AuthContext);

  // --- CONTROLE DE TELA ---
  const [view, setView] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("Todos");

  // --- ESTADOS GERAIS ---
  const [saving, setSaving] = useState(false);
  const [machinesList, setMachinesList] = useState([]);
  const [checklistsHistory, setChecklistsHistory] = useState([]);

  // --- DADOS DO FORMULÁRIO ---
  const [installType, setInstallType] = useState("Cliente");
  const [clientName, setClientName] = useState("");
  const [installDate, setInstallDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDays, setEventDays] = useState("");
  const [pickupDate, setPickupDate] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [selectedMachineData, setSelectedMachineData] = useState(null);
  const [machineItems, setMachineItems] = useState([
    { voltage: "220v", patrimony: "", serial: "" },
  ]);

  const [waterInstall, setWaterInstall] = useState("Não");
  const [sewageInstall, setSewageInstall] = useState("Não");
  const [paymentSystem, setPaymentSystem] = useState("Não");
  const [steamWand, setSteamWand] = useState("Não");

  // Ferramentas (Estado unificado para facilitar envio)
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

  const [configStatus, setConfigStatus] = useState("Não");
  const [configDate, setConfigDate] = useState("");
  const [testStatus, setTestStatus] = useState("Não");
  const [testDate, setTestDate] = useState("");

  const [selectedDrinks, setSelectedDrinks] = useState({});
  const [customDrinks, setCustomDrinks] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState({});
  const [customAccessories, setCustomAccessories] = useState([]);
  const [noAccessories, setNoAccessories] = useState(false);

  // --- INSUMOS COMPLETOS (RESTAURADOS) ---
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

  const [localSocket, setLocalSocket] = useState("");
  const [localWater, setLocalWater] = useState("");
  const [localSewage, setLocalSewage] = useState("");
  const [trainedPeople, setTrainedPeople] = useState("");

  const [contractNum, setContractNum] = useState("");
  const [installFileNum, setInstallFileNum] = useState("");
  const [salesObs, setSalesObs] = useState("");
  const [clientChanges, setClientChanges] = useState("");
  const [valMachine, setValMachine] = useState(0);
  const [valSupplies, setValSupplies] = useState(0);
  const [valServices, setValServices] = useState(0);
  const [valExtras, setValExtras] = useState(0);

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
  }

  // --- 1. SELEÇÃO DE MÁQUINA (ATUALIZADA COM ESGOTO) ---
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
        // ADICIONADO: Puxar info de esgoto
        setSewageInstall(machine.has_sewage === true ? "Sim" : "Não");
      }
    } else {
      setSelectedMachineData(null);
    }
  }

  // ... (handleQuantityChange, updateMachineItem, toggleItem, updateItemValue, toggleSupply, updateSupplyQty mantidos iguais) ...
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
  const updateItemValue = (state, setState, key, val) =>
    setState({ ...state, [key]: val });

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

  async function handleSave(status = "Finalizado") {
    // ... validação e save mantidos iguais ...
    if (status === "Finalizado" && !contractNum)
      return alert("Preencha o Nº Contrato.");
    if (!clientName && !eventName) return alert("Preencha o Cliente/Evento.");

    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        status,
        install_type: installType,
        client_name: installType === "Cliente" ? clientName : null,
        event_name: installType === "Evento" ? eventName : null,
        event_days: installType === "Evento" ? eventDays : null,
        install_date: installDate || null,
        pickup_date: pickupDate || null,
        machine_id: selectedMachineId,
        machine_name: selectedMachineData?.name,
        quantity,
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
        const { error } = await supabase
          .from("checklists")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        alert("Atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("checklists").insert(payload);
        if (error) throw error;
        alert(status === "Rascunho" ? "Rascunho criado!" : "Checklist criado!");
      }
      fetchChecklists();
      setView("list");
      setEditingId(null);
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!permissions.canDeleteChecklist) return alert("Sem permissão.");
    if (!confirm("Excluir checklist permanentemente?")) return;
    await supabase.from("checklists").delete().eq("id", id);
    fetchChecklists();
  }

  async function handleCancelChecklist() {
    if (!editingId) return;
    if (!confirm("Tem certeza que deseja CANCELAR este serviço?")) return;
    try {
      const { error } = await supabase
        .from("checklists")
        .update({ status: "Cancelado" })
        .eq("id", editingId);
      if (error) throw error;
      alert("Checklist cancelado.");
      fetchChecklists();
      setView("list");
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  function handleEdit(checklist) {
    if (!permissions.canEditChecklist) return alert("Sem permissão.");
    setEditingId(checklist.id);
    // ... Preenchimento dos dados ...
    setInstallType(checklist.install_type || "Cliente");
    setClientName(checklist.client_name || "");
    setEventName(checklist.event_name || "");
    setEventDays(checklist.event_days || "");
    setInstallDate(checklist.install_date || "");
    setPickupDate(checklist.pickup_date || "");
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
    setWaterInstall(checklist.tech_water || "Não");
    setSewageInstall(checklist.tech_sewage || "Não");
    setPaymentSystem(checklist.tech_payment || "Não");
    setSteamWand(checklist.tech_steam || "Não");

    if (checklist.tools_list) {
      const { gallonQty: gQty, ...tList } = checklist.tools_list;
      setTools(tList);
      setGallonQty(gQty || "");
    }
    // ... Resto dos preenchimentos (mantidos para economizar espaço visual, mas devem estar aqui) ...
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
    setContractNum(checklist.contract_num || "");
    setInstallFileNum(checklist.install_file_num || "");
    setSalesObs(checklist.sales_obs || "");
    setClientChanges(checklist.client_changes || "");
    if (checklist.financials) {
      setValMachine(checklist.financials.machine || 0);
      setValSupplies(checklist.financials.supplies || 0);
      setValServices(checklist.financials.services || 0);
      setValExtras(checklist.financials.extras || 0);
    }
    setView("form");
  }

  function handleNewChecklist() {
    if (!permissions.canCreateChecklist) return alert("Sem permissão.");
    setEditingId(null);
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
    setView("form");
  }

  const getStatusColor = (st) => {
    if (st === "Finalizado") return "bg-green-100 text-green-700";
    if (st === "Cancelado") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {view === "list" && (
        <div className="max-w-6xl mx-auto p-6 md:p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-800">
                Checklists
              </h1>
              <p className="text-gray-500 mt-1">
                Gerencie ordens de serviço e instalações.
              </p>
            </div>
            {permissions.canCreateChecklist && (
              <button
                onClick={handleNewChecklist}
                className="bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
              >
                <Plus size={20} /> Novo Checklist
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1 overflow-x-auto">
            {["Todos", "Finalizado", "Rascunho", "Cancelado"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 text-sm font-bold whitespace-nowrap relative ${filterStatus === st ? "text-amiste-primary" : "text-gray-400"}`}
              >
                {st}
                {filterStatus === st && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amiste-primary rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* LISTA DE CHECKLISTS OU EMPTY STATE */}
          <div className="grid grid-cols-1 gap-4">
            {checklistsHistory.filter(
              (c) => filterStatus === "Todos" || c.status === filterStatus,
            ).length === 0 ? (
              // --- EMPTY STATE ---
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center animate-fade-in">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <ClipboardList size={48} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  Nenhum checklist encontrado
                </h3>
                <p className="text-gray-400 max-w-sm mx-auto mb-6 text-sm">
                  Não há ordens de serviço com o status "{filterStatus}".
                </p>
                {permissions.canCreateChecklist && (
                  <button
                    onClick={handleNewChecklist}
                    className="bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1"
                  >
                    <Plus size={20} /> Criar Primeiro Checklist
                  </button>
                )}
              </div>
            ) : (
              // --- LISTA EXISTENTE ---
              checklistsHistory
                .filter(
                  (c) => filterStatus === "Todos" || c.status === filterStatus,
                )
                .map((c) => (
                  <div
                    key={c.id}
                    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-full ${
                          c.status === "Finalizado"
                            ? "bg-green-50 text-green-600"
                            : c.status === "Cancelado"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {c.status === "Finalizado" ? (
                          <Check size={20} />
                        ) : c.status === "Cancelado" ? (
                          <XCircle size={20} />
                        ) : (
                          <Edit2 size={20} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">
                          {c.client_name || c.event_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Coffee size={14} /> {c.machine_name || "Sem máquina"}
                          <span className="text-gray-300">•</span>
                          <Calendar size={14} />{" "}
                          {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0 justify-end">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mr-2 ${getStatusColor(
                          c.status,
                        )}`}
                      >
                        {c.status}
                      </span>

                      {permissions.canEditChecklist && (
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      <Link
                        to={`/checklists/${c.id}`}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Search size={18} />
                      </Link>
                      {permissions.canDeleteChecklist && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {view === "form" && (
        <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-6 py-4 -mx-4 md:-mx-8 mb-8 border-b border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("list")}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {editingId ? "Editar Checklist" : "Novo Checklist"}
                </h1>
                <p className="text-xs text-gray-500">
                  Preencha os dados da instalação.
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {editingId && (
                <button
                  onClick={handleCancelChecklist}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-sm flex items-center gap-2"
                >
                  <XCircle size={16} /> Cancelar Serviço
                </button>
              )}
              <button
                onClick={() => handleSave("Rascunho")}
                className="flex-1 md:flex-none px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
              >
                <Save size={16} /> Salvar Rascunho
              </button>
              <button
                onClick={() => handleSave("Finalizado")}
                className="flex-1 md:flex-none px-6 py-2 bg-amiste-primary hover:bg-amiste-secondary text-white rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <Check size={16} /> Finalizar
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <FormSection title="Dados Gerais" icon={Calendar}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <RadioGroup
                    label="Tipo de Serviço"
                    options={["Cliente", "Evento"]}
                    value={installType}
                    onChange={setInstallType}
                  />
                </div>
                {installType === "Cliente" ? (
                  <>
                    <div className="col-span-full">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Nome do Cliente *
                      </label>
                      <input
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Ex: Padaria Central"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Data Instalação *
                      </label>
                      <input
                        type="date"
                        className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                        value={installDate}
                        onChange={(e) => setInstallDate(e.target.value)}
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
                        className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Qtd. Dias
                      </label>
                      <input
                        type="number"
                        className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                        value={eventDays}
                        onChange={(e) => setEventDays(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Data Instalação
                      </label>
                      <input
                        type="date"
                        className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                        value={installDate}
                        onChange={(e) => setInstallDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Data Retirada
                      </label>
                      <input
                        type="date"
                        className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </FormSection>

            <FormSection title="Equipamento" icon={Coffee}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Modelo da Máquina *
                  </label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none"
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
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {machineItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <span className="font-bold text-gray-400 self-center text-sm">
                      #{idx + 1}
                    </span>
                    <select
                      className="p-2 rounded-lg border-gray-200 text-sm bg-white"
                      value={item.voltage}
                      onChange={(e) =>
                        updateMachineItem(idx, "voltage", e.target.value)
                      }
                    >
                      <option>220v</option>
                      <option>110v</option>
                      <option>Bivolt</option>
                    </select>
                    <input
                      className="flex-1 p-2 rounded-lg border border-gray-200 text-sm outline-none"
                      placeholder="Nº Série"
                      value={item.serial}
                      onChange={(e) =>
                        updateMachineItem(idx, "serial", e.target.value)
                      }
                    />
                    <input
                      className="flex-1 p-2 rounded-lg border border-gray-200 text-sm outline-none"
                      placeholder="Patrimônio"
                      value={item.patrimony}
                      onChange={(e) =>
                        updateMachineItem(idx, "patrimony", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                <RadioGroup
                  label="Rede Hídrica"
                  options={["Sim", "Não"]}
                  value={waterInstall}
                  onChange={setWaterInstall}
                />
                <RadioGroup
                  label="Esgoto"
                  options={["Sim", "Não"]}
                  value={sewageInstall}
                  onChange={setSewageInstall}
                />
                <RadioGroup
                  label="Vapor"
                  options={["Sim", "Não"]}
                  value={steamWand}
                  onChange={setSteamWand}
                />
                <RadioGroup
                  label="Pagamento"
                  options={["Sim", "Não"]}
                  value={paymentSystem}
                  onChange={setPaymentSystem}
                />
              </div>
            </FormSection>

            <FormSection title="Preparação e Testes" icon={Wrench}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Configuração e Testes (Mantido Igual) */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-gray-700">
                      Configuração
                    </span>
                    <RadioGroup
                      options={["Configurado", "Não"]}
                      value={configStatus}
                      onChange={setConfigStatus}
                    />
                  </div>
                  {configStatus === "Configurado" && (
                    <input
                      type="date"
                      className="w-full p-2 border rounded-lg text-sm"
                      value={configDate}
                      onChange={(e) => setConfigDate(e.target.value)}
                    />
                  )}
                </div>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-gray-700">Testes</span>
                    <RadioGroup
                      options={["Testado", "Não"]}
                      value={testStatus}
                      onChange={setTestStatus}
                    />
                  </div>
                  {testStatus === "Testado" && (
                    <input
                      type="date"
                      className="w-full p-2 border rounded-lg text-sm"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                    />
                  )}
                </div>
              </div>

              {/* --- 2. FERRAMENTAS (LÓGICA CORRIGIDA) --- */}
              <h4 className="font-bold text-gray-400 text-xs uppercase mb-3 flex items-center gap-2">
                <Wrench size={16} /> Ferramentas Necessárias
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {/* Comuns - Sempre visíveis */}
                {[
                  "caixaFerramentas",
                  "luvas",
                  "transformador",
                  "extensao",
                  "pano",
                  "balde",
                  "adaptador",
                ].map((key) => (
                  <ToggleCard
                    key={key}
                    label={key.replace(/([A-Z])/g, " $1")}
                    checked={tools[key]}
                    onChange={(val) => setTools({ ...tools, [key]: val })}
                  />
                ))}

                {/* Se Rede Hídrica = SIM */}
                {waterInstall === "Sim" &&
                  ["conexoes", "filtro", "mangueiras", "tampoes"].map((key) => (
                    <ToggleCard
                      key={key}
                      label={key.replace(/([A-Z])/g, " $1")}
                      checked={tools[key]}
                      onChange={(val) => setTools({ ...tools, [key]: val })}
                    />
                  ))}

                {/* Se Rede Hídrica = NÃO */}
                {waterInstall === "Não" && (
                  <div className="col-span-2 md:col-span-1">
                    <ToggleCard
                      label="Galões"
                      checked={tools.galao}
                      onChange={(val) => setTools({ ...tools, galao: val })}
                    />
                    {tools.galao && (
                      <input
                        type="number"
                        placeholder="Quantos?"
                        className="w-full mt-2 p-2 border rounded text-sm animate-fade-in"
                        value={gallonQty}
                        onChange={(e) => setGallonQty(e.target.value)}
                      />
                    )}
                  </div>
                )}

                {/* Se Esgoto = SIM */}
                {sewageInstall === "Sim" && (
                  <ToggleCard
                    label="Mangueira Esgoto"
                    checked={tools.mangueiraEsgoto}
                    onChange={(val) =>
                      setTools({ ...tools, mangueiraEsgoto: val })
                    }
                  />
                )}
              </div>

              <h4 className="font-bold text-gray-400 text-xs uppercase mb-3 flex items-center gap-2">
                <Coffee size={16} /> Bebidas Habilitadas
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {drinksList.map((drink) => (
                  <div
                    key={drink}
                    className={`p-3 rounded-xl border transition-all ${selectedDrinks[drink] !== undefined ? "bg-red-50 border-amiste-primary" : "bg-white"}`}
                  >
                    <div
                      onClick={() =>
                        toggleItem(
                          selectedDrinks,
                          setSelectedDrinks,
                          drink,
                          " ",
                        )
                      }
                      className="cursor-pointer flex items-center gap-2 mb-2"
                    >
                      <div
                        className={`w-4 h-4 rounded-full border ${selectedDrinks[drink] !== undefined ? "bg-amiste-primary border-amiste-primary" : "border-gray-300"}`}
                      ></div>
                      <span className="text-sm font-bold text-gray-700">
                        {drink}
                      </span>
                    </div>
                    {selectedDrinks[drink] !== undefined && (
                      <input
                        type="text"
                        placeholder="ML"
                        className="w-full p-1 text-xs border rounded bg-white"
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
            </FormSection>

            {/* SEÇÃO 4: INSUMOS (MANTIDO) */}
            <FormSection title="Insumos e Acessórios" icon={Package}>
              <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-thin">
                {Object.entries(suppliesData).map(([cat, items]) => (
                  <div
                    key={cat}
                    className="min-w-[240px] bg-gray-50 rounded-xl p-4 border border-gray-100"
                  >
                    <h5 className="font-bold text-xs uppercase mb-3 text-amiste-primary flex items-center gap-2">
                      <div className="w-2 h-2 bg-amiste-primary rounded-full"></div>{" "}
                      {cat}
                    </h5>
                    <div className="space-y-2">
                      {Object.keys(items).map((key) => (
                        <div key={key}>
                          <div
                            onClick={() => toggleSupply(cat, key)}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                          >
                            <div
                              className={`w-3 h-3 rounded border ${items[key].active ? "bg-green-500 border-green-500" : "border-gray-400"}`}
                            ></div>
                            <span className="text-xs font-medium text-gray-600">
                              {key}
                            </span>
                          </div>
                          {items[key].active && (
                            <input
                              type="text"
                              placeholder="Qtd"
                              className="w-full p-1 text-xs border rounded mt-1 bg-white"
                              value={items[key].qty}
                              onChange={(e) =>
                                updateSupplyQty(cat, key, e.target.value)
                              }
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
                {accessoriesList.map((acc) => (
                  <div
                    key={acc}
                    className={`p-3 rounded-xl border ${selectedAccessories[acc] !== undefined ? "bg-blue-50 border-blue-300" : "bg-white"}`}
                  >
                    <div
                      onClick={() =>
                        toggleItem(
                          selectedAccessories,
                          setSelectedAccessories,
                          acc,
                          "1",
                        )
                      }
                      className="cursor-pointer flex items-center gap-2 mb-1"
                    >
                      <div
                        className={`w-3 h-3 rounded border ${selectedAccessories[acc] !== undefined ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}
                      ></div>
                      <span className="text-sm text-gray-700">{acc}</span>
                    </div>
                    {selectedAccessories[acc] !== undefined && (
                      <input
                        type="text"
                        placeholder="Qtd"
                        className="w-full p-1 text-xs border rounded bg-white"
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
            </FormSection>

            {/* SEÇÃO 5: LOCAL DE INSTALAÇÃO (COM AVISOS) */}
            <FormSection title="Local de Instalação" icon={MapPin}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Tomada */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    <Zap size={12} className="inline" /> Tomada
                  </span>
                  <RadioGroup
                    options={["10A", "20A"]}
                    value={localSocket}
                    onChange={setLocalSocket}
                  />
                  {selectedMachineData?.amperage &&
                    localSocket &&
                    selectedMachineData.amperage !== localSocket && (
                      <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded mt-2">
                        ⚠️ Máquina é {selectedMachineData.amperage}!
                      </div>
                    )}
                </div>

                {/* Água (Com Aviso) */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    <Droplet size={12} className="inline" /> Água
                  </span>
                  <RadioGroup
                    options={["Sim", "Não"]}
                    value={localWater}
                    onChange={setLocalWater}
                  />
                  {waterInstall === "Sim" && localWater === "Não" && (
                    <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded mt-2">
                      ⚠️ Necessário ponto hidráulico!
                    </div>
                  )}
                </div>

                {/* Esgoto (Com Aviso) */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Esgoto
                  </span>
                  <RadioGroup
                    options={["Sim", "Não"]}
                    value={localSewage}
                    onChange={setLocalSewage}
                  />
                  {sewageInstall === "Sim" && localSewage === "Não" && (
                    <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded mt-2">
                      ⚠️ Necessário ponto de esgoto!
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Treinamento
                  </span>
                  <input
                    type="number"
                    placeholder="Qtd Pessoas"
                    className="w-full p-2 border rounded-lg bg-white"
                    value={trainedPeople}
                    onChange={(e) => setTrainedPeople(e.target.value)}
                  />
                </div>
              </div>
            </FormSection>

            {/* SEÇÃO 6: FINALIZAÇÃO (MANTIDO IGUAL AO ANTERIOR) */}
            <FormSection title="Finalização" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nº Contrato
                  </label>
                  <input
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50"
                    value={contractNum}
                    onChange={(e) => setContractNum(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Obs Venda
                  </label>
                  <textarea
                    rows="3"
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50"
                    value={salesObs}
                    onChange={(e) => setSalesObs(e.target.value)}
                  ></textarea>
                </div>
              </div>
              {/* Painel Financeiro */}
              <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-end mb-6 border-b border-gray-700 pb-4">
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">
                    Valor Total Serviço
                  </span>
                  <span className="text-3xl font-bold text-green-400">
                    R${" "}
                    {(
                      valMachine +
                      valSupplies +
                      valServices +
                      valExtras
                    ).toFixed(2)}
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
                      <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden border border-gray-700 focus-within:border-green-500 transition-colors">
                        <span className="pl-3 text-gray-500 text-xs">R$</span>
                        <input
                          type="number"
                          className="w-full p-2 bg-transparent text-white text-sm outline-none font-bold"
                          value={item.v}
                          onChange={(e) =>
                            item.s(parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FormSection>
          </div>
        </div>
      )}
    </div>
  );
}
