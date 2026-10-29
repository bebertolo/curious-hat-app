// src/App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserPlus, LogIn, ArrowLeft, Lock, Mail, CheckCircle2 } from "lucide-react";
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

  // Controla qual tela inicial exibir: "boasVindas" | "login" | "cadastro"
  const [modoEntrada, setModoEntrada] = useState("boasVindas");

  // Estados exclusivos do Login (apenas E-mail e Senha)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [avisoEmailEnviado, setAvisoEmailEnviado] = useState("");

  function handleLogout() {
    localStorage.removeItem("curiousHat_profile");
    setPerfilAtivo(null);
    setModoEntrada("boasVindas");
    setLoginEmail("");
    setLoginPassword("");
    setErroLogin("");
  }

  function handleLoginSubmit(e) {
    e.preventDefault();
    setErroLogin("");

    const listaUsuarios = JSON.parse(localStorage.getItem("curiousHat_users") || "[]");
    const usuarioEncontrado = listaUsuarios.find(
      (u) =>
        u.email.toLowerCase() === loginEmail.trim().toLowerCase() &&
        u.password === loginPassword
    );

    if (!usuarioEncontrado) {
      setErroLogin("E-mail ou senha incorretos. Verifique seus dados ou crie um perfil.");
      return;
    }

    localStorage.setItem("curiousHat_profile", JSON.stringify(usuarioEncontrado));
    setPerfilAtivo(usuarioEncontrado);
  }

  return (
    <BrowserRouter>
      {/* 1. TELA DE ABERTURA (CHAPÉU NA ESQUERDA + BOTÕES CRIAR PERFIL / ENTRAR NA DIREITA) */}
      {!perfilAtivo && modoEntrada === "boasVindas" ? (
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row items-center justify-center p-6 md:p-16 relative overflow-hidden">
          <div
            className="absolute -top-32 -left-32 w-96 h-96 bg-purple-800/20 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-800/15 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10">
            {/* LADO ESQUERDO: CHAPÉU ESTILIZADO + CURIOUS HAT */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left select-none">
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
                  <ellipse cx="120" cy="152" rx="105" ry="26" fill="#000000" opacity="0.7" />
                  <path
                    d="M 15 142 C 45 175, 195 175, 225 142 C 195 122, 45 122, 15 142 Z"
                    fill="url(#hatBrim)"
                    stroke="#c084fc"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M 62 135 L 74 42 C 95 28, 145 28, 166 42 L 178 135 Z"
                    fill="url(#hatCrown)"
                    stroke="#e9d5ff"
                    strokeWidth="2"
                  />
                  <ellipse cx="120" cy="42" rx="46" ry="11" fill="#2e1065" stroke="#c084fc" strokeWidth="2" />
                  <path
                    d="M 64 115 C 95 126, 145 126, 176 115 L 178 133 C 145 144, 95 144, 62 133 Z"
                    fill="url(#hatBand)"
                  />
                  <path d="M 82 55 L 75 110" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>

              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none">
                <span className="block font-serif italic font-light text-zinc-200 tracking-normal text-4xl sm:text-5xl mb-1">
                  Curious
                </span>
                <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-red-500 bg-clip-text text-transparent">
                  HAT
                </span>
              </h1>
              <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-sm font-medium">
                Sua rede de publicações e segredos anônimos em tempo real.
              </p>
            </div>

            {/* LADO DIREITO: CRIAR PERFIL OU ENTRAR COM E-MAIL E SENHA */}
            <div className="flex flex-col items-center md:items-end justify-center">
              <div className="w-full max-w-sm p-8 rounded-3xl border border-white/25 bg-zinc-950/90 shadow-2xl text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white">Acontecendo agora</h2>
                  <p className="text-xs text-zinc-300">
                    Inscreva-se hoje ou acesse sua conta existente.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setModoEntrada("cadastro")}
                    className="w-full py-3.5 px-6 rounded-full bg-purple-700 hover:bg-purple-600 text-white font-black text-base border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus size={20} aria-hidden="true" />
                    <span>Criar Perfil</span>
                  </button>

                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <div className="h-px bg-white/20 flex-1" />
                    <span>ou</span>
                    <div className="h-px bg-white/20 flex-1" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setModoEntrada("login")}
                    className="w-full py-3 px-6 rounded-full bg-black hover:bg-zinc-900 text-purple-300 font-bold text-sm border border-purple-400/60 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn size={18} aria-hidden="true" />
                    <span>Entrar na Conta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : !perfilAtivo && modoEntrada === "login" ? (
        /* 2. TELA DE LOGIN (APENAS E-MAIL E SENHA) */
        <div className="min-h-screen bg-black text-white flex flex-col justify-center py-8 px-4">
          <div className="max-w-md w-full mx-auto mb-4">
            <button
              type="button"
              onClick={() => setModoEntrada("boasVindas")}
              className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-purple-400 font-bold cursor-pointer py-1.5 px-4 rounded-full border border-white/20"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Voltar</span>
            </button>
          </div>

          <div className="max-w-md w-full mx-auto p-6 sm:p-8 border border-white/40 rounded-2xl bg-zinc-950">
            <div className="text-center mb-6">
              <span className="text-3xl" aria-hidden="true">🎩</span>
              <h1 className="text-2xl font-black text-white mt-2">Entrar no Curious Hat</h1>
              <p className="text-xs text-zinc-400 mt-1">
                Informe apenas seu e-mail e senha cadastrados.
              </p>
            </div>

            {erroLogin && (
              <div role="alert" className="mb-4 p-3 rounded-xl border border-red-400 bg-red-950/60 text-red-200 text-xs font-bold">
                ⚠️ {erroLogin}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-bold text-white mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-zinc-400" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-black border border-white pl-10 pr-4 py-3 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-bold text-white mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-zinc-400" aria-hidden="true" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder="Sua senha"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-black border border-white pl-10 pr-4 py-3 rounded-xl text-white text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-purple-700 hover:bg-purple-600 text-white font-bold border border-purple-400 cursor-pointer transition mt-2"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      ) : !perfilAtivo && modoEntrada === "cadastro" ? (
        /* 3. TELA DE CADASTRO DE PERFIL */
        <div className="min-h-screen bg-black text-white flex flex-col justify-center py-8 px-4">
          <div className="max-w-2xl w-full mx-auto mb-3">
            <button
              type="button"
              onClick={() => setModoEntrada("boasVindas")}
              className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-purple-400 font-bold cursor-pointer py-1 px-3 rounded-full border border-white/20"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Voltar para o início</span>
            </button>
          </div>
          <div className="max-w-2xl w-full mx-auto border border-white/40 rounded-2xl bg-black">
            <Profile
              onProfileSaved={(novoPerfil, mensagemEmail) => {
                setPerfilAtivo(novoPerfil);
                if (mensagemEmail) setAvisoEmailEnviado(mensagemEmail);
              }}
            />
          </div>
        </div>
      ) : (
        /* 4. SITE LIBERADO */
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row max-w-5xl mx-auto border-x border-white/40">
          <Navbar />

          <main className="flex-1 min-h-screen bg-black">
            {avisoEmailEnviado && (
              <div
                role="status"
                className="m-4 p-4 rounded-xl bg-purple-950/90 border border-purple-400 text-white flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                  <CheckCircle2 size={20} className="text-purple-300 shrink-0" aria-hidden="true" />
                  <span>{avisoEmailEnviado}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAvisoEmailEnviado("")}
                  className="text-xs font-bold underline text-purple-300 cursor-pointer shrink-0"
                >
                  Fechar
                </button>
              </div>
            )}

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
              <Route
                path="/perfil/:id"
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