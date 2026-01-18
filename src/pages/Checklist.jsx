import { useState } from "react";
import { ArrowRight, ArrowLeft, Save, FileText } from "lucide-react";

export function Checklist() {
  // Controle do Passo Atual (Começa no 1)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;

  // --- ESTADOS DO PASSO 1 (DADOS BÁSICOS) ---
  const [installType, setInstallType] = useState("Cliente"); // Cliente ou Evento

  // Cliente
  const [clientName, setClientName] = useState("");
  const [installDate, setInstallDate] = useState("");

  // Evento
  const [eventName, setEventName] = useState("");
  const [eventDays, setEventDays] = useState("");
  const [pickupDate, setPickupDate] = useState(""); // Data Retirada

  // Função para Avançar Passo
  function nextStep() {
    // Validação Simples do Passo 1
    if (currentStep === 1) {
      if (installType === "Cliente" && (!clientName || !installDate)) {
        return alert("Preencha o Nome e a Data!");
      }
      if (
        installType === "Evento" &&
        (!eventName || !eventDays || !installDate || !pickupDate)
      ) {
        return alert("Preencha todos os dados do Evento!");
      }
    }

    // Se validou, avança
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0); // Sobe a tela
    }
  }

  // Função para Voltar Passo
  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  }

  return (
    <div className="min-h-screen pb-20">
      {/* CABEÇALHO */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-800">
          Novo Checklist
        </h1>
        <p className="text-gray-500">
          Preencha os dados passo a passo para gerar a ordem de instalação.
        </p>
      </div>

      {/* BARRA DE PROGRESSO (WIZARD) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-amiste-primary">
            Passo {currentStep} de {totalSteps}
          </span>
          <span className="text-xs text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% Concluído
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-amiste-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* ÁREA DO FORMULÁRIO (Muda de acordo com o passo) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
        {/* --- PASSO 1: DADOS BÁSICOS --- */}
        {currentStep === 1 && (
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="bg-amiste-primary text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">
                1
              </span>
              Dados Básicos
            </h2>

            <div className="space-y-6 max-w-2xl">
              {/* Tipo de Instalação */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tipo de Instalação *
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex-1 border p-4 rounded-xl cursor-pointer transition-all ${installType === "Cliente" ? "border-amiste-primary bg-red-50 text-amiste-primary font-bold" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value="Cliente"
                        checked={installType === "Cliente"}
                        onChange={(e) => setInstallType(e.target.value)}
                        className="accent-amiste-primary"
                      />
                      Cliente Padrão
                    </div>
                  </label>
                  <label
                    className={`flex-1 border p-4 rounded-xl cursor-pointer transition-all ${installType === "Evento" ? "border-amiste-primary bg-red-50 text-amiste-primary font-bold" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value="Evento"
                        checked={installType === "Evento"}
                        onChange={(e) => setInstallType(e.target.value)}
                        className="accent-amiste-primary"
                      />
                      Evento Temporário
                    </div>
                  </label>
                </div>
              </div>

              {/* Formulário Condicional: CLIENTE */}
              {installType === "Cliente" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amiste-primary"
                      placeholder="Ex: Escritório Advocacia Silva"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data da Instalação *
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amiste-primary"
                      value={installDate}
                      onChange={(e) => setInstallDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Formulário Condicional: EVENTO */}
              {installType === "Evento" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Evento *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amiste-primary"
                      placeholder="Ex: Feira de Negócios 2026"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qtd. Dias *
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amiste-primary"
                      placeholder="Ex: 3"
                      value={eventDays}
                      onChange={(e) => setEventDays(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Instalação *
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amiste-primary"
                      value={installDate}
                      onChange={(e) => setInstallDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Retirada *
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-amiste-primary"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- AQUI VIRÃO OS OUTROS PASSOS (2, 3, 4...) --- */}
        {currentStep === 2 && (
          <div className="p-10 text-center text-gray-500">
            <h2 className="text-xl font-bold mb-4">
              Passo 2: Dados da Máquina
            </h2>
            <p>Em construção...</p>
          </div>
        )}

        {/* BARRA DE NAVEGAÇÃO (BOTÕES) */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center">
          {/* Botão Voltar */}
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${currentStep === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
          >
            <ArrowLeft size={20} />
            Voltar
          </button>

          {/* Lado Direito: Salvar Rascunho ou Avançar */}
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 text-amiste-primary font-bold hover:bg-red-50 rounded-lg transition-colors">
              <Save size={20} />
              <span className="hidden md:inline">Salvar Rascunho</span>
            </button>

            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-amiste-primary hover:bg-amiste-secondary text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
            >
              {currentStep === totalSteps ? "Finalizar" : "Próximo"}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
