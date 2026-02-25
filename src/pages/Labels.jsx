import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Bookmark, Download, Plus, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export function Labels() {
  const { permissions } = useContext(AuthContext);

  // Verificação de permissões
  const hasAccess =
    permissions?.Etiquetas !== "Nothing" &&
    permissions?.Etiquetas !== "Ghost" &&
    permissions?.Etiquetas !== undefined;

  const isReadOnly = permissions?.Etiquetas === "Read";

  // Fallback de segurança caso a rota deixe passar
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-500 mb-6">
            Você não tem permissão para acessar o módulo de Etiquetas.
          </p>
          <Link
            to="/"
            className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
              <Bookmark className="text-blue-600" /> Etiquetas & Arquivos
            </h1>
            <p className="text-gray-500 mt-1">
              Materiais prontos para download e impressão.
            </p>
          </div>

          {/* Botão de Adicionar oculto para quem tem apenas leitura */}
          {!isReadOnly && (
            <button className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-[0.98]">
              <Plus size={20} /> Novo Arquivo
            </button>
          )}
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
    </div>
  );
}
