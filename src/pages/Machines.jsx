import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MachinesList } from "../components/Machines/MachinesList";
import { MachineForm } from "../components/Machines/MachineForm";
import {
  MODEL_OPTIONS,
  BRAND_OPTIONS,
  TYPE_OPTIONS,
} from "../components/Machines/MachinesUI";

export function Machines() {
  const { permissions = {} } = useContext(AuthContext); // Adicionado default {}
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [machines, setMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingId, setEditingId] = useState(null);

  // --- FORMULÁRIO GERAL ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [type, setType] = useState("");
  const [customType, setCustomType] = useState("");
  const [status, setStatus] = useState("Disponível");
  const [photoUrl, setPhotoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageMode, setImageMode] = useState("url");
  const [patrimony, setPatrimony] = useState("");
  const [serialNumber, setSerialNumber] = useState("");

  // --- LÓGICA DE MODELOS MÚLTIPLOS ---
  const [hasVariations, setHasVariations] = useState(false);
  const [modelsList, setModelsList] = useState([]);
  const [editingModelIndex, setEditingModelIndex] = useState(null);

  // Estado temporário do modelo (Variação)
  const [tempModel, setTempModel] = useState({
    name: "",
    photo_url: "",
    video_url: "",
    voltage: "",
    weight: "",
    dimensions: "",
    amperage: "",
    water_system: "",
    cups_capacity: "",
    filter_type: "",
    dregs_capacity: "",
    water_tank_size: "",
    extraction_cups: "",
    extraction_nozzles: "",
    drink_combinations: "",
    dose_autonomy: "",
    extra_reservoir_capacity: "",
  });

  // --- TÉCNICOS (Estado do PAI / Padrão) ---
  const [voltage, setVoltage] = useState("220v");
  const [waterSystem, setWaterSystem] = useState("Reservatório");
  const [amperage, setAmperage] = useState("10A");
  const [color, setColor] = useState("Preto");
  const [waterTankSize, setWaterTankSize] = useState("");
  const [weight, setWeight] = useState("");
  const [environmentRecommendation, setEnvironmentRecommendation] =
    useState("");
  const [extractionCups, setExtractionCups] = useState("");
  const [extractionNozzles, setExtractionNozzles] = useState("");
  const [drinkCombinations, setDrinkCombinations] = useState("");
  const [doseAutonomy, setDoseAutonomy] = useState("");
  const [simultaneousDispenser, setSimultaneousDispenser] = useState(false);
  const [dregsCapacity, setDregsCapacity] = useState("");
  const [trayCount, setTrayCount] = useState("");
  const [selectionCount, setSelectionCount] = useState("");
  const [cupsCapacity, setCupsCapacity] = useState("");
  const [filterType, setFilterType] = useState("");
  const [hasSewage, setHasSewage] = useState(false);
  const [hasExtraReservoir, setHasExtraReservoir] = useState(true);
  const [reservoirCount, setReservoirCount] = useState(0);
  const [extraReservoirCapacity, setExtraReservoirCapacity] = useState("");
  const [hasSteamer, setHasSteamer] = useState("Não");
  const [dimensions, setDimensions] = useState({ w: "", h: "", d: "" });

  useEffect(() => {
    fetchMachines();
  }, []);

  async function fetchMachines() {
    try {
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .order("name");
      if (error) throw error;
      setMachines(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;
      const fileExt = file.name.split(".").pop();
      const fileName = `machines/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      setPhotoUrl(data.publicUrl);
      alert("Imagem enviada!");
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  const handlePatrimonyChange = (e) =>
    setPatrimony(e.target.value.replace(/\D/g, ""));

  // --- FUNÇÕES DE MODELOS ---
  function handleSaveModel() {
    if (!tempModel.name)
      return alert("Dê um nome para o modelo (ex: 15 Litros)");

    const newList = [...modelsList];

    if (editingModelIndex !== null) {
      newList[editingModelIndex] = { ...tempModel };
      setEditingModelIndex(null);
    } else {
      newList.push({ ...tempModel });
    }

    setModelsList(newList);

    setTempModel({
      name: "",
      photo_url: "",
      video_url: "",
      voltage: "",
      weight: "",
      dimensions: "",
      amperage: "",
      water_system: "",
      cups_capacity: "",
      filter_type: "",
      dregs_capacity: "",
      water_tank_size: "",
      extraction_cups: "",
      extraction_nozzles: "",
      drink_combinations: "",
      dose_autonomy: "",
      extra_reservoir_capacity: "",
    });
  }

  function handleEditModel(index) {
    setTempModel(modelsList[index]);
    setEditingModelIndex(index);
  }

  function handleCancelEditModel() {
    setEditingModelIndex(null);
    setTempModel({
      name: "",
      photo_url: "",
      video_url: "",
      voltage: "",
      weight: "",
      dimensions: "",
      amperage: "",
      water_system: "",
      cups_capacity: "",
      filter_type: "",
      dregs_capacity: "",
      water_tank_size: "",
      extraction_cups: "",
      extraction_nozzles: "",
      drink_combinations: "",
      dose_autonomy: "",
      extra_reservoir_capacity: "",
    });
  }

  function removeModel(index) {
    if (confirm("Remover este modelo da lista?")) {
      const newList = [...modelsList];
      newList.splice(index, 1);
      setModelsList(newList);
      if (editingModelIndex === index) {
        handleCancelEditModel();
      }
    }
  }

  function handleEdit(machine) {
    if (!permissions.canManageMachines) return alert("Sem permissão.");
    setEditingId(machine.id);
    setName(machine.name);
    setDescription(machine.description || "");
    setPhotoUrl(machine.photo_url || "");
    setVideoUrl(machine.video_url || "");
    setStatus(machine.status || "Disponível");
    setImageMode(machine.photo_url?.includes("supabase") ? "file" : "url");
    setPatrimony(machine.patrimony || "");
    setSerialNumber(machine.serial_number || "");

    const loadedModels = machine.models || [];
    setModelsList(loadedModels);
    setHasVariations(loadedModels.length > 0);
    setEditingModelIndex(null);

    if (MODEL_OPTIONS.includes(machine.model)) {
      setModel(machine.model);
      setCustomModel("");
    } else {
      setModel("Outro");
      setCustomModel(machine.model);
    }
    if (BRAND_OPTIONS.includes(machine.brand)) {
      setBrand(machine.brand);
      setCustomBrand("");
    } else {
      setBrand("Outro");
      setCustomBrand(machine.brand);
    }
    if (TYPE_OPTIONS.includes(machine.type)) {
      setType(machine.type);
      setCustomType("");
    } else {
      setType("Outro");
      setCustomType(machine.type);
    }

    setVoltage(machine.voltage || "220v");
    setWaterSystem(machine.water_system || "Reservatório");
    setAmperage(machine.amperage || "10A");
    setColor(machine.color || "Preto");
    setHasSteamer(machine.has_steamer || "Não");
    setHasSewage(machine.has_sewage || false);
    setReservoirCount(machine.reservoir_count || 0);
    setExtraReservoirCapacity(machine.extra_reservoir_capacity || "");
    setHasExtraReservoir((machine.reservoir_count || 0) > 0);

    if (machine.dimensions) {
      const dims = machine.dimensions.split("x");
      setDimensions({ w: dims[0] || "", h: dims[1] || "", d: dims[2] || "" });
    } else {
      setDimensions({ w: "", h: "", d: "" });
    }

    setWaterTankSize(machine.water_tank_size || "");
    setWeight(machine.weight || "");
    setEnvironmentRecommendation(machine.environment_recommendation || "");
    setExtractionCups(machine.extraction_cups || "");
    setExtractionNozzles(machine.extraction_nozzles || "");
    setDrinkCombinations(machine.drink_combinations || "");
    setDoseAutonomy(machine.dose_autonomy || "");
    setSimultaneousDispenser(machine.simultaneous_dispenser || false);
    setDregsCapacity(machine.dregs_capacity || "");
    setTrayCount(machine.tray_count || "");
    setSelectionCount(machine.selection_count || "");
    setCupsCapacity(machine.cups_capacity || "");
    setFilterType(machine.filter_type || "");

    setShowModal(true);
  }

  function handleNew() {
    if (!permissions.canManageMachines) return alert("Sem permissão.");
    resetForm();
    setImageMode("url");
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();

    if (hasVariations && modelsList.length === 0) {
      return alert(
        "Você marcou 'Múltiplos Modelos', mas não adicionou nenhum modelo na lista.",
      );
    }

    setLoading(true);
    try {
      const finalModel = model === "Outro" ? customModel : model;
      const finalBrand = brand === "Outro" ? customBrand : brand;
      const finalType = type === "Outro" ? customType : type;
      const dimString = `${dimensions.w}x${dimensions.h}x${dimensions.d}`;

      const finalReservoirCount = hasExtraReservoir
        ? parseInt(reservoirCount)
        : 0;
      const finalExtraCapacity = hasExtraReservoir
        ? extraReservoirCapacity
        : "";

      const payload = {
        name,
        description,
        photo_url: photoUrl,
        video_url: videoUrl,
        model: finalModel,
        brand: finalBrand,
        type: finalType,
        status,
        color,
        has_sewage: hasSewage,
        reservoir_count: finalReservoirCount,
        extra_reservoir_capacity: finalExtraCapacity,
        has_steamer: hasSteamer,
        patrimony,
        serial_number: serialNumber,
        environment_recommendation: environmentRecommendation,
        models: hasVariations ? modelsList : [],

        voltage: voltage,
        water_system: waterSystem,
        amperage: amperage,
        dimensions: dimString,
        weight: weight,

        water_tank_size: waterTankSize,
        extraction_cups: extractionCups,
        extraction_nozzles: extractionNozzles,
        drink_combinations: drinkCombinations,
        dose_autonomy: doseAutonomy,
        simultaneous_dispenser: simultaneousDispenser,
        dregs_capacity: dregsCapacity,
        tray_count: trayCount,
        selection_count: selectionCount,
        cups_capacity: cupsCapacity,
        filter_type: filterType,
      };

      if (editingId) {
        const { error } = await supabase
          .from("machines")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        alert("Atualizado!");
      } else {
        const { error } = await supabase.from("machines").insert(payload);
        if (error) throw error;
        alert("Criado!");
      }
      setShowModal(false);
      resetForm();
      fetchMachines();
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!permissions.canManageMachines) return alert("Sem permissão.");
    if (!confirm("Tem certeza que deseja excluir esta máquina?")) return;

    try {
      const { error } = await supabase.from("machines").delete().eq("id", id);
      if (error) {
        if (error.code === "23503") {
          throw new Error(
            "Não é possível excluir: Esta máquina está vinculada a um Checklist ou Portfólio.",
          );
        }
        throw error;
      }
      alert("Máquina excluída com sucesso.");
      fetchMachines();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  }

  function handleOpenConfigs(machine, e) {
    e.stopPropagation();
    navigate("/machine-configs", { state: { machine } });
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPhotoUrl("");
    setVideoUrl("");
    setModel("");
    setCustomModel("");
    setBrand("");
    setCustomBrand("");
    setType("");
    setCustomType("");
    setHasVariations(false);
    setModelsList([]);
    setEditingModelIndex(null);
    setVoltage("220v");
    setWaterSystem("Reservatório");
    setAmperage("10A");
    setColor("Preto");
    setHasSteamer("Não");
    setDimensions({ w: "", h: "", d: "" });
    setPatrimony("");
    setSerialNumber("");
    setHasSewage(false);
    setReservoirCount(0);
    setExtraReservoirCapacity("");
    setHasExtraReservoir(true);
    setWaterTankSize("");
    setWeight("");
    setEnvironmentRecommendation("");
    setExtractionCups("");
    setExtractionNozzles("");
    setDrinkCombinations("");
    setDoseAutonomy("");
    setSimultaneousDispenser(false);
    setDregsCapacity("");
    setTrayCount("");
    setSelectionCount("");
    setCupsCapacity("");
    setFilterType("");
  }

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- PROPS PARA O FORMULÁRIO ---
  // Reúne todos os states e handlers para passar limpo pro filho
  const formProps = {
    showModal,
    setShowModal,
    editingId,
    handleSave,
    loading,
    uploading,
    name,
    setName,
    description,
    setDescription,
    imageMode,
    setImageMode,
    photoUrl,
    setPhotoUrl,
    handleImageUpload,
    videoUrl,
    setVideoUrl,
    brand,
    setBrand,
    customBrand,
    setCustomBrand,
    type,
    setType,
    customType,
    setCustomType,
    hasVariations,
    setHasVariations,
    modelsList,
    editingModelIndex,
    handleEditModel,
    removeModel,
    handleCancelEditModel,
    tempModel,
    setTempModel,
    handleSaveModel,
    weight,
    setWeight,
    environmentRecommendation,
    setEnvironmentRecommendation,
    waterSystem,
    setWaterSystem,
    hasSewage,
    setHasSewage,
    waterTankSize,
    setWaterTankSize,
    extractionCups,
    setExtractionCups,
    extractionNozzles,
    setExtractionNozzles,
    drinkCombinations,
    setDrinkCombinations,
    doseAutonomy,
    setDoseAutonomy,
    trayCount,
    setTrayCount,
    selectionCount,
    setSelectionCount,
    simultaneousDispenser,
    setSimultaneousDispenser,
    dregsCapacity,
    setDregsCapacity,
    cupsCapacity,
    setCupsCapacity,
    filterType,
    setFilterType,
    extraReservoirCapacity,
    setExtraReservoirCapacity,
    hasExtraReservoir,
    setHasExtraReservoir,
    reservoirCount,
    setReservoirCount,
    voltage,
    setVoltage,
    amperage,
    setAmperage,
    dimensions,
    setDimensions,
    serialNumber,
    setSerialNumber,
    patrimony,
    handlePatrimonyChange,
  };

  return (
    <div className="min-h-screen pb-20 animate-fade-in">
      <MachinesList
        permissions={permissions || {}}
        loading={loading}
        filteredMachines={filteredMachines}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleNew={handleNew}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleOpenConfigs={handleOpenConfigs}
      />

      <MachineForm {...formProps} />
    </div>
  );
}
