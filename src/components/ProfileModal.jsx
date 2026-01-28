import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { X, Save, Shield, User, Mail, Lock } from "lucide-react";

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
    email: "", // Apenas visualização
    role: "",
    password: "", // Opcional para troca
  });

  // O usuário logado tem poder para mudar cargos?
  // AGORA DEV E DONO SÃO OS CHEFES
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

      // Só atualiza cargo se tiver permissão
      if (canEditRole) {
        updates.role = formData.role;
      }

      // 1. Atualizar Tabela de Perfis
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profileToEdit.id);

      if (error) throw error;

      // 2. Atualizar Senha (Se preenchido e for o próprio usuário)
      if (formData.password && formData.password.length >= 6) {
        const { error: passError } = await supabase.auth.updateUser({
          password: formData.password,
        });
        if (passError) alert("Erro ao mudar senha: " + passError.message);
        else alert("Senha alterada com sucesso!");
      }

      alert("Perfil atualizado!");
      onSave(); // Recarrega a lista no layout
      onClose();
    } catch (error) {
      alert("Erro ao atualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <User size={20} /> Editar Perfil
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Nome e Apelido */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Nome Completo
            </label>
            <input
              className="w-full p-2 border rounded bg-gray-50"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">
              Apelido (Nome de Exibição)
            </label>
            <input
              className="w-full p-2 border rounded"
              value={formData.nickname}
              onChange={(e) =>
                setFormData({ ...formData, nickname: e.target.value })
              }
            />
          </div>

          {/* Troca de Cargo (Só DEV/Dono vê isso) */}
          {canEditRole && (
            <div className="bg-amber-50 p-3 rounded border border-amber-200">
              <label className="block text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                <Shield size={12} /> Cargo / Permissões
              </label>
              <select
                className="w-full p-2 border rounded bg-white"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="Comercial">Comercial</option>
                <option value="Técnico">Técnico</option>
                <option value="Financeiro">Financeiro</option>

                {/* ADM = Administrativo (Operacional) */}
                <option value="ADM">Administrativo</option>

                {/* DEV = Superusuário */}
                <option value="DEV">DEV (System Admin)</option>

                <option value="Dono">Dono</option>
              </select>
            </div>
          )}

          {/* Troca de Senha (Opcional) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
              <Lock size={12} /> Nova Senha (Opcional)
            </label>
            <input
              type="password"
              placeholder="Deixe em branco para manter a atual"
              className="w-full p-2 border rounded"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amiste-primary hover:bg-red-800 text-white font-bold py-2 rounded flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={18} /> {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
