import { RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import cuteNinja from "./assets/hinata-cute.jpeg"; // Altere se o caminho da imagem for diferente

const options = [
  { name: "Vídeo único", value: "video" },
  { name: "Playlist completa", value: "playlist" },
];

function App() {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("video");
  const [folderName, setFolderName] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL;
  const isLocalhost =
    apiUrl !== "https://ytb-mp3-downloader-production-c686.up.railway.app/";

  useEffect(() => {
    document.title = "🎵 Baixar MP3";
  }, []);

  const isValidLink = useMemo(() => {
    const isWatch = url.includes("watch");
    const isPlaylist = url.includes("playlist");
    if (!url) return false;
    return (type === "video" && isWatch) || (type === "playlist" && isPlaylist);
  }, [url, type]);

  useEffect(() => {
    const fetchTitle = async () => {
      const isWatch = url.includes("watch");
      const isPlaylist = url.includes("playlist");
      const isValid =
        (type === "video" && isWatch) || (type === "playlist" && isPlaylist);
      if (!url || !isValid) {
        setTitle("");
        return;
      }
      setValidating(true);
      try {
        const res = await fetch(`${apiUrl}youtube/info`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (typeof data?.title === "string" && data.title.includes("\n")) {
          setTitle(data.title.split("\n").filter(Boolean));
        } else {
          setTitle(data?.title || "");
        }
      } catch {
        setTitle("");
      } finally {
        setValidating(false);
      }
    };
    fetchTitle();
  }, [url, type, apiUrl]);

  const handleDownload = async () => {
    if (!url) {
      setErrorMsg("Por favor, insira uma URL.");
      return;
    }
    if (!isValidLink) {
      setErrorMsg(
        type === "video"
          ? "A URL deve ser de um vídeo do YouTube (ex: watch?v=...)."
          : "A URL deve ser de uma playlist do YouTube (ex: playlist?list=...)."
      );
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`${apiUrl}youtube/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type, folderName }),
      });
      if (!res.ok) throw new Error("Erro na resposta");
      if (type === "video") {
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = `${title || "musica"}.mp3`;
        a.click();
        setSuccessMsg("✅ Download concluído!");
      } else {
        if (isLocalhost) {
          const data = await res.json();
          setSuccessMsg(`✅ Playlist salva em: ${data.path}`);
        } else {
          const blob = await res.blob();
          const a = document.createElement("a");
          a.href = window.URL.createObjectURL(blob);
          a.download = `${folderName || "playlist"}.zip`;
          a.click();
          setSuccessMsg("✅ Playlist ZIP baixada com sucesso!");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("❌ Erro ao processar o download.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0a1f] px-4 flex items-center justify-center">
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <img
          src={cuteNinja}
          alt="Avatar fofo"
          className="w-20 h-20 rounded-full shadow-lg border-4 border-[#a855f7]"
        />
        <h1 className="text-4xl sm:text-5xl font-bold text-[#a855f7] drop-shadow-lg">
          Naty Music
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mt-12 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-[#1f1b30] text-white p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 border border-purple-700/20"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#a855f7] flex items-center justify-center gap-2">
          <span className="text-3xl">🎵</span> Baixar MP3
        </h2>

        <div className="space-y-2">
          <label className="text-sm">URL do vídeo ou playlist</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/..."
            className="w-full rounded-lg px-4 py-3 text-sm bg-[#2c2543] border border-[#4f3d8a] focus:ring-2 focus:ring-[#9b4dff] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <RadioGroup value={type} onChange={setType}>
            <RadioGroup.Label className="text-sm">
              Tipo de download
            </RadioGroup.Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {options.map((option) => (
                <RadioGroup.Option
                  key={option.value}
                  value={option.value}
                  className={({ checked }) =>
                    clsx(
                      "text-sm font-medium px-4 py-2 rounded-lg text-center border cursor-pointer transition",
                      checked
                        ? "bg-[#9b4dff] text-white border-[#a855f7]"
                        : "bg-[#2c2543] text-gray-300 border-[#4f3d8a]"
                    )
                  }
                >
                  {option.name}
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>
        </div>

        {type === "playlist" && (
          <div className="space-y-2">
            <label className="text-sm">Nome da pasta (opcional)</label>
            <input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Ex: minhas-musicas"
              className="w-full rounded-lg px-4 py-3 text-sm bg-[#2c2543] border border-[#4f3d8a] focus:ring-2 focus:ring-[#9b4dff] focus:outline-none"
            />
          </div>
        )}

        {validating && (
          <div className="text-sm text-purple-400 flex items-center gap-1 animate-pulse">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Validando link...
          </div>
        )}

        {typeof title === "string" && title && type === "video" && (
          <div className="text-sm text-purple-300 flex items-center gap-1">
            🎧 <span>Título detectado:</span> <strong>{title}</strong>
          </div>
        )}

        {Array.isArray(title) && title.length > 0 && type === "playlist" && (
          <div className="text-sm text-purple-300">
            🎧 <span className="font-semibold">Títulos detectados:</span>
            <ul className="mt-2 max-h-48 overflow-y-auto pr-2 space-y-1 list-disc list-inside pl-1 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent">
              {title.map((track, index) => (
                <li key={index} className="ml-4 text-purple-200">
                  {track}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Botão de download */}
        <button
          onClick={handleDownload}
          disabled={loading || validating || !url || !isValidLink}
          className={clsx(
            "w-full font-semibold py-3 px-4 rounded-lg transition flex justify-center items-center gap-2",
            loading || validating || !url || !isValidLink
              ? "bg-[#a855f7] opacity-50 cursor-not-allowed"
              : "bg-[#a855f7] hover:bg-[#9333ea] cursor-pointer text-white"
          )}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Baixando...
            </>
          ) : (
            "Iniciar download"
          )}
        </button>

        {/* Mensagem de erro dinâmica */}
        {/* Mensagens de erro de input inválido */}
        {!loading && !validating && (
          <>
            {!url && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-yellow-400 font-medium flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 flex-shrink-0 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 8a1 1 0 012 0v4a1 1 0 01-2 0V8zm1 6a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z"
                    clipRule="evenodd"
                  />
                </svg>
                Por favor, insira uma URL.
              </motion.div>
            )}

            {url && !isValidLink && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 font-medium flex items-center gap-2"
              >
                {type === "video"
                  ? "❌ A URL deve ser de um vídeo do YouTube (ex: watch?v=...)."
                  : "❌ A URL deve ser de uma playlist do YouTube (ex: playlist?list=...)."}
              </motion.div>
            )}
          </>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-green-400 font-medium flex items-center gap-2"
          >
            {successMsg}
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400 font-medium flex items-center gap-2"
          >
            {errorMsg}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default App;
