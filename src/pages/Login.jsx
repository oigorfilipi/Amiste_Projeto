import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  User,
  Lock,
  ArrowRight,
  Coffee,
  ShieldAlert,
  Loader2,
} from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const { signIn } = useContext(AuthContext);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setIsBlocked(false);

    try {
      await signIn(email, password);
      toast.success("Login realizado com sucesso!", { duration: 3000 });
    } catch (err) {
      console.error("Erro no login:", err);

      if (err.message === "CONTA_DESLIGADA") {
        setIsBlocked(true);
      } else {
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
      }
      setLoading(false);
    }
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-red-600">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">
            Acesso Revogado
          </h1>
          <p className="text-gray-600 mb-8 font-medium">
            Você não tem mais acesso pois foi desligado da empresa.
          </p>
          <button
            onClick={() => setIsBlocked(false)}
            className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 md:p-8 font-sans relative">
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[500px] z-10 animate-fade-in">
        {/* Lado Esquerdo (Branding) */}
        <div className="bg-amiste-primary md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/20 to-transparent z-0"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-red-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <Coffee size={28} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 uppercase">
              Amiste
            </h1>
            <p className="text-red-100 text-xs md:text-sm font-medium tracking-wide border-l-2 border-red-300/50 pl-3">
              Sistema de Gestão Integrado
            </p>
          </div>

          <div className="relative z-10 mt-8 md:mt-0 hidden md:block">
            <p className="text-red-100 text-sm leading-relaxed opacity-90">
              Gerencie máquinas, contratos e serviços com eficiência, velocidade
              e precisão.
            </p>
          </div>
        </div>

        {/* Lado Direito (Formulário) */}
        <div className="md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Insira suas credenciais para acessar a plataforma.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                  E-mail Corporativo
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-amiste-primary transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    className="w-full pl-11 p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amiste-primary focus:ring-4 focus:ring-amiste-primary/10 transition-all text-gray-700 bg-gray-50 focus:bg-white text-sm font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                  Senha
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-amiste-primary transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-11 p-3.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amiste-primary focus:ring-4 focus:ring-amiste-primary/10 transition-all text-gray-700 bg-gray-50 focus:bg-white text-sm font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amiste-primary hover:bg-amiste-secondary text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Autenticando...
                </>
              ) : (
                <>
                  Entrar no Sistema <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                Não tem acesso?{" "}
                <Link
                  to="/register"
                  className="text-amiste-primary font-bold hover:text-amiste-secondary transition-colors"
                >
                  Solicitar conta
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="absolute bottom-6 text-center w-full text-xs text-gray-400 font-medium pointer-events-none">
        © {new Date().getFullYear()} Amiste Café. Todos os direitos reservados.
      </div>
    </div>
  );
}
