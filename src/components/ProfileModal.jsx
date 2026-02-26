import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  X,
  Save,
  Shield,
  User,
  Lock,
  Key,
  Camera,
  Loader2,
  Calendar,
  Fingerprint,
  Mail,
  AlertTriangle,
} from "lucide-react";

export function ProfileModal({ isOpen, onClose, profileToEdit, onSave }) {
  const { realProfile, permissions } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("pessoal");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    nickname: "",
    email: "",
    role: "",
    cpf: "",
    birth_date: "",
    password: "",
    confirm_password: "",
    avatar_url: "",
  });

  // Regras de Bloqueio
  const isOwnProfile = realProfile?.id === profileToEdit?.id;
  const isMandatoryPasswordChange =
    isOwnProfile && profileToEdit?.must_change_password;

  const isDonoEditingDev =
    ["Dono", "Don."].includes(realProfile?.role) &&
    ["DEV", "Dev", "Dev."].includes(profileToEdit?.role);

  const canEditRole =
    permissions?.Perfil === "All" && !isOwnProfile && !isDonoEditingDev;

  useEffect(() => {
    if (profileToEdit) {
      // Formata data do banco (YYYY-MM-DD) para (DD/MM/YYYY) para exibir
      let formattedDate = "";
      if (profileToEdit.birth_date) {
        const parts = profileToEdit.birth_date.split("-");
        if (parts.length === 3) {
          formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        } else {
          formattedDate = profileToEdit.birth_date;
        }
      }

      setFormData({
        full_name: profileToEdit.full_name || "",
        nickname: profileToEdit.nickname || "",
        role: profileToEdit.role || "Visitante",
        email: profileToEdit.email || "Email",
        cpf: profileToEdit.cpf || "Não informado",
        birth_date: formattedDate || "Não informada",
        password: "",
        confirm_password: "",
        avatar_url: profileToEdit.avatar_url || "",
      });

      // Se for obrigatório trocar a senha, joga a pessoa pra aba de segurança e trava lá
      if (isMandatoryPasswordChange) {
        setActiveTab("seguranca");
      } else {
        setActiveTab("pessoal");
      }
    }
  }, [profileToEdit, isMandatoryPasswordChange]);

  if (!isOpen || !profileToEdit) return null;

  async function handleAvatarUpload(event) {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${profileToEdit.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, avatar_url: data.publicUrl }));
      toast.success("Imagem carregada! Clique em Salvar para confirmar.");
    } catch (error) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();

    // Validação da Senha Obrigatória
    if (
      isMandatoryPasswordChange &&
      (!formData.password || formData.password.length < 6)
    ) {
      return toast.error(
        "Você é obrigado a definir uma nova senha (mín. 6 caracteres).",
      );
    }

    if (formData.password && formData.password !== formData.confirm_password) {
      return toast.error("As senhas não coincidem!");
    }

    setLoading(true);

    try {
      const updates = {
        full_name: formData.full_name,
        nickname: formData.nickname,
        avatar_url: formData.avatar_url,
      };

      if (canEditRole) updates.role = formData.role;

      // Se ele trocou a senha obrigatória, removemos a trava dele
      if (isMandatoryPasswordChange && formData.password) {
        updates.must_change_password = false;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profileToEdit.id);
      if (error) throw error;

      // Mudar senha no Auth
      if (formData.password && formData.password.length >= 6) {
        const { error: passError } = await supabase.auth.updateUser({
          password: formData.password,
        });
        if (passError) throw passError;
        toast.success("Senha alterada com sucesso!");
      }

      toast.success("Perfil atualizado com sucesso!");

      // Se era troca de senha obrigatória, dá um reload na tela pra limpar a trava do sistema e puxar o usuário atualizado
      if (isMandatoryPasswordChange) {
        window.location.reload();
      } else {
        if (onSave) onSave();
        onClose();
      }
    } catch (error) {
      toast.error("Erro ao atualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const getRoleColor = (role) => {
    if (["DEV", "Dev", "Dev."].includes(role)) return "bg-purple-600";
    if (["Dono", "Don."].includes(role)) return "bg-amber-500";
    if (["Comercial", "Com."].includes(role)) return "bg-blue-600";
    return "bg-amiste-primary";
  };

  const initials = formData.full_name
    ? formData.full_name.substring(0, 2).toUpperCase()
    : "??";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[95vh]">
        {/* --- HEADER COM FOTO --- */}
        <div
          className={`h-32 md:h-40 ${getRoleColor(formData.role)} relative shrink-0 transition-colors duration-500`}
        >
          {/* Se a troca de senha for obrigatória, ele NÃO PODE fechar o modal. */}
          {!isMandatoryPasswordChange && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm z-10"
            >
              <X size={20} />
            </button>
          )}

          <div className="absolute -bottom-12 left-6 md:left-8 group">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-3xl font-bold text-gray-400 relative overflow-hidden">
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}

              {/* Botão de Upload da Foto */}
              <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploading ? (
                  <Loader2 className="text-white animate-spin" size={28} />
                ) : (
                  <Camera className="text-white" size={28} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-14 px-6 md:px-8 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                {formData.full_name || "Novo Usuário"}
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1 font-medium">
                <Mail size={14} /> {formData.email}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase text-white shadow-sm self-start md:self-auto ${getRoleColor(formData.role)}`}
            >
              Cargo: {formData.role}
            </div>
          </div>
        </div>

        {isMandatoryPasswordChange && (
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3 text-red-700 shrink-0">
            <AlertTriangle className="animate-pulse" size={24} />
            <div>
              <p className="text-sm font-bold">Ação Necessária: Segurança</p>
              <p className="text-xs">
                Este é o seu primeiro acesso. Você precisa definir uma nova
                senha pessoal para continuar.
              </p>
            </div>
          </div>
        )}

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex px-6 md:px-8 pt-4 gap-2 shrink-0 border-b border-gray-100">
          <button
            type="button"
            onClick={() =>
              !isMandatoryPasswordChange && setActiveTab("pessoal")
            }
            className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === "pessoal" ? "border-amiste-primary text-amiste-primary" : "border-transparent text-gray-400 hover:text-gray-600"} ${isMandatoryPasswordChange && activeTab !== "pessoal" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="flex items-center gap-2">
              <User size={16} /> Dados Pessoais
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("seguranca")}
            className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === "seguranca" ? "border-amiste-primary text-amiste-primary" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            <span className="flex items-center gap-2">
              <Shield size={16} /> Segurança
            </span>
          </button>
        </div>

        {/* FORMULÁRIO SCROLLABLE */}
        <div className="overflow-y-auto flex-1 p-6 md:p-8 bg-gray-50/30">
          <form id="profile-form" onSubmit={handleSave} className="space-y-6">
            {/* ABA: PESSOAL */}
            {activeTab === "pessoal" && (
              <div className="space-y-6 animate-fade-in">
                {/* Dados Editáveis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                      Nome Completo
                    </label>
                    <input
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                      Como quer ser chamado(a)
                    </label>
                    <input
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                      placeholder="Apelido curto"
                      value={formData.nickname}
                      onChange={(e) =>
                        setFormData({ ...formData, nickname: e.target.value })
                      }
                    />
                  </div>

                  {canEditRole && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 text-amiste-primary">
                        Editar Cargo
                      </label>
                      <select
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                      >
                        <option value="Comercial">Comercial (Com.)</option>
                        <option value="Técnico">Técnico (Téc.)</option>
                        <option value="Financeiro">Financeiro (Fin.)</option>
                        <option value="Administrativo">
                          Administrativo (Adm.)
                        </option>
                        <option value="DEV">DEV (System Admin)</option>
                        <option value="Dono">Dono (Don.)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gray-200"></div>

                {/* Dados Bloqueados / Leitura */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Informações de Contrato (Somente Leitura)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 p-3 rounded-xl border border-gray-200 opacity-80 cursor-not-allowed">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <Fingerprint size={12} /> CPF Cadastrado
                      </label>
                      <p className="font-bold text-sm text-gray-700">
                        {formData.cpf}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-xl border border-gray-200 opacity-80 cursor-not-allowed">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <Calendar size={12} /> Data de Nascimento
                      </label>
                      <p className="font-bold text-sm text-gray-700">
                        {formData.birth_date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA: SEGURANÇA */}
            {activeTab === "seguranca" && (
              <div className="space-y-6 animate-fade-in max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Key size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Alterar Senha de Acesso
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Sua nova senha deve ter no mínimo 6 caracteres.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={formData.confirm_password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirm_password: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* FOOTER FIXO DOS BOTÕES */}
        <div className="p-4 md:p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
          {!isMandatoryPasswordChange && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            form="profile-form"
            disabled={loading || uploading}
            className="bg-amiste-primary hover:bg-amiste-secondary text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Save size={18} /> {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
