import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { ChecklistList } from "../components/Checklist/ChecklistList";
import { ChecklistForm } from "../components/Checklist/ChecklistForm";
import {
  INITIAL_TOOLS,
  INITIAL_SUPPLIES,
} from "../components/Checklist/ChecklistUI";

export function Checklist() {
  const { user, permissions = {} } = useContext(AuthContext);

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
  const [selectedModelIndex, setSelectedModelIndex] = useState("");

  const [machineItems, setMachineItems] = useState([
    { voltage: "220v", patrimony: "", serial: "" },
  ]);

  const [waterInstall, setWaterInstall] = useState("Não");
  const [sewageInstall, setSewageInstall] = useState("Não");
  const [paymentSystem, setPaymentSystem] = useState("Não");
  const [steamWand, setSteamWand] = useState("Não");

  // Ferramentas
  const [tools, setTools] = useState(INITIAL_TOOLS);
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

  // --- INSUMOS ---
  const [noSupplies, setNoSupplies] = useState(false);
  const [suppliesData, setSuppliesData] = useState(INITIAL_SUPPLIES);
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

  function handleMachineSelect(e) {
    const id = e.target.value;
    setSelectedMachineId(id);
    setSelectedModelIndex("");

    if (id) {
      const machine = machinesList.find((m) => m.id.toString() === id);
      setSelectedMachineData(machine);

      if (machine) {
        setWaterInstall(
          machine.water_system === "Rede Hídrica" ? "Sim" : "Não",
        );
        setSteamWand(machine.has_steamer === "Sim" ? "Sim" : "Não");
        setSewageInstall(machine.has_sewage === true ? "Sim" : "Não");
      }
    } else {
      setSelectedMachineData(null);
    }
  }

  function handleModelSelect(e) {
    const idx = e.target.value;
    setSelectedModelIndex(idx);

    if (
      idx !== "" &&
      selectedMachineData &&
      selectedMachineData.models &&
      selectedMachineData.models[idx]
    ) {
      const model = selectedMachineData.models[idx];
      if (model.water_system) {
        setWaterInstall(model.water_system === "Rede Hídrica" ? "Sim" : "Não");
      }
    } else if (selectedMachineData) {
      setWaterInstall(
        selectedMachineData.water_system === "Rede Hídrica" ? "Sim" : "Não",
      );
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
      return toast.error("Por favor, preencha o Nº Contrato.");
    if (!clientName && !eventName)
      return toast.error("Por favor, preencha o Nome do Cliente ou Evento.");

    if (selectedMachineData?.models?.length > 0 && selectedModelIndex === "") {
      return toast.error("Por favor, selecione o modelo/variação da máquina.");
    }

    setSaving(true);
    try {
      let finalMachineName = selectedMachineData?.name;
      if (selectedModelIndex !== "" && selectedMachineData?.models) {
        finalMachineName += ` - ${selectedMachineData.models[selectedModelIndex].name}`;
      }

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
        machine_name: finalMachineName,
        machine_model_index: selectedModelIndex,
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
        toast.success("Checklist atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("checklists").insert(payload);
        if (error) throw error;
        toast.success(
          status === "Rascunho"
            ? "Rascunho salvo!"
            : "Checklist criado com sucesso!",
        );
      }
      fetchChecklists();
      setView("list");
      setEditingId(null);
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!permissions.canDeleteChecklist)
      return toast.error("Você não tem permissão para excluir checklists.");
    if (!confirm("Tem certeza que deseja excluir este checklist?")) return;
    try {
      await supabase.from("checklists").delete().eq("id", id);
      toast.success("Checklist excluído.");
      fetchChecklists();
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
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
      toast.success("Serviço cancelado.");
      fetchChecklists();
      setView("list");
    } catch (err) {
      toast.error("Erro ao cancelar: " + err.message);
    }
  }

  function handleEdit(checklist) {
    if (!permissions.canEditChecklist)
      return toast.error("Você não tem permissão para editar.");
    setEditingId(checklist.id);
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

    setSelectedModelIndex(checklist.machine_model_index || "");

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
      setTools({ ...INITIAL_TOOLS, ...tList });
      setGallonQty(gQty || "");
    } else {
      setTools(INITIAL_TOOLS);
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
      setSuppliesData((prev) => {
        const loaded = checklist.supplies_list.standard || {};
        const newData = { ...INITIAL_SUPPLIES };
        Object.keys(newData).forEach((cat) => {
          if (loaded[cat]) {
            newData[cat] = { ...newData[cat], ...loaded[cat] };
          }
        });
        return newData;
      });
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
      return toast.error("Você não tem permissão para criar checklists.");
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
    setSelectedModelIndex("");
    setMachineItems([{ voltage: "220v", patrimony: "", serial: "" }]);
    setWaterInstall("Não");
    setSewageInstall("Não");
    setPaymentSystem("Não");
    setSteamWand("Não");

    setTools(INITIAL_TOOLS);
    setSuppliesData(INITIAL_SUPPLIES);

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

  // Objeto com todas as props para o Form
  const formProps = {
    editingId,
    setView,
    handleCancelChecklist,
    handleSave,
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
    configStatus,
    setConfigStatus,
    configDate,
    setConfigDate,
    testStatus,
    setTestStatus,
    testDate,
    setTestDate,
    tools,
    setTools,
    gallonQty,
    setGallonQty,
    selectedDrinks,
    toggleItem,
    setSelectedDrinks,
    updateItemValue,
    suppliesData,
    toggleSupply,
    updateSupplyQty,
    selectedAccessories,
    setSelectedAccessories,
    localSocket,
    setLocalSocket,
    localWater,
    setLocalWater,
    localSewage,
    setLocalSewage,
    trainedPeople,
    setTrainedPeople,
    contractNum,
    setContractNum,
    salesObs,
    setSalesObs,
    valMachine,
    valSupplies,
    valServices,
    valExtras,
    setValMachine,
    setValSupplies,
    setValServices,
    setValExtras,
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      {view === "list" && (
        <ChecklistList
          permissions={permissions || {}}
          checklistsHistory={checklistsHistory}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          handleNewChecklist={handleNewChecklist}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      )}

      {view === "form" && <ChecklistForm {...formProps} />}
    </div>
  );
}
