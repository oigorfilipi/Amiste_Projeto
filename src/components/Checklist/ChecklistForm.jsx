import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { ArrowLeft, XCircle, Save, Check } from "lucide-react";

// Importando os nossos novos subcomponentes
import { ChecklistGeneral } from "./ChecklistGeneral";
import { ChecklistEquipment } from "./ChecklistEquipment";
import { ChecklistPrep } from "./ChecklistPrep";
import { ChecklistSupplies } from "./ChecklistSupplies";
import { ChecklistLocationAndFinal } from "./ChecklistLocationAndFinal";

export function ChecklistForm(props) {
  const { permissions } = useContext(AuthContext);

  // Se a permissão for apenas Read, ativamos o modo de visualização.
  const isReadOnly = permissions?.Checklist === "Read";

  const { editingId, setView, handleCancelChecklist, handleSave } = props;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pb-20 animate-fade-in">
      {/* HEADER FIXO */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 -mx-4 md:-mx-8 mb-6 border-b border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3 transition-all">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setView("list")}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="truncate">
            <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">
              {editingId ? "Editar Checklist" : "Novo Checklist"}
            </h1>
            <p className="text-xs text-gray-500 hidden md:block">
              {isReadOnly
                ? "Modo de Visualização"
                : "Preencha os dados da instalação."}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {editingId && !isReadOnly && (
            <button
              onClick={handleCancelChecklist}
              className="px-3 md:px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <XCircle size={16} />{" "}
              <span className="hidden sm:inline">Cancelar</span>
            </button>
          )}

          {!isReadOnly && (
            <>
              <button
                onClick={() => handleSave("Rascunho")}
                className="flex-1 md:flex-none px-3 md:px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg font-bold text-xs md:text-sm flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Save size={16} /> Rascunho
              </button>
              <button
                onClick={() => handleSave("Finalizado")}
                className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-amiste-primary hover:bg-amiste-secondary text-white rounded-lg font-bold text-xs md:text-sm shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Check size={16} /> Finalizar
              </button>
            </>
          )}
        </div>
      </div>

      {/* CORPO DO FORMULÁRIO (Componentizado) */}
      <div className="space-y-6 md:space-y-8">
        <ChecklistGeneral {...props} isReadOnly={isReadOnly} />
        <ChecklistEquipment {...props} isReadOnly={isReadOnly} />
        <ChecklistPrep {...props} isReadOnly={isReadOnly} />
        <ChecklistSupplies {...props} isReadOnly={isReadOnly} />
        <ChecklistLocationAndFinal {...props} isReadOnly={isReadOnly} />
      </div>
    </div>
  );
}
