import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Campos do Formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [cpf, setCpf] = useState("");
  const [gender, setGender] = useState("");
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
    if (!isHuman) return alert("Por favor, confirme que você não é um robô.");
    if (cpf.length < 14) return alert("CPF inválido.");
    if (birthDate.length < 10) return alert("Data de nascimento inválida.");

    setLoading(true);

    try {
      let finalNickname = nickname;
      if (!finalNickname.trim() && fullName.trim()) {
        const parts = fullName.trim().split(" ");
        finalNickname = parts.slice(0, 2).join(" ");
      }

      const [d, m, y] = birthDate.split("/");
      const isoDate = `${y}-${m}-${d}`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: fullName,
          nickname: finalNickname,
          cpf: cpf,
          gender: gender || "Prefiro não informar",
          birth_date: isoDate,
          role: role,
        });

        if (profileError) throw profileError;

        alert("Cadastro realizado com sucesso!");
        navigate("/");
      }
    } catch (error) {
      alert("Erro ao cadastrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">
        {/* Lado Esquerdo (Visual/Info) */}
        <div className="bg-amiste-primary md:w-1/3 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-black/10 z-0"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-6">
              <Briefcase size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Junte-se ao Time
            </h1>
            <p className="text-red-100 text-sm leading-relaxed">
              Crie sua conta para acessar o ecossistema Amiste de gestão e
              serviços.
            </p>
          </div>

          <div className="relative z-10 mt-12 md:mt-0">
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
        <div className="md:w-2/3 p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Cadastro de Colaborador
            </h2>
            <p className="text-gray-500 text-sm">
              Preencha os dados abaixo para solicitar seu acesso.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
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
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
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
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
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
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
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
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-amiste-primary outline-none transition-all appearance-none"
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
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
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
                      className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all"
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
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isHuman ? "bg-green-50 border-green-200 shadow-inner" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}
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
                <span className="text-xs font-bold text-green-600 uppercase tracking-wide">
                  Verificado
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link
                to="/"
                className="text-sm font-bold text-gray-400 hover:text-amiste-primary transition-colors"
              >
                Já tenho conta
              </Link>
              <button
                disabled={loading}
                type="submit"
                className="bg-amiste-primary hover:bg-amiste-secondary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-red-100 flex items-center gap-2 transition-all disabled:opacity-70 hover:-translate-y-1"
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
