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

        <div className="flex gap-3">
          {/* Botão de Imprimir em Branco */}
          <Link
            to="/checklists/print-blank"
            className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all hover:-translate-y-1"
          >
            <Plus size={20} className="rotate-45" />
            <span className="hidden md:inline">Imprimir Ficha</span>
          </Link>

          {permissions.canCreateChecklist && (
            <button
              onClick={handleNewChecklist}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all hover:-translate-y-1"
            >
              <Plus size={20} /> Novo Checklist
            </button>
          )}
        </div>
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

      <div className="grid grid-cols-1 gap-4">
        {filteredList.length === 0 ? (
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
          filteredList.map((c) => (
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
  );
}
