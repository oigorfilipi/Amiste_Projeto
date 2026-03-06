import { ImageIcon, Youtube } from "lucide-react";
import { BRAND_OPTIONS, TYPE_OPTIONS } from "./MachinesUI";

export function MachineBasicInfo(props) {
  const {
    name,
    setName,
    description,
    setDescription,
    imageMode,
    setImageMode,
    photoUrl,
    setPhotoUrl,
    handleImageUpload,
    uploading,
    videoUrl,
    setVideoUrl,
    brand,
    setBrand,
    customBrand,
    setCustomBrand,
    type,
    setType,
    customType,
    setCustomType,
    isReadOnly,
  } = props;

  return (
    <section className="space-y-4">
      <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
        <ImageIcon size={14} /> Identificação Principal
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Nome Comercial *
          </label>
          <input
            required
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Phedra Evo"
            disabled={isReadOnly}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Descrição Comercial (Padrão)
          </label>
          <textarea
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none h-24 resize-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        {/* UPLOAD / URL IMAGEM */}
        {!isReadOnly && (
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-3">
              Foto Principal (Padrão)
            </label>
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 mb-3 w-full md:w-1/2">
              <button
                type="button"
                onClick={() => setImageMode("url")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${imageMode === "url" ? "bg-amiste-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
              >
                Link
              </button>
              <button
                type="button"
                onClick={() => setImageMode("file")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${imageMode === "file" ? "bg-amiste-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
              >
                Upload
              </button>
            </div>
            <div className="flex gap-3 items-center">
              {imageMode === "url" ? (
                <input
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-amiste-primary outline-none"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                />
              ) : (
                <div className="relative w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="w-full p-2 border border-gray-200 rounded-xl text-sm bg-white file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploading && (
                    <div className="absolute right-3 top-2.5 text-xs text-blue-600 font-bold animate-pulse">
                      Enviando...
                    </div>
                  )}
                </div>
              )}
              {photoUrl && (
                <div className="w-12 h-12 bg-white border rounded-lg p-1 shrink-0">
                  <img
                    src={photoUrl}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {isReadOnly && photoUrl && (
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Foto Principal
            </label>
            <img
              src={photoUrl}
              className="h-32 object-contain bg-gray-50 border rounded-xl"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
            <Youtube size={14} /> Link de Vídeo (Padrão)
          </label>
          <input
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amiste-primary outline-none disabled:bg-gray-50 disabled:text-gray-500"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/..."
            disabled={isReadOnly}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Marca *
          </label>
          <select
            className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amiste-primary disabled:bg-gray-50 disabled:text-gray-500"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            disabled={isReadOnly}
          >
            <option value="">Selecione...</option>
            {BRAND_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
            <option value="Outro">Outro</option>
          </select>
          {brand === "Outro" && (
            <input
              className="mt-2 w-full p-2 border rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
              value={customBrand}
              onChange={(e) => setCustomBrand(e.target.value)}
              placeholder="Digite a marca"
              disabled={isReadOnly}
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Categoria *
          </label>
          <select
            className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amiste-primary disabled:bg-gray-50 disabled:text-gray-500"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={isReadOnly}
          >
            <option value="">Selecione...</option>
            {TYPE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
            <option value="Outro">Outro</option>
          </select>
          {type === "Outro" && (
            <input
              className="mt-2 w-full p-2 border rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="Digite a categoria"
              disabled={isReadOnly}
            />
          )}
        </div>
      </div>
    </section>
  );
}
