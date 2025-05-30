import { RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const options = [
  { name: "Vídeo único", value: "video" },
  { name: "Playlist completa", value: "playlist" },
];

function App() {
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"video" | "playlist">("video");
  const [folderName, setFolderName] = useState("");
  const [title, setTitle] = useState<string | string[]>("");

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Validação de link com base no tipo selecionado.
  const isValidLink = useMemo(() => {
    const isWatch = url.includes("watch");
    const isPlaylist = url.includes("playlist");

    if (!url) return false;

    if (type === "video" && isWatch) return true;
    if (type === "playlist" && isPlaylist) return true;

    return false;
  }, [url, type]);

  useEffect(() => {
    const fetchTitle = async () => {
      const isWatch = url.includes("watch");
      const isPlaylist = url.includes("playlist");
      const isValidLink =
        (type === "video" && isWatch) || (type === "playlist" && isPlaylist);

      if (!url || !isValidLink) {
        setTitle("");
        return;
      }

      setValidating(true);
      try {
        const res = await fetch("http://localhost:3000/youtube/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();

        if (typeof data?.title === "string" && data.title.includes("\n")) {
          const titles = data.title.split("\n").filter(Boolean);
          setTitle(titles);
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
  }, [url, type]);

  const handleDownload = async () => {
    if (!url) {
      setErrorMsg("Informe uma URL válida");
      return;
    }

    if (!isValidLink) {
      setErrorMsg(
        "URL inválida para o tipo selecionado. Verifique se o link é de vídeo único ou playlist."
      );
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("http://localhost:3000/youtube/download", {
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
        const data = await res.json();
        setSuccessMsg(`✅ Playlist salva na pasta: ${data.path}`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("❌ Erro ao processar o download.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!url) {
      setErrorMsg("");
      return;
    }

    const isWatch = url.includes("watch");
    const isPlaylist = url.includes("playlist");

    if (type === "video" && !isWatch) {
      setErrorMsg("URL inválida para vídeo único. Deve conter 'watch'.");
    } else if (type === "playlist" && !isPlaylist) {
      setErrorMsg("URL inválida para playlist. Deve conter 'playlist'.");
    } else {
      setErrorMsg("");
    }
  }, [url, type]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141022] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-[#1f1b30] text-white p-8 rounded-xl shadow-2xl space-y-6"
      >
        <h1 className="text-3xl font-bold text-center text-[#a855f7] flex items-center justify-center gap-2">
          🎵 Baixar do YouTube
        </h1>

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
            <ul className="mt-2 space-y-1 list-disc list-inside pl-1">
              {title.map((track, index) => (
                <li key={index} className="ml-4 text-purple-200">
                  {track}
                </li>
              ))}
            </ul>
          </div>
        )}

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
