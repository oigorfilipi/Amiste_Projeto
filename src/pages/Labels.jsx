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
  Edit2,
  X,
  Link as LinkIcon,
  FileText,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Labels() {
  const { permissions } = useContext(AuthContext);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal e Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Evita duplo clique na exclusão
  const [editingId, setEditingId] = useState(null); // Controla se está criando ou editando
  const [oldFileUrl, setOldFileUrl] = useState(""); // Guarda o link antigo para poder apagar se for trocado

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

  // --- ABRIR MODAL PARA EDITAR ---
  function handleEdit(item) {
    setEditingId(item.id);
    setOldFileUrl(item.file_url);
    setNewLabel({
      title: item.title,
      description: item.description || "",
      file_url: item.file_url,
    });
    setUploadMode(item.file_url.includes("labels_files") ? "file" : "link");
    setSelectedFile(null); // Limpa o arquivo selecionado (só muda se o usuário escolher outro)
    setIsModalOpen(true);
  }

  // --- SALVAR OU ATUALIZAR ---
  async function handleSave(e) {
    e.preventDefault();
    if (!newLabel.title) return toast.error("Preencha o título do arquivo.");

    if (uploadMode === "link" && !newLabel.file_url) {
      return toast.error("Cole o link do arquivo.");
    }

    if (!editingId && uploadMode === "file" && !selectedFile) {
      return toast.error("Selecione um arquivo PDF ou imagem do seu PC.");
    }

    setSaving(true);
    try {
      let finalFileUrl = newLabel.file_url;

      // Se o usuário selecionou um arquivo NOVO do PC para subir
      if (uploadMode === "file" && selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `etiquetas/${fileName}`;

        // 1. Sobe o arquivo novo
        const { error: uploadError } = await supabase.storage
          .from("labels_files")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // 2. Pega o link público novo
        const { data: publicUrlData } = supabase.storage
          .from("labels_files")
          .getPublicUrl(filePath);

        finalFileUrl = publicUrlData.publicUrl;
      }

      // Se estamos EDITANDO e o link final ficou diferente do antigo, apagamos o arquivo velho do servidor
      if (
        editingId &&
        oldFileUrl &&
        oldFileUrl.includes("labels_files") &&
        finalFileUrl !== oldFileUrl
      ) {
        const oldPath = oldFileUrl.split("/labels_files/")[1]?.split("?")[0];
        if (oldPath) {
          await supabase.storage.from("labels_files").remove([oldPath]);
        }
      }

      // Salva no banco de dados (Update ou Insert)
      if (editingId) {
        const { error: dbError } = await supabase
          .from("labels")
          .update({
            title: newLabel.title,
            description: newLabel.description,
            file_url: finalFileUrl,
          })
          .eq("id", editingId);
        if (dbError) throw dbError;
        toast.success("Arquivo atualizado com sucesso!");
      } else {
        const { error: dbError } = await supabase.from("labels").insert([
          {
            title: newLabel.title,
            description: newLabel.description,
            file_url: finalFileUrl,
          },
        ]);
        if (dbError) throw dbError;
        toast.success("Arquivo salvo com sucesso!");
      }

      closeModal();
      await fetchLabels();
    } catch (error) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  // --- APAGAR ARQUIVO E REGISTRO ---
  async function handleDelete(id, title, fileUrl) {
    if (!window.confirm(`Tem certeza que deseja apagar "${title}"?`)) return;

    setDeletingId(id);
    try {
      // 1. Apaga o arquivo físico do Supabase Storage (se for um arquivo upado)
      if (fileUrl && fileUrl.includes("labels_files")) {
        const filePath = fileUrl.split("/labels_files/")[1]?.split("?")[0];
        if (filePath) {
          await supabase.storage.from("labels_files").remove([filePath]);
        }
      }

      // 2. Apaga o registro do banco
      const { error } = await supabase.from("labels").delete().eq("id", id);
      if (error) throw error;

      toast.success("Arquivo removido com sucesso.");
      await fetchLabels();
    } catch (error) {
      toast.error("Erro ao remover: " + error.message);
    } finally {
      setDeletingId(null);
    }
  }

  function closeModal() {
    if (saving) return; // Bloqueia o fechamento se estiver salvando
    setIsModalOpen(false);
    setEditingId(null);
    setOldFileUrl("");
    setNewLabel({ title: "", description: "", file_url: "" });
    setSelectedFile(null);
    setUploadMode("file");
  }

  // --- TRUQUE PARA FORÇAR O NOME NO DOWNLOAD ---
  // Transforma o link do Supabase adicionando "?download=Nome_Da_Etiqueta.pdf"
  const getDownloadUrl = (url, title) => {
    if (!url) return "";
    if (url.includes("labels_files")) {
      const cleanUrl = url.split("?")[0]; // Tira parâmetros velhos se tiver
      const ext = cleanUrl.split(".").pop() || "pdf"; // Pega a extensão (.pdf, .png)
      const safeTitle = title.replace(/[^a-zA-Z0-9]/g, "_"); // Remove acentos e espaços pro nome não quebrar
      return `${cleanUrl}?download=${safeTitle}.${ext}`;
    }
    return url; // Se for link externo (ex: Google Drive), retorna normal
  };

  // Fallback de segurança
  if (!hasAccess && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 animate-fade-in">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-500 mb-8 font-medium">
            Você não tem permissão para acessar o módulo de Etiquetas.
          </p>
          <Link
            to="/"
            className="flex items-center justify-center w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1"
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
              <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <Bookmark className="text-blue-600" size={24} />
              </div>
              Etiquetas & Arquivos
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Materiais prontos para download e impressão rápida.
            </p>
          </div>

          {!isReadOnly && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-[0.98] hover:-translate-y-1"
            >
              <Plus size={20} /> Novo Arquivo
            </button>
          )}
        </div>

        {/* LISTAGEM */}
        {loading ? (
          // Skeleton Loading
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-200 w-3/4 rounded mb-2"></div>
                <div className="h-3 bg-gray-100 w-full rounded mb-6"></div>
                <div className="h-10 bg-gray-50 w-full rounded-xl mt-auto"></div>
              </div>
            ))}
          </div>
        ) : labels.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200 shadow-sm animate-fade-in max-w-2xl mx-auto mt-4">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Bookmark size={36} className="text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-700 text-xl mb-2">
              Nenhum arquivo cadastrado
            </h3>
            <p className="text-gray-400 font-medium">
              Adicione etiquetas, manuais ou documentos importantes para fácil
              acesso.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {labels.map((item) => (
              <div
                key={item.id}
                className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex flex-col items-center text-center relative hover:-translate-y-1"
              >
                {/* Botões de Ação Ocultos */}
                {!isReadOnly && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleEdit(item)}
                      disabled={deletingId === item.id}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(item.id, item.title, item.file_url)
                      }
                      disabled={deletingId === item.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                      title="Apagar"
                    >
                      {deletingId === item.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-red-500"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                )}

                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                  <Bookmark size={28} />
                </div>

                <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight break-words w-full px-2">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-500 mb-6 flex-1 px-2 font-medium">
                  {item.description || "Formato padrão para impressão."}
                </p>

                <a
                  href={getDownloadUrl(item.file_url, item.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-100 hover:border-blue-200"
                >
                  <Download size={18} /> Baixar Arquivo
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE NOVO/EDITAR ARQUIVO */}
      {isModalOpen && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                {editingId ? (
                  <Edit2 size={20} className="text-blue-500" />
                ) : (
                  <Plus size={20} className="text-amiste-primary" />
                )}
                {editingId ? "Editar Arquivo" : "Adicionar Novo Arquivo"}
              </h3>
              <button
                onClick={closeModal}
                disabled={saving}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-xl transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Opções de Upload ou Link */}
              <div className="flex bg-gray-100 p-1.5 rounded-xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  disabled={saving}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    uploadMode === "file"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Fazer Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("link")}
                  disabled={saving}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    uploadMode === "link"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Colar Link
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  Título da Etiqueta *
                </label>
                <div className="relative group">
                  <FileText
                    className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-amiste-primary transition-colors"
                    size={18}
                  />
                  <input
                    required
                    className="w-full pl-11 p-3.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary/20 focus:border-amiste-primary outline-none text-sm font-medium transition-all"
                    placeholder="Ex: Etiqueta Patrimônio"
                    value={newLabel.title}
                    onChange={(e) =>
                      setNewLabel({ ...newLabel, title: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              {uploadMode === "link" ? (
                <div className="animate-fade-in">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Link do Arquivo (URL) *
                  </label>
                  <div className="relative group">
                    <LinkIcon
                      className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-amiste-primary transition-colors"
                      size={18}
                    />
                    <input
                      required={uploadMode === "link"}
                      type="url"
                      className="w-full pl-11 p-3.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary/20 focus:border-amiste-primary outline-none text-sm transition-all"
                      placeholder="https://drive.google.com/..."
                      value={newLabel.file_url}
                      onChange={(e) =>
                        setNewLabel({ ...newLabel, file_url: e.target.value })
                      }
                      disabled={saving}
                    />
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    {editingId && newLabel.file_url.includes("labels_files")
                      ? "Arquivo atual salvo. Selecione outro para substituir:"
                      : "Selecione o PDF/Imagem *"}
                  </label>
                  <div className="relative flex items-center justify-center w-full">
                    <label
                      className={`flex flex-col items-center justify-center w-full h-28 border-2 border-gray-300 border-dashed rounded-xl transition-all ${saving ? "opacity-50 cursor-not-allowed bg-gray-100" : "cursor-pointer bg-gray-50 hover:bg-white hover:border-amiste-primary/50 hover:shadow-sm"}`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-1 text-xs text-gray-500">
                          <span className="font-bold">Clique para buscar</span>{" "}
                          no computador
                        </p>
                        <p className="text-[10px] text-gray-400 text-center px-4 truncate w-full font-medium mt-1">
                          {selectedFile ? (
                            <span className="text-amiste-primary font-bold px-2 py-1 bg-red-50 rounded-md">
                              {selectedFile.name}
                            </span>
                          ) : editingId &&
                            newLabel.file_url.includes("labels_files") ? (
                            "Manter arquivo atual"
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
                        disabled={saving}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  Descrição Breve
                </label>
                <textarea
                  className="w-full p-3.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary/20 focus:border-amiste-primary outline-none text-sm resize-none h-24 transition-all"
                  placeholder="Ex: Usar papel adesivo tamanho A4..."
                  value={newLabel.description}
                  onChange={(e) =>
                    setNewLabel({ ...newLabel, description: e.target.value })
                  }
                  disabled={saving}
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-3.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 md:flex-none bg-amiste-primary hover:bg-amiste-secondary text-white px-8 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-red-100 active:scale-[0.98]"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Salvando...
                    </>
                  ) : editingId ? (
                    "Atualizar"
                  ) : (
                    "Salvar Arquivo"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
