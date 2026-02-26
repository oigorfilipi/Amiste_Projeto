import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import toast from "react-hot-toast";
import {
  Bookmark,
  Download,
  Plus,
  ShieldAlert,
  Trash2,
  X,
  Link as LinkIcon,
  FileText,
  UploadCloud,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Labels() {
  const { permissions } = useContext(AuthContext);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState("file"); // 'file' ou 'link'
  const [selectedFile, setSelectedFile] = useState(null);
  const [newLabel, setNewLabel] = useState({
    title: "",
    description: "",
    file_url: "",
  });

  // Verificação de permissões
  const hasAccess =
    permissions?.Etiquetas !== "Nothing" &&
    permissions?.Etiquetas !== "Ghost" &&
    permissions?.Etiquetas !== undefined;

  const isReadOnly = permissions?.Etiquetas === "Read";

  useEffect(() => {
    if (hasAccess) fetchLabels();
  }, [hasAccess]);

  async function fetchLabels() {
    try {
      const { data, error } = await supabase
        .from("labels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLabels(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar etiquetas.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!newLabel.title) return toast.error("Preencha o título do arquivo.");

    if (uploadMode === "link" && !newLabel.file_url) {
      return toast.error("Cole o link do arquivo.");
    }

    if (uploadMode === "file" && !selectedFile) {
      return toast.error("Selecione um arquivo PDF ou imagem do seu PC.");
    }

    setSaving(true);
    try {
      let finalFileUrl = newLabel.file_url;

      // Se for Upload, envia para o Storage do Supabase primeiro
      if (uploadMode === "file" && selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `etiquetas/${fileName}`;

        // Faz o upload pro Bucket 'labels_files'
        const { error: uploadError } = await supabase.storage
          .from("labels_files")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Pega o link público do arquivo que acabou de subir
        const { data: publicUrlData } = supabase.storage
          .from("labels_files")
          .getPublicUrl(filePath);

        finalFileUrl = publicUrlData.publicUrl;
      }

      // Salva no banco de dados com o link (seja ele qual for)
      const { error: dbError } = await supabase.from("labels").insert([
        {
          title: newLabel.title,
          description: newLabel.description,
          file_url: finalFileUrl,
        },
      ]);

      if (dbError) throw dbError;

      toast.success("Arquivo salvo com sucesso!");
      closeModal();
      fetchLabels();
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, title, fileUrl) {
    if (!confirm(`Tem certeza que deseja apagar "${title}"?`)) return;

    try {
      // 1. Tenta deletar o arquivo do Storage, caso seja um arquivo hospedado no Supabase
      if (fileUrl && fileUrl.includes("labels_files")) {
        // Extrai o caminho do arquivo a partir da URL
        const urlParts = fileUrl.split("/labels_files/");
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from("labels_files").remove([filePath]);
        }
      }

      // 2. Deleta o registro do banco de dados
      const { error } = await supabase.from("labels").delete().eq("id", id);
      if (error) throw error;

      toast.success("Arquivo removido.");
      fetchLabels();
    } catch (error) {
      toast.error("Erro ao remover: " + error.message);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setNewLabel({ title: "", description: "", file_url: "" });
    setSelectedFile(null);
    setUploadMode("file");
  }

  // Fallback de segurança
  if (!hasAccess && !loading) {
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
            className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in relative">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 flex items-center gap-3">
              <Bookmark className="text-blue-600" /> Etiquetas & Arquivos
            </h1>
            <p className="text-gray-500 mt-1">
              Materiais prontos para download e impressão.
            </p>
          </div>

          {!isReadOnly && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Plus size={20} /> Novo Arquivo
            </button>
          )}
        </div>

        {/* LISTAGEM */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Carregando arquivos...
          </div>
        ) : labels.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
            <Bookmark size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="font-bold text-gray-500">
              Nenhum arquivo cadastrado ainda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {labels.map((item) => (
              <div
                key={item.id}
                className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center relative"
              >
                {!isReadOnly && (
                  <button
                    onClick={() =>
                      handleDelete(item.id, item.title, item.file_url)
                    }
                    className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Bookmark size={24} />
                </div>
                <h3 className="font-bold text-gray-800 mb-1 leading-tight break-words w-full">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 mb-6 flex-1">
                  {item.description || "Formato padrão para impressão."}
                </p>

                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-100"
                >
                  <Download size={16} /> Baixar Arquivo
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE NOVO ARQUIVO */}
      {isModalOpen && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800">
                Adicionar Novo Arquivo
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Opções de Upload ou Link */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                    uploadMode === "file"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Fazer Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("link")}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                    uploadMode === "link"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Colar Link
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Título da Etiqueta *
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />
                  <input
                    required
                    className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none text-sm"
                    placeholder="Ex: Etiqueta Patrimônio"
                    value={newLabel.title}
                    onChange={(e) =>
                      setNewLabel({ ...newLabel, title: e.target.value })
                    }
                  />
                </div>
              </div>

              {uploadMode === "link" ? (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Link do Arquivo (URL) *
                  </label>
                  <div className="relative">
                    <LinkIcon
                      className="absolute left-3 top-3 text-gray-400"
                      size={18}
                    />
                    <input
                      required={uploadMode === "link"}
                      type="url"
                      className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none text-sm"
                      placeholder="https://drive.google.com/..."
                      value={newLabel.file_url}
                      onChange={(e) =>
                        setNewLabel({ ...newLabel, file_url: e.target.value })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Selecione o PDF/Imagem *
                  </label>
                  <div className="relative flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-6 h-6 mb-2 text-gray-400" />
                        <p className="mb-1 text-xs text-gray-500">
                          <span className="font-bold">Clique para buscar</span>{" "}
                          no computador
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {selectedFile ? (
                            <span className="text-amiste-primary font-bold">
                              {selectedFile.name}
                            </span>
                          ) : (
                            "PDF, PNG, JPG ou DOC"
                          )}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Descrição Breve
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none text-sm resize-none h-20"
                  placeholder="Ex: Usar papel adesivo tamanho A4..."
                  value={newLabel.description}
                  onChange={(e) =>
                    setNewLabel({ ...newLabel, description: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {saving ? "Salvando..." : "Salvar Arquivo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
