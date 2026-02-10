import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { User, Lock, ArrowRight, Coffee } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useContext(AuthContext);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      // Redirecionamento é automático pelo AuthContext após login com sucesso
      toast.success("Login realizado com sucesso!");
    } catch (err) {
      console.error("Erro no login:", err);

      // Tratamento de erros comuns do Supabase com TOAST
      const msg = err.message || "";
      if (
        msg.includes("Invalid login credentials") ||
        msg.includes("invalid_credentials")
      ) {
        toast.error("E-mail ou senha incorretos.");
      } else if (msg.includes("Email not confirmed")) {
        toast.error("E-mail não confirmado. Verifique sua caixa de entrada.");
      } else {
        toast.error("Erro ao conectar. Tente novamente.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 md:p-8 font-sans relative">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[500px] z-10">
        {/* Lado Esquerdo (Branding) */}
        {/* Mobile: h-auto p-8. Desktop: w-1/2 p-12 */}
        <div className="bg-amiste-primary md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Efeito de Fundo */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/10 z-0"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4 md:mb-6 shadow-inner">
              <Coffee size={24} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 uppercase">
              Amiste
            </h1>
            <p className="text-red-100 text-xs md:text-sm font-medium tracking-wide border-l-2 border-red-300 pl-3">
              Sistema de Gestão Integrado
            </p>
          </div>

          <div className="relative z-10 mt-8 md:mt-0 hidden md:block">
            <p className="text-red-200 text-xs leading-relaxed">
              Gerencie máquinas, contratos e serviços com eficiência e precisão.
            </p>
          </div>
        </div>

        {/* Lado Direito (Formulário) */}
        <div className="md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Insira suas credenciais para acessar.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
            {/* Input E-mail */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                E-mail Corporativo
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amiste-primary focus:ring-2 focus:ring-amiste-primary/20 transition-all text-gray-700 bg-gray-50 focus:bg-white text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input Senha */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amiste-primary focus:ring-2 focus:ring-amiste-primary/20 transition-all text-gray-700 bg-gray-50 focus:bg-white text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amiste-primary hover:bg-amiste-secondary text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-100 hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 active:scale-[0.98]"
            >
              {loading ? "Autenticando..." : "Entrar no Sistema"}
              {!loading && <ArrowRight size={18} />}
            </button>

            {/* Link para Cadastro */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                Não tem acesso?{" "}
                <Link
                  to="/register"
                  className="text-amiste-primary font-bold hover:underline transition-colors"
                >
                  Solicitar conta
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Rodapé Discreto */}
      <div className="absolute bottom-4 text-center w-full text-[10px] text-gray-400 pointer-events-none">
        © {new Date().getFullYear()} Amiste Café. Todos os direitos reservados.
      </div>
    </div>
  );
}
