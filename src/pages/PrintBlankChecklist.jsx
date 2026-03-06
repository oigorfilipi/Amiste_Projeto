import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Printer,
  Coffee,
  ShieldAlert,
  Loader2,
  FileText,
  Settings2,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { BlankChecklistPDF } from "../components/BlankChecklistPDF";

export function PrintBlankChecklist() {
  const { permissions } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState([]);

  // Configurações do Formulário
  const [type, setType] = useState("Cliente");
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Verificação de permissão corrigida (Checklist no singular, conforme AuthContext)
  const hasAccess =
    permissions?.Checklist !== "Nothing" &&
    permissions?.Checklist !== "Ghost" &&
    permissions?.Checklist !== undefined;

  useEffect(() => {
    async function fetchMachines() {
      try {
        const { data, error } = await supabase
          .from("machines")
          .select("*")
          .order("name");

        if (error) throw error;
        if (data) setMachines(data);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar lista de máquinas.");
      } finally {
        setLoading(false);
      }
    }

    if (hasAccess) {
      fetchMachines();
    } else {
      setLoading(false);
    }
  }, [hasAccess]);

  if (!hasAccess && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 animate-fade-in">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-500 mb-8 font-medium">
            Você não tem permissão para acessar o módulo de Checklists.
          </p>
          <Link
            to="/"
            className="flex items-center justify-center w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold transition-all hover:-translate-y-1 shadow-lg"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const selectedMachineData = machines.find(
    (m) => m.id.toString() === selectedMachineId,
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-6 md:pt-10">
        {/* Header Responsivo */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/checklists"
            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-amiste-primary transition-colors"
            title="Voltar"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight flex items-center gap-2">
              <FileText size={24} className="text-amiste-primary" /> Ficha em
              Branco
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1">
              Gere um PDF para preenchimento manual em campo.
            </p>
          </div>
        </div>

        {/* Card de Configuração */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {loading ? (
            // Skeleton do Formulário
            <div className="p-6 md:p-10 space-y-8 animate-pulse">
              <div>
                <div className="h-4 bg-gray-200 w-1/3 rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-gray-100 rounded-2xl"></div>
                  <div className="h-16 bg-gray-100 rounded-2xl"></div>
                </div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 w-1/2 rounded mb-2"></div>
                <div className="h-3 bg-gray-100 w-2/3 rounded mb-4"></div>
                <div className="h-14 bg-gray-50 rounded-xl"></div>
              </div>
              <div>
                <div className="h-14 bg-gray-200 rounded-xl mt-6"></div>
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-10">
              {/* 1. Tipo de Serviço */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  1. Tipo de Serviço
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <button
                    onClick={() => setType("Cliente")}
                    className={`p-4 rounded-2xl border-2 text-center transition-all active:scale-[0.98] ${
                      type === "Cliente"
                        ? "border-amiste-primary bg-red-50 text-amiste-primary font-bold shadow-sm"
                        : "border-gray-100 hover:border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100 font-medium"
                    }`}
                  >
                    Instalação Cliente
                  </button>
                  <button
                    onClick={() => setType("Evento")}
                    className={`p-4 rounded-2xl border-2 text-center transition-all active:scale-[0.98] ${
                      type === "Evento"
                        ? "border-amiste-primary bg-red-50 text-amiste-primary font-bold shadow-sm"
                        : "border-gray-100 hover:border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100 font-medium"
                    }`}
                  >
                    Evento Temporário
                  </button>
                </div>
              </div>

              {/* 2. Máquina (Opcional) */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Settings2 size={14} className="text-gray-400" /> 2.
                  Pré-definir Máquina (Opcional)
                </label>
                <p className="text-sm text-gray-500 mb-4 font-medium leading-relaxed">
                  Selecione se você já sabe qual equipamento vai levar. Isso
                  preenche os dados técnicos automaticamente no papel.
                </p>
                <div className="relative group">
                  <Coffee
                    className="absolute left-4 top-4 text-gray-400 group-focus-within:text-amiste-primary transition-colors"
                    size={18}
                  />
                  <select
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-amiste-primary focus:border-amiste-primary text-gray-700 text-sm font-medium transition-all appearance-none"
                    value={selectedMachineId}
                    onChange={(e) => setSelectedMachineId(e.target.value)}
                  >
                    <option value="">
                      -- Nenhuma (Ficha 100% em branco) --
                    </option>
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.brand})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Quantidade de Unidades */}
              <div className="mb-10">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  3. Espaço para Unidades
                </label>
                <p className="text-sm text-gray-500 mb-4 font-medium leading-relaxed">
                  Quantas linhas para números de série e patrimônio você precisa
                  no documento?
                </p>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="w-full p-3.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-amiste-primary focus:border-amiste-primary text-center font-black text-xl text-gray-800 transition-all"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              {/* Botão Gerar PDF */}
              <div className="pt-6 border-t border-gray-100">
                <PDFDownloadLink
                  document={
                    <BlankChecklistPDF
                      type={type}
                      machineData={selectedMachineData}
                      quantity={quantity}
                    />
                  }
                  fileName={`checklist_manual_${type.toLowerCase()}.pdf`}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:scale-[0.98] group"
                >
                  {({ loading: pdfLoading }) =>
                    pdfLoading ? (
                      <>
                        <Loader2
                          size={22}
                          className="animate-spin text-gray-400"
                        />
                        <span className="font-bold">
                          Preparando Documento...
                        </span>
                      </>
                    ) : (
                      <>
                        <Printer
                          size={22}
                          className="group-hover:scale-110 transition-transform"
                        />
                        <span className="font-bold">
                          Baixar PDF para Impressão
                        </span>
                      </>
                    )
                  }
                </PDFDownloadLink>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
