import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { Link } from "react-router-dom";
import toast from "react-hot-toast"; // <--- Import do Toast
import { ArrowLeft, Printer, Coffee } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { BlankChecklistPDF } from "../components/BlankChecklistPDF";

export function PrintBlankChecklist() {
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState([]);

  // Configurações do Formulário
  const [type, setType] = useState("Cliente");
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [quantity, setQuantity] = useState(1);

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
    fetchMachines();
  }, []);

  const selectedMachineData = machines.find(
    (m) => m.id.toString() === selectedMachineId,
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/checklists"
            className="p-2 bg-white rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Imprimir Ficha em Branco
            </h1>
            <p className="text-gray-500 text-sm">
              Gere um PDF para preenchimento manual.
            </p>
          </div>
        </div>

        {/* Card de Configuração */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* 1. Tipo de Serviço */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Tipo de Serviço
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setType("Cliente")}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  type === "Cliente"
                    ? "border-amiste-primary bg-red-50 text-amiste-primary font-bold"
                    : "border-gray-100 hover:border-gray-200 text-gray-500"
                }`}
              >
                Instalação Cliente
              </button>
              <button
                onClick={() => setType("Evento")}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  type === "Evento"
                    ? "border-amiste-primary bg-red-50 text-amiste-primary font-bold"
                    : "border-gray-100 hover:border-gray-200 text-gray-500"
                }`}
              >
                Evento Temporário
              </button>
            </div>
          </div>

          {/* 2. Máquina (Opcional) */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Coffee size={16} /> Pré-definir Máquina (Opcional)
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Selecione se você já sabe qual equipamento vai levar. Isso
              preenche os dados técnicos automaticamente.
            </p>
            <select
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-amiste-primary"
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
            <p className="text-xs text-gray-400 mb-2">
              Quantas linhas para número de série você precisa?
            </p>
            <input
              type="number"
              min="1"
              max="10"
              className="w-full p-3 border border-gray-200 rounded-xl outline-none"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>

          {/* Botão Gerar */}
          <PDFDownloadLink
            document={
              <BlankChecklistPDF
                type={type}
                machineData={selectedMachineData}
                quantity={quantity}
              />
            }
            fileName={`checklist_manual_${type.toLowerCase()}.pdf`}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all hover:-translate-y-1"
          >
            {({ loading }) =>
              loading ? (
                "Gerando PDF..."
              ) : (
                <>
                  <Printer size={20} /> Baixar PDF para Impressão
                </>
              )
            }
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
}
