import { Link } from "react-router-dom";
import {
  Plus,
  ClipboardList,
  Check,
  XCircle,
  Edit2,
  Coffee,
  Calendar,
  Search,
  Trash2,
  Printer,
} from "lucide-react";

export function ChecklistList({
  permissions,
  checklistsHistory,
  filterStatus,
  setFilterStatus,
  handleNewChecklist,
  handleEdit,
  handleDelete,
}) {
  const getStatusColor = (st) => {
    if (st === "Finalizado") return "bg-green-100 text-green-700";
    if (st === "Cancelado") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  const filteredList = checklistsHistory.filter(
    (c) => filterStatus === "Todos" || c.status === filterStatus,
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 animate-fade-in pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">
            Checklists
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Gerencie ordens de serviço e instalações.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {/* Botão de Imprimir em Branco */}
          <Link
            to="/checklists/print-blank"
            className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 md:px-4 py-3 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-1 flex-1 md:flex-none"
            title="Imprimir Ficha"
          >
            <Printer size={20} />
            <span className="hidden md:inline">Imprimir Ficha</span>
          </Link>

          {permissions.canCreateChecklist && (
            <button
              onClick={handleNewChecklist}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-4 md:px-6 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-1 flex-1 md:flex-none"
            >
              <Plus size={20} />{" "}
              <span className="whitespace-nowrap">Novo Checklist</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTROS (Scroll Horizontal) */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1 overflow-x-auto no-scrollbar">
        {["Todos", "Finalizado", "Rascunho", "Cancelado"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 text-sm font-bold whitespace-nowrap relative transition-colors ${
              filterStatus === st
                ? "text-amiste-primary"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {st}
            {filterStatus === st && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amiste-primary rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* LISTA DE CARDS */}
      <div className="grid grid-cols-1 gap-4">
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center animate-fade-in mx-auto max-w-lg mt-4">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <ClipboardList size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              Nenhum checklist encontrado
            </h3>
            <p className="text-gray-400 max-w-sm mx-auto mb-6 text-sm px-4">
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
          filteredList.map((c) => (
            <div
              key={c.id}
              className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group active:scale-[0.99]"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-full shrink-0 ${
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

                <div className="min-w-0">
                  <h3 className="font-bold text-gray-800 text-base md:text-lg leading-tight truncate pr-2">
                    {c.client_name || c.event_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs md:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Coffee size={12} /> {c.machine_name || "Sem máquina"}
                    </span>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações e Status */}
              <div className="flex items-center justify-between md:justify-end gap-3 border-t border-gray-50 md:border-none pt-3 md:pt-0 mt-1 md:mt-0">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${getStatusColor(
                    c.status,
                  )}`}
                >
                  {c.status}
                </span>

                <div className="flex items-center gap-1">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
