import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Search,
  Edit,
  X,
  Coffee,
  Calendar,
  Wrench,
  MapPin,
  FileText,
  DollarSign,
} from "lucide-react";

// --- CORREÇÃO DO BUG DE SCROLL ---
// O componente visual deve ficar FORA da função principal
const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
      <Icon className="text-amiste-primary" size={20} />
      <h3 className="font-bold text-gray-800 uppercase tracking-wide text-sm">
        {title}
      </h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export function Checklist() {
  const { user, permissions } = useContext(AuthContext);

  // --- CONTROLE DE TELA ---
  const [view, setView] = useState("list"); // 'list' ou 'form'
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

  // --- CARREGAMENTO ---
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

  // --- AÇÕES ---
  async function handleDelete(id) {
    if (!permissions.canDeleteChecklist)
      return alert("Sem permissão para excluir.");
    if (!confirm("Excluir checklist?")) return;
    await supabase.from("checklists").delete().eq("id", id);
    fetchChecklists();
  }

  function handleEdit(checklist) {
    if (!permissions.canEditChecklist)
      return alert("Sem permissão para editar.");
    setEditingId(checklist.id);

    // Preenchimento dos dados (Cópia da lógica do Wizard)
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
    if (!permissions.canCreateChecklist)
      return alert("Sem permissão para criar.");
    setEditingId(null);

    // Reset Completo
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

  // --- HELPERS E CÁLCULOS ---
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

  return (
    <div className="min-h-screen pb-20 bg-gray-100">
      {/* MODO LISTA */}
      {view === "list" && (
        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-800">
                Checklists
              </h1>
              <p className="text-gray-500">Ordens de serviço e instalações.</p>
            </div>
            {permissions.canCreateChecklist && (
              <button
                onClick={handleNewChecklist}
                className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-transform"
              >
                <Plus size={20} /> Novo Checklist
              </button>
            )}
          </div>

          <div className="bg-white p-2 rounded-lg border border-gray-200 inline-flex mb-6 shadow-sm">
            {["Todos", "Finalizado", "Rascunho"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterStatus === st ? "bg-gray-800 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b">
                <tr>
                  <th className="p-4">Cliente / Evento</th>
                  <th className="p-4">Máquina</th>
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
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">
                          {c.client_name || c.event_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">{c.machine_name}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${c.status === "Finalizado" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {permissions.canEditChecklist && (
                          <button
                            onClick={() => handleEdit(c)}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        <Link
                          to={`/checklists/${c.id}`}
                          className="text-gray-500 hover:bg-gray-100 p-2 rounded"
                        >
                          <Search size={18} />
                        </Link>
                        {permissions.canDeleteChecklist && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODO FORMULÁRIO ÚNICO (PAGE SCROLL) */}
      {view === "form" && (
        <div className="max-w-5xl mx-auto p-6 animate-fade-in">
          <div className="sticky top-0 z-20 bg-gray-100/95 backdrop-blur py-4 mb-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {editingId ? "Editando Checklist" : "Novo Checklist"}
              </h1>
              <p className="text-sm text-gray-500">Preencha os dados abaixo.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setView("list")}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSave("Rascunho")}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-bold flex items-center gap-2"
              >
                <Save size={18} /> Rascunho
              </button>
              <button
                onClick={() => handleSave("Finalizado")}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg flex items-center gap-2"
              >
                <Check size={18} /> Finalizar
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* SEÇÃO 1: DADOS GERAIS */}
            <FormSection title="Dados Gerais" icon={Calendar}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-4 col-span-full">
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
                    <div className="col-span-full">
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
                    <div className="col-span-full">
                      <label className="block text-sm font-bold mb-1">
                        Nome do Evento *
                      </label>
                      <input
                        className="w-full p-3 border rounded-lg"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                      />
                    </div>
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
                        Data Retirada
                      </label>
                      <input
                        type="date"
                        className="w-full p-3 border rounded-lg"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </FormSection>

            {/* SEÇÃO 2: MÁQUINA */}
            <FormSection title="Equipamento e Configurações" icon={Coffee}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2">
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

              {/* Unidades */}
              <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                <h3 className="text-xs font-bold uppercase text-gray-500 mb-3">
                  Identificação das Unidades
                </h3>
                {machineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <span className="font-bold w-6">{idx + 1}.</span>
                    <div className="w-32">
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
                      <input
                        className="p-2 border rounded w-full"
                        placeholder="Patrimônio"
                        value={item.patrimony}
                        onChange={(e) =>
                          updateMachineItem(idx, "patrimony", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Checks Técnicos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-t">
                <div>
                  <span className="block font-bold text-sm mb-1">
                    Rede Hídrica?
                  </span>
                  <div className="flex gap-2">
                    <label>
                      <input
                        type="radio"
                        checked={waterInstall === "Sim"}
                        onChange={() => setWaterInstall("Sim")}
                      />{" "}
                      Sim
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={waterInstall === "Não"}
                        onChange={() => setWaterInstall("Não")}
                      />{" "}
                      Não
                    </label>
                  </div>
                </div>
                <div>
                  <span className="block font-bold text-sm mb-1">Esgoto?</span>
                  <div className="flex gap-2">
                    <label>
                      <input
                        type="radio"
                        checked={sewageInstall === "Sim"}
                        onChange={() => setSewageInstall("Sim")}
                      />{" "}
                      Sim
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={sewageInstall === "Não"}
                        onChange={() => setSewageInstall("Não")}
                      />{" "}
                      Não
                    </label>
                  </div>
                </div>
                <div>
                  <span className="block font-bold text-sm mb-1">Vapor?</span>
                  <div className="flex gap-2">
                    <label>
                      <input
                        type="radio"
                        checked={steamWand === "Sim"}
                        onChange={() => setSteamWand("Sim")}
                      />{" "}
                      Sim
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={steamWand === "Não"}
                        onChange={() => setSteamWand("Não")}
                      />{" "}
                      Não
                    </label>
                  </div>
                </div>
                <div>
                  <span className="block font-bold text-sm mb-1">
                    Pagamento?
                  </span>
                  <div className="flex gap-2">
                    <label>
                      <input
                        type="radio"
                        checked={paymentSystem === "Sim"}
                        onChange={() => setPaymentSystem("Sim")}
                      />{" "}
                      Sim
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={paymentSystem === "Não"}
                        onChange={() => setPaymentSystem("Não")}
                      />{" "}
                      Não
                    </label>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* SEÇÃO 3: PREPARATIVOS, FERRAMENTAS E BEBIDAS */}
            <FormSection title="Preparação e Insumos" icon={Wrench}>
              {/* Preparativos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-bold mb-2">Máquina Configurada?</p>
                  <div className="flex gap-4">
                    <label>
                      <input
                        type="radio"
                        checked={configStatus === "Não"}
                        onChange={() => setConfigStatus("Não")}
                      />{" "}
                      Não
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={configStatus === "Configurado"}
                        onChange={() => setConfigStatus("Configurado")}
                      />{" "}
                      Configurado
                    </label>
                  </div>
                  {configStatus === "Configurado" && (
                    <input
                      type="date"
                      className="mt-2 p-2 border rounded"
                      value={configDate}
                      onChange={(e) => setConfigDate(e.target.value)}
                    />
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-bold mb-2">Bebidas Testadas?</p>
                  <div className="flex gap-4">
                    <label>
                      <input
                        type="radio"
                        checked={testStatus === "Não"}
                        onChange={() => setTestStatus("Não")}
                      />{" "}
                      Não
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={testStatus === "Testado"}
                        onChange={() => setTestStatus("Testado")}
                      />{" "}
                      Testado
                    </label>
                  </div>
                  {testStatus === "Testado" && (
                    <input
                      type="date"
                      className="mt-2 p-2 border rounded"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                    />
                  )}
                </div>
              </div>

              {/* Ferramentas */}
              <h4 className="font-bold text-gray-700 mb-3 border-b pb-1">
                Aparatos Necessários
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {Object.keys(tools).map(
                  (key) =>
                    key !== "gallonQty" && (
                      <label
                        key={key}
                        className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${tools[key] ? "bg-blue-50 border-blue-200" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={tools[key]}
                          onChange={(e) =>
                            setTools({ ...tools, [key]: e.target.checked })
                          }
                        />
                        <span className="capitalize text-sm">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                      </label>
                    ),
                )}
              </div>

              {/* Bebidas */}
              <h4 className="font-bold text-gray-700 mb-3 border-b pb-1">
                Bebidas Habilitadas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {drinksList.map((drink) => (
                  <div
                    key={drink}
                    className={`p-2 border rounded flex flex-col gap-1 ${selectedDrinks[drink] !== undefined ? "bg-red-50 border-amiste-primary" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
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
                      <span className="text-sm font-medium">{drink}</span>
                    </div>
                    {selectedDrinks[drink] !== undefined && (
                      <input
                        type="text"
                        placeholder="ML"
                        className="p-1 text-xs border rounded"
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

              {/* Acessórios */}
              <h4 className="font-bold text-gray-700 mb-3 border-b pb-1">
                Acessórios
              </h4>
              <div className="mb-2">
                <label className="text-sm">
                  <input
                    type="checkbox"
                    checked={noAccessories}
                    onChange={(e) => setNoAccessories(e.target.checked)}
                  />{" "}
                  Sem Acessórios
                </label>
              </div>
              {!noAccessories && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {accessoriesList.map((acc) => (
                    <div
                      key={acc}
                      className={`p-2 border rounded flex flex-col gap-1 ${selectedAccessories[acc] !== undefined ? "bg-red-50 border-amiste-primary" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
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
                        <span className="text-sm font-medium">{acc}</span>
                      </div>
                      {selectedAccessories[acc] !== undefined && (
                        <input
                          type="text"
                          placeholder="Qtd"
                          className="p-1 text-xs border rounded"
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

              {/* Insumos */}
              <h4 className="font-bold text-gray-700 mb-3 border-b pb-1">
                Insumos
              </h4>
              <div className="mb-2">
                <label className="text-sm">
                  <input
                    type="checkbox"
                    checked={noSupplies}
                    onChange={(e) => setNoSupplies(e.target.checked)}
                  />{" "}
                  Sem Insumos
                </label>
              </div>
              {!noSupplies && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {Object.entries(suppliesData).map(([cat, items]) => (
                    <div
                      key={cat}
                      className="min-w-[200px] bg-white border rounded p-3"
                    >
                      <h5 className="font-bold text-xs uppercase mb-2 text-amiste-primary">
                        {cat}
                      </h5>
                      {Object.keys(items).map((key) => (
                        <div key={key} className="mb-1">
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={items[key].active}
                              onChange={() => toggleSupply(cat, key)}
                            />{" "}
                            {key}
                          </label>
                          {items[key].active && (
                            <input
                              type="text"
                              placeholder="Qtd"
                              className="w-full p-1 text-xs border rounded mt-1"
                              value={items[key].qty}
                              onChange={(e) =>
                                updateSupplyQty(cat, key, e.target.value)
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </FormSection>

            {/* SEÇÃO 4: VALIDAÇÃO LOCAL */}
            <FormSection title="Validação do Local" icon={MapPin}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded bg-gray-50">
                  <p className="font-bold text-sm mb-2">Tomada</p>
                  <div className="flex gap-4">
                    <label>
                      <input
                        type="radio"
                        checked={localSocket === "10A"}
                        onChange={() => setLocalSocket("10A")}
                      />{" "}
                      10A
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={localSocket === "20A"}
                        onChange={() => setLocalSocket("20A")}
                      />{" "}
                      20A
                    </label>
                  </div>
                  {selectedMachineData?.amperage &&
                    localSocket &&
                    selectedMachineData.amperage !== localSocket && (
                      <div className="text-xs text-red-600 font-bold mt-1">
                        ⚠️ Máquina é {selectedMachineData.amperage}!
                      </div>
                    )}
                </div>
                <div className="p-4 border rounded bg-gray-50">
                  <p className="font-bold text-sm mb-2">Ponto de Água</p>
                  <div className="flex gap-4">
                    <label>
                      <input
                        type="radio"
                        checked={localWater === "Sim"}
                        onChange={() => setLocalWater("Sim")}
                      />{" "}
                      Sim
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={localWater === "Não"}
                        onChange={() => setLocalWater("Não")}
                      />{" "}
                      Não
                    </label>
                  </div>
                  {waterInstall === "Sim" && localWater === "Não" && (
                    <div className="text-xs text-red-600 font-bold mt-1">
                      ⚠️ Máquina precisa de água!
                    </div>
                  )}
                </div>
                <div className="p-4 border rounded bg-gray-50">
                  <p className="font-bold text-sm mb-2">Esgoto</p>
                  <div className="flex gap-4">
                    <label>
                      <input
                        type="radio"
                        checked={localSewage === "Sim"}
                        onChange={() => setLocalSewage("Sim")}
                      />{" "}
                      Sim
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={localSewage === "Não"}
                        onChange={() => setLocalSewage("Não")}
                      />{" "}
                      Não
                    </label>
                  </div>
                </div>
                <div className="p-4 border rounded bg-gray-50">
                  <p className="font-bold text-sm mb-2">Pessoas Treinadas</p>
                  <input
                    type="number"
                    className="p-2 border rounded w-24"
                    value={trainedPeople}
                    onChange={(e) => setTrainedPeople(e.target.value)}
                  />
                </div>
              </div>
            </FormSection>

            {/* SEÇÃO 5: FINALIZAÇÃO */}
            <FormSection title="Finalização e Valores" icon={FileText}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nº Contrato
                  </label>
                  <input
                    className="w-full p-3 border rounded-lg"
                    value={contractNum}
                    onChange={(e) => setContractNum(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Ficha Instalação
                  </label>
                  <input
                    className="w-full p-3 border rounded-lg"
                    value={installFileNum}
                    onChange={(e) => setInstallFileNum(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-gray-800 text-white p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 font-bold uppercase text-xs">
                    Total Serviço
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400">Máquina</label>
                    <input
                      type="number"
                      className="w-full bg-gray-700 border-none rounded text-white text-sm"
                      value={valMachine}
                      onChange={(e) =>
                        setValMachine(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400">Insumos</label>
                    <input
                      type="number"
                      className="w-full bg-gray-700 border-none rounded text-white text-sm"
                      value={valSupplies}
                      onChange={(e) =>
                        setValSupplies(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400">
                      Serviços
                    </label>
                    <input
                      type="number"
                      className="w-full bg-gray-700 border-none rounded text-white text-sm"
                      value={valServices}
                      onChange={(e) =>
                        setValServices(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400">Extras</label>
                    <input
                      type="number"
                      className="w-full bg-gray-700 border-none rounded text-white text-sm"
                      value={valExtras}
                      onChange={(e) =>
                        setValExtras(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Obs Venda
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    rows="2"
                    value={salesObs}
                    onChange={(e) => setSalesObs(e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Alterações Cliente
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    rows="2"
                    value={clientChanges}
                    onChange={(e) => setClientChanges(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </FormSection>
          </div>
        </div>
      )}
    </div>
  );
}
