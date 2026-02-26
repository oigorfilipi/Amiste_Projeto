import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { UserX, RefreshCw, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export function DeactivatedAccounts() {
  const { userProfile } = useContext(AuthContext); // <- Puxando o Perfil inteiro agora
  const [deactivatedUsers, setDeactivatedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // NOVA VERIFICAÇÃO (Abrange qualquer jeito que 'DEV' ou 'Dono' estiver escrito no banco)
  const hasAccess =
    userProfile &&
    ["DEV", "Dev", "Dev.", "Dono", "Don."].includes(userProfile.role);

  useEffect(() => {
    if (hasAccess) fetchDeactivated();
  }, [hasAccess]);

  async function fetchDeactivated() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "Desligado")
        .order("full_name");

      if (error) throw error;
      setDeactivatedUsers(data || []);
    } catch (err) {
      toast.error("Erro ao carregar contas desligadas.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReactivate(id) {
    if (
      !confirm(
        "Tem certeza que deseja reativar este usuário? Ele voltará como 'Visitante'.",
      )
    )
      return;

    try {
      // Reativa como Visitante para segurança, depois o Admin arruma o cargo
      const { error } = await supabase
        .from("profiles")
        .update({ role: "Visitante" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Conta reativada com sucesso!");
      fetchDeactivated(); // Atualiza a lista
    } catch (err) {
      toast.error("Erro ao reativar conta.");
    }
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Acesso Restrito</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
          <UserX className="text-red-500" /> Contas Desligadas
        </h1>
        <p className="text-gray-500">
          Histórico de ex-funcionários e revogações de acesso.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-10">Carregando...</p>
      ) : deactivatedUsers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100">
          <UserX size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="font-bold text-gray-500">
            Nenhuma conta desligada no momento.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase">
              <tr>
                <th className="p-4 pl-6">Nome / Nickname</th>
                <th className="p-4">CPF</th>
                <th className="p-4 text-right pr-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deactivatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-gray-800">{user.full_name}</p>
                    <p className="text-xs text-gray-400">{user.nickname}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {user.cpf || "-"}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleReactivate(user.id)}
                      className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      <RefreshCw size={14} /> Reativar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
