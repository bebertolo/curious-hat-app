// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";
import { Home, Search, User, Sparkles } from "lucide-react";

export function Navbar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-full font-bold transition-colors border ${
      isActive
        ? "bg-purple-700 text-white border-purple-400"
        : "bg-black text-white border-white/40 hover:border-white hover:bg-zinc-900"
    }`;

  return (
    <header className="md:w-64 border-b md:border-b-0 md:border-r border-white p-4 flex flex-col justify-between bg-black shrink-0">
      <div>
        <div className="flex items-center justify-between md:justify-start gap-2 mb-4 md:mb-8">
          <NavLink to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-white">
            <span className="bg-purple-700 border border-purple-400 p-1.5 rounded-lg text-lg" aria-hidden="true">
              🎩
            </span>
            <span>
              Curious <span className="text-purple-400">Hat</span>
            </span>
          </NavLink>
        </div>

        <nav aria-label="Menu principal" className="flex flex-wrap md:flex-col gap-2.5">
          <NavLink to="/" className={linkClass}>
            <Home size={20} aria-hidden="true" />
            <span>Página Inicial</span>
          </NavLink>

          <NavLink to="/buscar" className={linkClass}>
            <Search size={20} aria-hidden="true" />
            <span>Buscar</span>
          </NavLink>

          <NavLink to="/perfil" className={linkClass}>
            <User size={20} aria-hidden="true" />
            <span>Meu Perfil</span>
          </NavLink>
        </nav>
      </div>

      <div className="hidden md:block mt-8 p-4 border border-white/30 rounded-xl bg-zinc-950">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
          <Sparkles size={16} aria-hidden="true" />
          <span>Dica Rápida</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Na caixa de postagem, clique no seu nome embaixo do texto para colocar o <strong className="text-purple-400">🎩 Chapéu Anônimo</strong>!
        </p>
      </div>
    </header>
  );
}