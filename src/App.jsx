import { db } from "./services/firebaseConnection";

export default function App() {
  console.log("Conectado ao Firebase:", db);
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-amiste-primary mb-4">
          Sistema Amiste
        </h1>
        <p className="text-lg text-gray-600 font-sans">
          Configuração inicial concluída com sucesso!
        </p>
        <button className="mt-6 px-6 py-2 bg-amiste-primary text-white rounded-lg hover:bg-amiste-secondary transition-colors">
          Botão de Teste
        </button>
      </div>
    </div>
  );
}
