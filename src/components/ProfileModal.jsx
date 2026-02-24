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
} from "lucide-react";

export function ProfileModal({
  isOpen,
  onClose,
  profileToEdit,
  // currentUserRole foi removido daqui pois agora usamos o AuthContext super inteligente!
  onSave,
}) {
  const { realProfile, permissions } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    nickname: "",
    email: "",
    role: "",
    password: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (profileToEdit) {
      setFormData({
        full_name: profileToEdit.full_name || "",
        nickname: profileToEdit.nickname || "",
        role: profileToEdit.role || "Visitante",
        email: profileToEdit.email || "Email gerido pelo Auth",
        password: "",
        avatar_url: profileToEdit.avatar_url || "",
      });
    }
  }, [profileToEdit]);

  if (!isOpen || !profileToEdit) return null;

  // --- REGRAS DE PERMISSÃO DO PERFIL (Conforme sua lista) ---
  const isOwnProfile = realProfile?.id === profileToEdit.id;

  // O Dono não pode alterar o cargo do DEV
  const isDonoEditingDev =
    ["Dono", "Don."].includes(realProfile?.role) &&
    ["DEV", "Dev", "Dev."].includes(profileToEdit?.role);

  // Só pode editar a ROLE se a permissão for "All", NÃO for o próprio perfil, e NÃO for Dono editando DEV
  const canEditRole =
    permissions?.Perfil === "All" && !isOwnProfile && !isDonoEditingDev;

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
    setLoading(true);

    try {
      const updates = {
        full_name: formData.full_name,
        nickname: formData.nickname,
        avatar_url: formData.avatar_url,
      };

      // Só envia a atualização de cargo se for permitido
      if (canEditRole) {
        updates.role = formData.role;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profileToEdit.id);

      if (error) throw error;

      if (formData.password && formData.password.length >= 6) {
        const { error: passError } = await supabase.auth.updateUser({
          password: formData.password,
        });
        if (passError) {
          toast.error("Erro ao mudar senha: " + passError.message);
        } else {
          toast.success("Senha alterada com sucesso!");
        }
      }

      toast.success("Perfil atualizado com sucesso!");
      onSave();
      onClose();
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]">
        <div className="overflow-y-auto">
          {/* --- HEADER COM FOTO --- */}
          <div
            className={`h-32 ${getRoleColor(formData.role)} relative shrink-0`}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm z-10"
            >
              <X size={20} />
            </button>

            <div className="absolute -bottom-10 left-6 group">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-2xl font-bold text-gray-400 relative overflow-hidden">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}

                {/* Só quem tem permissão para editar foto (si mesmo ou Master) vai poder ver o input */}
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {uploading ? (
                    <Loader2 className="text-white animate-spin" size={24} />
                  ) : (
                    <Camera className="text-white" size={24} />
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

          <div className="pt-12 px-6 pb-2">
            <h2 className="text-xl font-bold text-gray-800 leading-tight">
              {formData.full_name || "Novo Usuário"}
            </h2>
            <p className="text-sm text-gray-500 flex flex-wrap items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${getRoleColor(formData.role)}`}
              >
                {formData.role}
              </span>
              <span className="text-xs truncate max-w-[200px]">
                {formData.email}
              </span>
            </p>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                  Apelido
                </label>
                <input
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData({ ...formData, nickname: e.target.value })
                  }
                />
              </div>
            </div>

            {/* SEÇÃO DE PERMISSÃO: Fica Oculta se não for DEV/Dono, ou se for o próprio perfil, ou se for Dono editando Dev */}
            {canEditRole && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <Shield size={14} className="text-amiste-primary" /> Permissão
                  (Tag)
                </label>
                <select
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white outline-none"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="Comercial">Comercial (Com.)</option>
                  <option value="Técnico">Técnico (Téc.)</option>
                  <option value="Financeiro">Financeiro (Fin.)</option>
                  <option value="Administrativo">Administrativo (Adm.)</option>
                  <option value="DEV">DEV (System Admin)</option>
                  <option value="Dono">Dono (Don.)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 flex items-center gap-1">
                <Key size={12} /> Nova Senha (Opcional)
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 pb-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <Save size={18} /> {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
