// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";
import { Home, PlusCircle, Sparkles } from "lucide-react";

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
        {/* Logo do Curious Hat */}
        <div className="flex items-center justify-between md:justify-start gap-2 mb-4 md:mb-8">
          <NavLink to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-white">
            <span className="bg-purple-700 border border-purple-400 p-1.5 rounded-lg text-lg" aria-hidden="true">
              🎩
            </span>
            <span>
              Curious <span className="text-purple-400">Hat</span>
            </span>
          </NavLink>
          <span className="text-xs border border-red-400 text-red-400 px-2 py-0.5 rounded-full font-mono md:hidden">
            Efêmero
          </span>
        </div>

        {/* Links de Navegação */}
        <nav aria-label="Menu principal" className="flex md:flex-col gap-3">
          <NavLink to="/" className={linkClass}>
            <Home size={20} aria-hidden="true" />
            <span>Timeline</span>
          </NavLink>

          <NavLink to="/novo" className={linkClass}>
            <PlusCircle size={20} aria-hidden="true" />
            <span>Soltar Fofoca</span>
          </NavLink>
        </nav>
      </div>

      {/* Aviso estético no rodapé do menu desktop */}
      <div className="hidden md:block mt-8 p-4 border border-white/30 rounded-xl bg-zinc-950">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
          <Sparkles size={16} aria-hidden="true" />
          <span>Como funciona?</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Todo post no <strong className="text-white">Curious Hat</strong> mostra o tempo que vai demorar para a mensagem sumir.
        </p>
      </div>
    </header>
  );
}