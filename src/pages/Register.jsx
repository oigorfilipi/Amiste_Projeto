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
} from "lucide-react";

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Campos do Formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState(""); // Opcional
  const [cpf, setCpf] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Mudei o padrão para Comercial
  const [role, setRole] = useState("Comercial");

  // Verificação Robô
  const [isHuman, setIsHuman] = useState(false);

  // --- MÁSCARAS ---
  const handleCpfChange = (e) => {
    let v = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
    if (v.length > 11) v = v.slice(0, 11);

    // Formata +++.+++.+++-++
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(v);
  };

  const handleDateChange = (e) => {
    // Formata ++/++/++++ visualmente, mas salva string
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
      // 1. Lógica do Apelido (Se vazio, pega os 2 primeiros nomes)
      let finalNickname = nickname;
      if (!finalNickname.trim() && fullName.trim()) {
        const parts = fullName.trim().split(" ");
        finalNickname = parts.slice(0, 2).join(" ");
      }

      // 2. Converte data PT-BR (dd/mm/aaaa) para ISO (aaaa-mm-dd) pro Banco
      const [d, m, y] = birthDate.split("/");
      const isoDate = `${y}-${m}-${d}`;

      // 3. Criar Usuário no Auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 4. Criar Perfil na tabela 'profiles'
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
        navigate("/"); // Vai pro login
      }
    } catch (error) {
      alert("Erro ao cadastrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-amiste-primary">
            Cadastro de Colaborador
          </h1>
          <p className="text-gray-500">
            Preencha os dados para acesso ao sistema.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* --- INFORMAÇÕES PESSOAIS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  required
                  type="text"
                  className="w-full pl-10 p-2.5 border rounded-lg focus:ring-amiste-primary"
                  placeholder="Nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Apelido (Opcional)
              </label>
              <input
                type="text"
                className="w-full p-2.5 border rounded-lg"
                placeholder="Como quer ser chamado?"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Se vazio, usaremos os 2 primeiros nomes.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                CPF *
              </label>
              <div className="relative">
                <Fingerprint
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  required
                  type="text"
                  className="w-full pl-10 p-2.5 border rounded-lg"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Data Nascimento *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  required
                  type="text"
                  className="w-full pl-10 p-2.5 border rounded-lg"
                  placeholder="DD/MM/AAAA"
                  value={birthDate}
                  onChange={handleDateChange}
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Gênero
              </label>
              <select
                className="w-full p-2.5 border rounded-lg bg-white"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">
                  Prefiro não informar
                </option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* --- DADOS DE ACESSO --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Cargo (Função) *
              </label>
              <div className="relative">
                <Users
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <select
                  required
                  className="w-full pl-10 p-2.5 border rounded-lg bg-white"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Comercial">Comercial / Vendas</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="ADM">ADM (Acesso Total)</option>
                  <option value="Dono">Dono</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                E-mail *
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  required
                  type="email"
                  className="w-full pl-10 p-2.5 border rounded-lg"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Senha *
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  required
                  type="password"
                  className="w-full pl-10 p-2.5 border rounded-lg"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* --- NÃO SOU ROBÔ --- */}
          <div className="bg-gray-50 p-4 rounded-lg border flex items-center gap-3">
            <input
              type="checkbox"
              id="robot"
              className="w-6 h-6 accent-amiste-primary cursor-pointer"
              checked={isHuman}
              onChange={(e) => setIsHuman(e.target.checked)}
            />
            <label
              htmlFor="robot"
              className="font-bold text-gray-700 cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck size={20} className="text-green-600" />
              Não sou um robô
            </label>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-amiste-primary text-white font-bold py-3 rounded-lg hover:bg-amiste-secondary transition-colors shadow-lg disabled:opacity-70"
          >
            {loading ? "Criando conta..." : "Cadastrar Colaborador"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Já tem conta?{" "}
            <Link
              to="/"
              className="text-amiste-primary font-bold hover:underline"
            >
              Fazer Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
