import { Check } from "lucide-react";

// --- CONSTANTES DE FALLBACK (Caso o banco esteja vazio na primeira vez) ---
export const FALLBACK_TOOLS = [
  "Caixa Ferramentas",
  "Luvas",
  "Transformador",
  "Extensao",
  "Pano",
  "Balde",
];

// --- COMPONENTES VISUAIS ---

export const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 md:mb-8 transition-all hover:shadow-md">
    <div className="bg-gray-50/50 px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 flex items-center gap-3">
      <div className="p-2 bg-white rounded-lg shadow-sm text-amiste-primary shrink-0">
        <Icon size={18} className="md:w-5 md:h-5" />
      </div>
      <h3 className="font-bold text-gray-800 uppercase tracking-wide text-xs md:text-sm">
        {title}
      </h3>
    </div>
    <div className="p-4 md:p-6 lg:p-8">{children}</div>
  </div>
);

export const RadioGroup = ({ options, value, onChange, label, disabled }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
        {label}
      </label>
    )}
    <div
      className={`flex bg-gray-100 p-1 rounded-lg ${disabled ? "opacity-70" : ""}`}
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onChange(opt)}
          className={`flex-1 py-2 md:py-2.5 px-2 rounded-md text-xs md:text-sm font-bold transition-all ${
            value === opt
              ? "bg-white text-amiste-primary shadow-sm ring-1 ring-black/5"
              : "text-gray-500"
          } ${
            disabled
              ? "cursor-not-allowed"
              : "active:scale-[0.98] hover:text-gray-700"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export const ToggleCard = ({
  label,
  checked,
  onChange,
  icon: Icon,
  disabled,
}) => (
  <div
    onClick={() => !disabled && onChange(!checked)}
    className={`p-3 rounded-xl border transition-all flex items-center gap-3 select-none ${
      checked
        ? "bg-red-50 border-amiste-primary/50 ring-1 ring-amiste-primary/50"
        : "bg-white border-gray-200"
    } ${
      disabled
        ? "opacity-70 cursor-not-allowed"
        : "cursor-pointer hover:border-gray-300 active:scale-[0.98]"
    }`}
  >
    <div
      className={`p-1.5 md:p-2 rounded-full shrink-0 ${
        checked ? "bg-amiste-primary text-white" : "bg-gray-100 text-gray-400"
      }`}
    >
      {Icon ? <Icon size={14} /> : <Check size={14} />}
    </div>
    <span
      className={`text-xs md:text-sm font-medium leading-tight ${
        checked ? "text-amiste-primary" : "text-gray-600"
      }`}
    >
      {label}
    </span>
  </div>
);
