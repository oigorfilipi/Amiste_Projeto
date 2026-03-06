import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Edit2, Plus, X, Save, Layers } from "lucide-react";
import { MachineBasicInfo } from "./MachineBasicInfo";
import { MachineModelsManager } from "./MachineModelsManager";
import { MachineTechSpecs } from "./MachineTechSpecs";

export function MachineForm(props) {
  const { permissions } = useContext(AuthContext);

  // MODO DE LEITURA (Read-Only)
  const isReadOnly = permissions?.Maquinas === "Read";

  const {
    showModal,
    setShowModal,
    editingId,
    handleSave,
    loading,
    uploading,
    hasVariations,
    setHasVariations,
  } = props;

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER FIXO */}
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
            {editingId ? (
              <Edit2 size={20} className="text-amiste-primary" />
            ) : (
              <Plus size={20} className="text-amiste-primary" />
            )}
            {editingId ? "Editar Máquina" : "Nova Máquina"}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY SCROLLABLE */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isReadOnly) handleSave(e);
          }}
          className="p-5 md:p-8 space-y-8 overflow-y-auto"
        >
          {isReadOnly && (
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-bold flex items-center gap-2 mb-4">
              Você está em modo de visualização. As edições estão desabilitadas.
            </div>
          )}

          {/* 1. Componente de Identificação */}
          <MachineBasicInfo {...props} isReadOnly={isReadOnly} />

          <div className="h-px bg-gray-100"></div>

          {/* SELEÇÃO: POSSUI MODELOS? */}
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-purple-600">
                <Layers size={20} />
              </div>
              <div>
                <h4 className="font-bold text-purple-900 text-sm">
                  Múltiplos Modelos?
                </h4>
                <p className="text-xs text-purple-700">
                  Ex: 6L, 15L (Variações)
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={hasVariations}
                onChange={(e) =>
                  !isReadOnly && setHasVariations(e.target.checked)
                }
                disabled={isReadOnly}
              />
              <div
                className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isReadOnly ? "opacity-60 cursor-not-allowed" : "peer-checked:bg-purple-600"}`}
              ></div>
            </label>
          </div>

          {/* 2. Componentes Técnicos Condicionais */}
          {hasVariations ? (
            <MachineModelsManager {...props} isReadOnly={isReadOnly} />
          ) : (
            <MachineTechSpecs {...props} isReadOnly={isReadOnly} />
          )}

          {/* FOOTER DOS BOTÕES */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold transition-colors"
            >
              {isReadOnly ? "Fechar" : "Cancelar"}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-8 py-3 bg-amiste-primary hover:bg-amiste-secondary text-white rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                <Save size={20} /> {loading ? "Salvando..." : "Salvar Máquina"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
