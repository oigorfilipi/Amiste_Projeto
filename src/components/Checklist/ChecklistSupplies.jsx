import { Package } from "lucide-react";
import { FormSection } from "./ChecklistUI";

export function ChecklistSupplies(props) {
  const {
    suppliesData,
    toggleSupply,
    updateSupplyQty,
    catalogData,
    selectedAccessories,
    toggleItem,
    setSelectedAccessories,
    updateItemValue,
    isReadOnly,
  } = props;

  return (
    <FormSection title="Insumos e Acessórios" icon={Package}>
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-thin">
        {Object.entries(suppliesData).map(([cat, items]) => (
          <div
            key={cat}
            className="min-w-[240px] md:min-w-[260px] bg-gray-50 rounded-xl p-4 border border-gray-100 shrink-0"
          >
            <h5 className="font-bold text-xs uppercase mb-3 text-amiste-primary flex items-center gap-2">
              <div className="w-2 h-2 bg-amiste-primary rounded-full"></div>{" "}
              {cat}
            </h5>
            <div className="space-y-2">
              {Object.keys(items).map((key) => (
                <div key={key}>
                  <div
                    onClick={() => !isReadOnly && toggleSupply(cat, key)}
                    className={`flex items-center gap-2 p-1 rounded ${isReadOnly ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-gray-100"}`}
                  >
                    <div
                      className={`w-3 h-3 rounded border shrink-0 ${items[key].active ? "bg-green-500 border-green-500" : "border-gray-400"}`}
                    ></div>
                    <span className="text-xs font-medium text-gray-600 truncate">
                      {key}
                    </span>
                  </div>
                  {items[key].active && (
                    <input
                      type="text"
                      placeholder="Qtd"
                      className="w-full p-1 text-xs border rounded mt-1 bg-white animate-fade-in disabled:bg-gray-100 disabled:text-gray-500"
                      value={items[key].qty}
                      onChange={(e) =>
                        updateSupplyQty(cat, key, e.target.value)
                      }
                      disabled={isReadOnly}
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
        {catalogData?.accessories?.map((acc) => (
          <div
            key={acc}
            className={`p-3 rounded-xl border transition-all ${selectedAccessories[acc] !== undefined ? "bg-blue-50 border-blue-300" : "bg-white"} ${isReadOnly ? "opacity-70" : ""}`}
          >
            <div
              onClick={() =>
                !isReadOnly &&
                toggleItem(
                  selectedAccessories,
                  setSelectedAccessories,
                  acc,
                  "1",
                )
              }
              className={`flex items-center gap-2 mb-1 ${isReadOnly ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div
                className={`w-3 h-3 rounded border shrink-0 ${selectedAccessories[acc] !== undefined ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}
              ></div>
              <span className="text-sm text-gray-700 truncate">{acc}</span>
            </div>
            {selectedAccessories[acc] !== undefined && (
              <input
                type="text"
                placeholder="Qtd"
                className="w-full p-1 text-xs border rounded bg-white animate-fade-in disabled:bg-gray-100 disabled:text-gray-500"
                value={selectedAccessories[acc]}
                onChange={(e) =>
                  updateItemValue(
                    selectedAccessories,
                    setSelectedAccessories,
                    acc,
                    e.target.value,
                  )
                }
                disabled={isReadOnly}
              />
            )}
          </div>
        ))}
      </div>
    </FormSection>
  );
}
