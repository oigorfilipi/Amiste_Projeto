import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { User, Lock } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useContext(AuthContext);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      // Se der certo, o AuthContext redireciona automático no App.jsx
    } catch (err) {
      console.log(err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("E-mail ou palavra-passe incorretos.");
      } else {
        setError("Erro ao entrar. Tente novamente.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-amiste-primary p-8 text-center">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            AMISTE
          </h1>
          <p className="text-red-100 text-sm">Sistema de Gestão Integrado</p>
        </div>

        {/* Formulário */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Bem-vindo de volta
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input E-mail */}
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="O seu e-mail"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amiste-primary focus:ring-1 focus:ring-amiste-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Input Senha */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="A sua palavra-passe"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amiste-primary focus:ring-1 focus:ring-amiste-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amiste-primary hover:bg-amiste-secondary text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? "A entrar..." : "Entrar no Sistema"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
