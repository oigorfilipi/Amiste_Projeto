import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import {
  ClipboardList,
  Wrench,
  FileText,
  Coffee,
  Plus,
  ArrowRight,
  Calendar,
  User,
} from "lucide-react";

export function Home() {
  const [recentChecklists, setRecentChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ machines: 0, checklists: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // 1. Buscar os 5 últimos checklists
      const { data: checklists } = await supabase
        .from("checklists")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (checklists) setRecentChecklists(checklists);

      // 2. Contar Máquinas (apenas para estatística)
      const { count: machinesCount } = await supabase
        .from("machines")
        .select("*", { count: "exact", head: true });

      // 3. Contar Total Checklists
      const { count: checklistsCount } = await supabase
        .from("checklists")
        .select("*", { count: "exact", head: true });

      setStats({
        machines: machinesCount || 0,
        checklists: checklistsCount || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  // Componente do Botão Quadrado (Card)
  function MenuCard({ to, icon: Icon, title, desc, color }) {
    return (
      <Link
        to={to}
        className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-amiste-primary/30 transition-all duration-300 transform hover:-translate-y-1"
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${color}`}
        >
          <Icon size={24} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-amiste-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{desc}</p>
      </Link>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* CABEÇALHO BOAS VINDAS */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Painel de Controle
        </h1>
        <p className="text-gray-500">Bem-vindo ao Sistema Amiste.</p>
      </div>

      {/* GRID DE BOTÕES DE AÇÃO (Menu Principal) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-fade-in">
        <MenuCard
          to="/checklists"
          icon={ClipboardList}
          title="Novo Checklist"
          desc="Iniciar instalação"
          color="bg-amiste-primary"
        />
        <MenuCard
          to="/wiki"
          icon={Wrench}
          title="Wiki Manutenção"
          desc="Base de conhecimento"
          color="bg-blue-600"
        />
        <MenuCard
          to="/portfolio"
          icon={FileText}
          title="Portfólio"
          desc="Gerar propostas"
          color="bg-emerald-600"
        />
        <MenuCard
          to="/machines"
          icon={Coffee}
          title="Máquinas"
          desc={`${stats.machines} modelos cadastrados`}
          color="bg-amber-600"
        />
      </div>

      {/* TABELA DE ÚLTIMOS CHECKLISTS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList size={20} className="text-amiste-primary" />
            Últimos Checklists Criados
          </h2>
          <Link
            to="/checklists"
            className="text-sm font-bold text-amiste-primary hover:text-amiste-secondary flex items-center gap-1"
          >
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Cliente / Evento</th>
                <th className="p-4 font-bold">Máquina</th>
                <th className="p-4 font-bold">Data Instalação</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-400">
                    Carregando histórico...
                  </td>
                </tr>
              ) : recentChecklists.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Nenhum checklist criado ainda.
                    <br />
                    <Link
                      to="/checklists"
                      className="text-amiste-primary font-bold hover:underline mt-2 inline-block"
                    >
                      Criar o primeiro agora
                    </Link>
                  </td>
                </tr>
              ) : (
                recentChecklists.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-gray-800">
                        {item.install_type === "Cliente"
                          ? item.client_name
                          : item.event_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.install_type}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Coffee size={16} className="text-gray-400" />
                        {item.machine_name}
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                          x{item.quantity}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        {new Date(item.install_date).toLocaleDateString(
                          "pt-BR",
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-gray-400 hover:text-amiste-primary transition-colors font-medium text-xs border border-gray-200 hover:border-amiste-primary px-3 py-1 rounded-lg">
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-10 text-center text-xs text-gray-400">
        © 2026 Sistema Amiste - By Friyl
      </footer>
    </div>
  );
}
