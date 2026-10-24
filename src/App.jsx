// src/App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserPlus, Sparkles, ArrowLeft } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { Feed } from "./pages/Feed";
import { SearchPage } from "./pages/SearchPage";
import { GossipDetail } from "./pages/GossipDetail";
import { Profile } from "./pages/Profile";

export default function App() {
  const [perfilAtivo, setPerfilAtivo] = useState(() => {
    const dados = localStorage.getItem("curiousHat_profile");
    return dados ? JSON.parse(dados) : null;
  });

  // Controla se a pessoa já clicou no botão "Criar Perfil" na tela inicial
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  function handleLogout() {
    localStorage.removeItem("curiousHat_profile");
    setPerfilAtivo(null);
    setMostrarCadastro(false);
  }

  return (
    <BrowserRouter>
      {/* 1. TELA DE ABERTURA (PRIMEIRA VEZ NO SITE) */}
      {!perfilAtivo && !mostrarCadastro ? (
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row items-center justify-center p-6 md:p-16 relative overflow-hidden">
          {/* Brilho roxo suave de fundo */}
          <div
            className="absolute -top-32 -left-32 w-96 h-96 bg-purple-800/20 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-800/15 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10">
            {/* LADO ESQUERDO: CHAPÉU ESTILIZADO + ESCRITA CURIOUS HAT */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left select-none">
              {/* Ilustração Vetorial do Chapéu Misterioso Estilizado */}
              <div className="relative group mb-6">
                <div
                  className="absolute inset-0 bg-purple-600/30 blur-2xl rounded-full scale-90 group-hover:scale-105 transition-transform duration-500"
                  aria-hidden="true"
                />
                <svg
                  viewBox="0 0 240 200"
                  className="w-48 h-40 sm:w-64 sm:h-52 relative drop-shadow-[0_0_25px_rgba(168,85,247,0.5)] transform -rotate-6 hover:rotate-0 transition-transform duration-500"
                  role="img"
                  aria-label="Chapéu estilizado do Curious Hat"
                >
                  <defs>
                    <linearGradient id="hatCrown" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b0764" />
                      <stop offset="50%" stopColor="#18181b" />
                      <stop offset="100%" stopColor="#09090b" />
                    </linearGradient>
                    <linearGradient id="hatBand" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <linearGradient id="hatBrim" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#581c87" />
                      <stop offset="50%" stopColor="#27272a" />
                      <stop offset="100%" stopColor="#4c0519" />
                    </linearGradient>
                  </defs>

                  {/* Sombra da Aba */}
                  <ellipse cx="120" cy="152" rx="105" ry="26" fill="#000000" opacity="0.7" />

                  {/* Aba do Chapéu Curvada */}
                  <path
                    d="M 15 142 C 45 175, 195 175, 225 142 C 195 122, 45 122, 15 142 Z"
                    fill="url(#hatBrim)"
                    stroke="#c084fc"
                    strokeWidth="2.5"
                  />

                  {/* Copa do Chapéu (Estilo Cartola / Fedora Misterioso) */}
                  <path
                    d="M 62 135 L 74 42 C 95 28, 145 28, 166 42 L 178 135 Z"
                    fill="url(#hatCrown)"
                    stroke="#e9d5ff"
                    strokeWidth="2"
                  />

                  {/* Topo Côncavo do Chapéu */}
                  <ellipse
                    cx="120"
                    cy="42"
                    rx="46"
                    ry="11"
                    fill="#2e1065"
                    stroke="#c084fc"
                    strokeWidth="2"
                  />

                  {/* Faixa Neon Roxa/Vermelha do Chapéu */}
                  <path
                    d="M 64 115 C 95 126, 145 126, 176 115 L 178 133 C 145 144, 95 144, 62 133 Z"
                    fill="url(#hatBand)"
                  />

                  {/* Detalhe de Brilho na Copa */}
                  <path
                    d="M 82 55 L 75 110"
                    stroke="#a855f7"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </div>

              {/* Escrita "Curious Hat" Estilizada */}
              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none">
                <span className="block font-serif italic font-light text-zinc-200 tracking-normal text-4xl sm:text-5xl mb-1 drop-shadow">
                  Curious
                </span>
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-red-500 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(168,85,247,0.4)]">
                  HAT
                </span>
              </h1>

              <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-sm font-medium">
                Onde os segredos ganham voz, com hora marcada para sumir — ou para ficar.
              </p>
            </div>

            {/* LADO DIREITO: BOTÃO "CRIAR PERFIL" */}
            <div className="flex flex-col items-center md:items-end justify-center">
              <div className="w-full max-w-sm p-8 rounded-3xl border border-white/25 bg-zinc-950/80 shadow-[0_0_40px_rgba(0,0,0,0.9)] text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-400/40 text-purple-300 text-xs font-bold">
                  <Sparkles size={14} aria-hidden="true" />
                  <span>Acesso Exclusivo</span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white">
                    Pronto para entrar?
                  </h2>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Configure sua identidade pública e escolha seu vulgo anônimo para começar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarCadastro(true)}
                  className="w-full py-4 px-6 rounded-full bg-purple-700 hover:bg-purple-600 active:scale-95 text-white font-black text-lg tracking-wide border-2 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all cursor-pointer flex items-center justify-center gap-3"
                >
                  <UserPlus size={22} aria-hidden="true" />
                  <span>Criar Perfil</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : !perfilAtivo && mostrarCadastro ? (
        /* 2. TELA DO FORMULÁRIO DE CADASTRO (APÓS CLICAR EM "CRIAR PERFIL") */
        <div className="min-h-screen bg-black text-white flex flex-col justify-center py-8 px-4">
          <div className="max-w-2xl w-full mx-auto mb-3">
            <button
              type="button"
              onClick={() => setMostrarCadastro(false)}
              className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-purple-400 font-bold cursor-pointer py-1 px-3 rounded-full border border-white/20 hover:border-purple-400 transition"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Voltar para o início</span>
            </button>
          </div>
          <div className="max-w-2xl w-full mx-auto border border-white/40 rounded-2xl bg-black shadow-[0_0_30px_rgba(147,51,234,0.2)]">
            <Profile onProfileSaved={(novoPerfil) => setPerfilAtivo(novoPerfil)} />
          </div>
        </div>
      ) : (
        /* 3. SITE COMPLETO LIBERADO (APÓS CONCLUIR O CADASTRO) */
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row max-w-5xl mx-auto border-x border-white/40">
          <Navbar />

          <main className="flex-1 min-h-screen bg-black">
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/buscar" element={<SearchPage />} />
              <Route path="/fofoca/:id" element={<GossipDetail />} />
              <Route
                path="/perfil"
                element={
                  <Profile
                    onProfileSaved={(novoPerfil) => setPerfilAtivo(novoPerfil)}
                    onLogout={handleLogout}
                  />
                }
              />
            </Routes>
          </main>
        </div>
      )}
    </BrowserRouter>
  );
}