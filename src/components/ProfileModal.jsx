import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { X, Save, Shield, User, Mail, Lock, Key } from "lucide-react";

export function ProfileModal({
  isOpen,
  onClose,
  profileToEdit,
  currentUserRole,
  onSave,
}) {
  if (!isOpen || !profileToEdit) return null;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    nickname: "",
    email: "",
    role: "",
    password: "",
  });

  const canEditRole = ["DEV", "Dono"].includes(currentUserRole);

  useEffect(() => {
    setFormData({
      full_name: profileToEdit.full_name || "",
      nickname: profileToEdit.nickname || "",
      role: profileToEdit.role || "Visitante",
      email: profileToEdit.email || "Email gerido pelo Auth",
      password: "",
    });
  }, [profileToEdit]);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = {
        full_name: formData.full_name,
        nickname: formData.nickname,
      };

      if (canEditRole) {
        updates.role = formData.role;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          nickname: formData.nickname,
          role: formData.role, // <--- TEM QUE TER ESSA LINHA
        })
        .eq("id", profileToEdit.id);

      if (error) throw error;

      if (formData.password && formData.password.length >= 6) {
        const { error: passError } = await supabase.auth.updateUser({
          password: formData.password,
        });
        if (passError) alert("Erro ao mudar senha: " + passError.message);
        else alert("Senha alterada com sucesso!");
      }

      alert("Perfil atualizado!");
      onSave();
      onClose();
    } catch (error) {
      alert("Erro ao atualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Cores baseadas no cargo
  const getRoleColor = (role) => {
    if (role === "DEV") return "bg-purple-600";
    if (role === "Dono") return "bg-amber-500";
    if (role === "Comercial") return "bg-blue-600";
    return "bg-amiste-primary";
  };

  const initials = formData.full_name
    ? formData.full_name.substring(0, 2).toUpperCase()
    : "??";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        {/* Header Visual (Estilo Crachá) */}
        <div className={`h-32 ${getRoleColor(formData.role)} relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm"
          >
            <X size={20} />
          </button>

          <div className="absolute -bottom-10 left-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-2xl font-bold text-gray-400">
              {initials}
            </div>
          </div>
        </div>

        <div className="pt-12 px-6 pb-2">
          <h2 className="text-xl font-bold text-gray-800">
            {formData.full_name || "Novo Usuário"}
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${getRoleColor(formData.role)}`}
            >
              {formData.role}
            </span>
            <span className="text-xs ml-2">{formData.email}</span>
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Nome e Apelido */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Nome Completo
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all bg-gray-50 focus:bg-white"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Ex: João da Silva"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Apelido
              </label>
              <input
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
                placeholder="Como prefere ser chamado"
              />
            </div>
          </div>

          {/* Troca de Cargo */}
          {canEditRole && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <Shield size={14} className="text-amiste-primary" /> Permissão
                de Acesso
              </label>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-lg bg-white outline-none focus:border-amiste-primary cursor-pointer text-sm"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="Comercial">Comercial</option>
                <option value="Técnico">Técnico</option>
                <option value="Financeiro">Financeiro</option>
                <option value="ADM">Administrativo</option>
                <option value="DEV">DEV (System Admin)</option>
                <option value="Dono">Dono</option>
              </select>
            </div>
          )}

          {/* Troca de Senha */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 flex items-center gap-1">
              <Key size={12} /> Nova Senha (Opcional)
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                placeholder="••••••"
                className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all bg-gray-50 focus:bg-white"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl font-bold text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save size={18} /> {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
