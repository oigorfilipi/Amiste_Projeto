import { CheckCircle, AlertCircle } from "lucide-react";

export function ClientStatus() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
          <CheckCircle className="text-green-600" /> Status Clientes
        </h1>
        <p className="text-gray-500 mt-1">
          Acompanhamento de portfólios concluídos e cancelados.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <AlertCircle size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-700 mb-2">
          Área em Construção
        </h3>
        <p className="text-gray-500 text-sm">
          Esta área vai listar os clientes do Portfólio assim que configurarmos
          as permissões do banco de dados na próxima fase.
        </p>
      </div>
    </div>
  );
}
