// src/components/GossipCard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame, Trash2, Clock, MessageSquare } from "lucide-react";

export function GossipCard({ post, onLike, onDeleteRequest, onExpire, showDetailsLink = true }) {
  const [tempoRestante, setTempoRestante] = useState("");

  useEffect(() => {
    function calcularTempo() {
      const diferenca = Number(post.expiresAt) - Date.now();
      const cinquentaAnosEmMs = 50 * 365 * 24 * 60 * 60 * 1000;

      if (diferenca > cinquentaAnosEmMs) {
        setTempoRestante("💬 Comentário Fixo");
        return;
      }

      if (diferenca <= 0) {
        setTempoRestante("Expirado!");
        if (onExpire) onExpire(post.id);
        return;
      }

      const horas = Math.floor(diferenca / (1000 * 60 * 60));
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

      if (horas > 0) {
        setTempoRestante(`${horas}h ${minutos}m ${segundos}s`);
      } else {
        setTempoRestante(`${minutos}m ${segundos < 10 ? "0" : ""}${segundos}s`);
      }
    }

    calcularTempo();
    const intervalo = setInterval(calcularTempo, 1000);
    return () => clearInterval(intervalo);
  }, [post.expiresAt, post.id, onExpire]);

  return (
    <article className="border-b border-white/30 p-4 sm:p-5 bg-black hover:bg-zinc-950 transition-colors">
      <div className="flex items-start gap-3">
        {/* Se for anônimo, mostra apenas o chapéu secreto. Se for post de perfil, mostra a foto do perfil */}
        {post.isAnonymous || !post.authorAvatar ? (
          <div
            className="w-10 h-10 rounded-full bg-purple-950 border border-purple-400 flex items-center justify-center text-lg shrink-0"
            title="Publicação Anônima Desvinculada"
          >
            🎩
          </div>
        ) : (
          <img
            src={post.authorAvatar}
            alt={post.codename}
            className="w-10 h-10 rounded-full object-cover border border-white/30 shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm sm:text-base">
                {post.isAnonymous ? `@${post.codename}` : post.codename}
              </span>
              {post.isAnonymous && (
                <span className="text-[11px] bg-purple-950/80 text-purple-300 border border-purple-400/40 px-2 py-0.5 rounded-full font-semibold">
                  Anônimo
                </span>
              )}
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                tempoRestante.includes("Fixo")
                  ? "text-purple-300 bg-purple-950/40 border border-purple-400/60"
                  : "text-red-400 bg-red-950/40 border border-red-400/60"
              }`}
            >
              <Clock size={13} aria-hidden="true" />
              <span>{tempoRestante}</span>
            </div>
          </div>

          {post.title && <h2 className="text-base font-bold text-white mb-1">{post.title}</h2>}
          <p className="text-zinc-100 whitespace-pre-wrap leading-relaxed mb-3 text-sm sm:text-base">
            {post.content}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => onLike(post)}
              className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-bold cursor-pointer py-1 px-2 rounded hover:bg-purple-950/40 transition"
            >
              <Flame size={17} aria-hidden="true" />
              <span>{post.likes || 0} Fogos</span>
            </button>

            {showDetailsLink && (
              <Link
                to={`/fofoca/${post.id}`}
                className="flex items-center gap-1.5 text-zinc-300 hover:text-purple-400 font-semibold py-1 px-2 rounded hover:bg-zinc-900 transition"
              >
                <MessageSquare size={16} aria-hidden="true" />
                <span>
                  Respostas ({Array.isArray(post.replies) ? post.replies.length : 0})
                </span>
              </Link>
            )}

            {onDeleteRequest && (
              <button
                type="button"
                onClick={() => onDeleteRequest(post)}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-semibold cursor-pointer py-1 px-2 rounded hover:bg-red-950/40 transition"
              >
                <Trash2 size={16} aria-hidden="true" />
                <span>Queimar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}