import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Calendar,
  Fingerprint,
  Users,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Campos do Formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [role, setRole] = useState("Comercial");
  const [isHuman, setIsHuman] = useState(false);

  // --- MÁSCARAS ---
  const handleCpfChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(v);
  };

  const handleDateChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    v = v.replace(/(\d{2})(\d)/, "$1/$2");
    v = v.replace(/(\d{2})(\d)/, "$1/$2");
    setBirthDate(v);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isHuman)
      return toast.error("Por favor, confirme que você não é um robô.");
    if (cpf.length < 14) return toast.error("CPF inválido.");
    if (birthDate.length < 10)
      return toast.error("Data de nascimento inválida.");
    if (password.length < 6)
      return toast.error("A senha deve ter no mínimo 6 caracteres.");

    setLoading(true);

    try {
      let finalNickname = nickname;
      if (!finalNickname.trim() && fullName.trim()) {
        const parts = fullName.trim().split(" ");
        finalNickname = parts.slice(0, 2).join(" ");
      }

      const [d, m, y] = birthDate.split("/");
      const isoDate = `${y}-${m}-${d}`;

      // 1. Cria usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Cria perfil na tabela profiles
      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: fullName,
          nickname: finalNickname,
          cpf: cpf,
          birth_date: isoDate,
          role: role,
        });

        if (profileError) {
          console.error("Erro ao criar perfil:", profileError);
          throw new Error(
            "Usuário criado, mas erro ao salvar perfil. Contate o suporte.",
          );
        }

        toast.success("Cadastro realizado com sucesso!");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      let msg = error.message;
      if (msg.includes("already registered")) msg = "E-mail já está em uso.";
      if (msg.includes("weak password")) msg = "A senha é muito fraca.";

      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
        {/* Lado Esquerdo (Visual/Info) */}
        <div className="bg-amiste-primary md:w-1/3 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/10 z-0"></div>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-6">
              <Briefcase size={24} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
              Junte-se ao Time
            </h1>
            <p className="text-red-100 text-xs md:text-sm leading-relaxed">
              Crie sua conta para acessar o ecossistema Amiste.
            </p>
          </div>

          {/* Escondido no mobile para economizar espaço vertical */}
          <div className="relative z-10 mt-12 md:mt-0 hidden md:block">
            <p className="text-xs font-bold text-red-200 uppercase tracking-widest mb-4">
              Acesso Seguro
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm opacity-80">
                <ShieldCheck size={16} /> Dados Criptografados
              </div>
              <div className="flex items-center gap-3 text-sm opacity-80">
                <Users size={16} /> Gestão de Perfis
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito (Formulário) */}
        <div className="md:w-2/3 p-6 md:p-12 bg-white">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Cadastro de Colaborador
            </h2>
            <p className="text-gray-500 text-sm">
              Preencha os dados abaixo para solicitar seu acesso.
            </p>
          </div>

          {/* Mensagem de Erro Geral */}
          {errorMsg && (
            <div className="mb-6 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium border border-red-100 animate-pulse">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6 md:space-y-8">
            {/* SEÇÃO 1: PESSOAL */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">
                Informações Pessoais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <input
                      required
                      type="text"
                      name="fullName"
                      autoComplete="name"
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all text-sm"
                      placeholder="Nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                    CPF
                  </label>
                  <div className="relative">
                    <Fingerprint
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <input
                      required
                      type="text"
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all text-sm"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={handleCpfChange}
                      maxLength={14}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                    Nascimento
                  </label>
                  <div className="relative">
                    <Calendar
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <input
                      required
                      type="text"
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all text-sm"
                      placeholder="DD/MM/AAAA"
                      value={birthDate}
                      onChange={handleDateChange}
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: ACESSO */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">
                Dados de Acesso
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                    Função / Cargo
                  </label>
                  <div className="relative">
                    <Users
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <select
                      required
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-amiste-primary outline-none transition-all appearance-none text-sm"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="Comercial">Comercial</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Técnico">Técnico</option>
                      <option value="ADM">Administrativo</option>
                      <option value="DEV">DEV (System Admin)</option>
                      <option value="Dono">Dono</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all text-sm"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />
                    <input
                      required
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all text-sm"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* VERIFICAÇÃO */}
            <div
              onClick={() => setIsHuman(!isHuman)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.98] ${isHuman ? "bg-green-50 border-green-200 shadow-inner" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isHuman ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-300"}`}
                >
                  {isHuman && <ShieldCheck size={16} />}
                </div>
                <span
                  className={`text-sm font-bold ${isHuman ? "text-green-700" : "text-gray-600"}`}
                >
                  Confirmo que sou um humano
                </span>
              </div>
              {isHuman && (
                <span className="text-xs font-bold text-green-600 uppercase tracking-wide hidden sm:block">
                  Verificado
                </span>
              )}
            </div>

            <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 pt-2">
              <Link
                to="/"
                className="text-sm font-bold text-gray-400 hover:text-amiste-primary transition-colors py-2"
              >
                Já tenho conta
              </Link>
              <button
                disabled={loading}
                type="submit"
                className="w-full md:w-auto bg-amiste-primary hover:bg-amiste-secondary text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-red-100 flex items-center justify-center gap-2 transition-all disabled:opacity-70 hover:-translate-y-1"
              >
                {loading ? "Processando..." : "Finalizar Cadastro"}{" "}
                <ArrowRight size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
