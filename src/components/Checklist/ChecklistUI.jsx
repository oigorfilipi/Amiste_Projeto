import { Check } from "lucide-react";

// --- CONSTANTES ---

export const INITIAL_TOOLS = {
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

export const INITIAL_SUPPLIES = {
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
};

export const drinksList = [
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

export const accessoriesList = [
  "Pitcher",
  "Balança",
  "Tamper",
  "Tapete de Compactação",
  "Nivelador",
  "Pincel",
  "Porta Borras",
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

export const RadioGroup = ({ options, value, onChange, label }) => (
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
          className={`flex-1 py-2 md:py-2.5 px-2 rounded-md text-xs md:text-sm font-bold transition-all active:scale-[0.98] ${
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

export const ToggleCard = ({ label, checked, onChange, icon: Icon }) => (
  <div
    onClick={() => onChange(!checked)}
    className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center gap-3 active:scale-[0.98] select-none ${
      checked
        ? "bg-red-50 border-amiste-primary/50 ring-1 ring-amiste-primary/50"
        : "bg-white border-gray-200 hover:border-gray-300"
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
