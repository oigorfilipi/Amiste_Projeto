import { useState, useEffect, useContext } from "react";
import { supabase } from "../services/supabaseClient";
import { Link, Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { ArrowLeft, Printer, Coffee, ShieldAlert } from "lucide-react";
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

  // Verificação de permissão: Se não houver permissão definida para Checklists, bloqueia
  const hasAccess = permissions?.Checklists !== undefined;

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
    }
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-500 mb-6">
            Você não tem permissão para acessar o módulo de Checklists.
          </p>
          <Link
            to="/"
            className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
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
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-6">
        {/* Header Responsivo */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/checklists"
            className="p-2 bg-white rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
              Imprimir Ficha em Branco
            </h1>
            <p className="text-gray-500 text-xs md:text-sm">
              Gere um PDF para preenchimento manual.
            </p>
          </div>
        </div>

        {/* Card de Configuração */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8">
          {/* 1. Tipo de Serviço */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Tipo de Serviço
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={() => setType("Cliente")}
                className={`p-4 rounded-xl border-2 text-center transition-all active:scale-[0.98] ${
                  type === "Cliente"
                    ? "border-amiste-primary bg-red-50 text-amiste-primary font-bold shadow-sm"
                    : "border-gray-100 hover:border-gray-200 text-gray-500 bg-gray-50/50"
                }`}
              >
                Instalação Cliente
              </button>
              <button
                onClick={() => setType("Evento")}
                className={`p-4 rounded-xl border-2 text-center transition-all active:scale-[0.98] ${
                  type === "Evento"
                    ? "border-amiste-primary bg-red-50 text-amiste-primary font-bold shadow-sm"
                    : "border-gray-100 hover:border-gray-200 text-gray-500 bg-gray-50/50"
                }`}
              >
                Evento Temporário
              </button>
            </div>
          </div>

          {/* 2. Máquina (Opcional) */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Coffee size={16} className="text-gray-400" /> Pré-definir Máquina
              (Opcional)
            </label>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Selecione se você já sabe qual equipamento vai levar. Isso
              preenche os dados técnicos automaticamente.
            </p>
            <select
              className="w-full p-3 md:p-4 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amiste-primary text-gray-700"
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
            >
              <option value="">-- Nenhuma (Imprimir Genérico) --</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.brand})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Quantidade de Unidades */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Espaço para Unidades
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Quantas linhas para número de série você precisa?
            </p>
            <input
              type="number"
              min="1"
              max="10"
              className="w-full p-3 md:p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amiste-primary"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Botão Gerar */}
          {loading ? (
            <div className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-xl text-center">
              Carregando dados...
            </div>
          ) : (
            <PDFDownloadLink
              document={
                <BlankChecklistPDF
                  type={type}
                  machineData={selectedMachineData}
                  quantity={quantity}
                />
              }
              fileName={`checklist_manual_${type.toLowerCase()}.pdf`}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all hover:-translate-y-1 active:scale-[0.98]"
            >
              {({ loading: pdfLoading }) =>
                pdfLoading ? (
                  "Gerando PDF..."
                ) : (
                  <>
                    <Printer size={20} /> Baixar PDF para Impressão
                  </>
                )
              }
            </PDFDownloadLink>
          )}
        </div>
      </div>
    </div>
  );
}
