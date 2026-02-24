import { Bookmark, Download } from "lucide-react";

export function Labels() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
          <Bookmark className="text-blue-600" /> Etiquetas & Arquivos
        </h1>
        <p className="text-gray-500 mt-1">
          Materiais prontos para download e impressão.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Bookmark size={24} />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">
              Modelo de Etiqueta {item}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Formato PDF pronto para impressão padrão.
            </p>
            <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Download size={16} /> Baixar Arquivo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
