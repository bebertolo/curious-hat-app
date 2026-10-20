// src/components/GossipCard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame, Trash2, Clock, MessageSquare } from "lucide-react";

export function GossipCard({ post, onLike, onDeleteRequest, onExpire, showDetailsLink = true }) {
  const [tempoRestante, setTempoRestante] = useState("");

  useEffect(() => {
    function calcularTempo() {
      const diferenca = Number(post.expiresAt) - Date.now();

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

    calcularTempo(); // Executa imediatamente ao abrir a tela
    const intervalo = setInterval(calcularTempo, 1000); // Atualiza a cada 1 segundo

    return () => clearInterval(intervalo); // Limpa o timer se o componente sair da tela
  }, [post.expiresAt, post.id, onExpire]);

  // Define a cor da etiqueta de acordo com a picância da fofoca
  const badgeColor =
    post.spiciness === "Bomba"
      ? "bg-red-700 text-white border-red-400"
      : post.spiciness === "Quente"
      ? "bg-purple-700 text-white border-purple-400"
      : "bg-zinc-800 text-zinc-200 border-zinc-500";

  return (
    <article className="border-b border-white/40 p-4 sm:p-5 bg-black hover:bg-zinc-950 transition-colors">
      {/* Cabeçalho do Post: @codinome, categoria, nível e cronômetro */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-purple-400">@{post.codename}</span>
          <span className="text-zinc-300 text-xs">• {post.category}</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${badgeColor}`}>
            {post.spiciness === "Bomba" ? "🔥 Bomba" : post.spiciness}
          </span>
        </div>

        {/* Cronômetro Regressivo em Vermelho Claro */}
        <div
          className="flex items-center gap-1.5 text-red-400 bg-red-950/40 border border-red-400/60 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
          title="Tempo restante até esta fofoca sumir"
        >
          <Clock size={13} aria-hidden="true" />
          <span>{tempoRestante}</span>
        </div>
      </div>

      {/* Corpo do Post */}
      <h2 className="text-lg font-bold text-white mb-1">{post.title}</h2>
      <p className="text-zinc-100 whitespace-pre-wrap leading-relaxed mb-4">{post.content}</p>

      {/* Rodapé de Ações estilo Twitter */}
      <div className="flex items-center justify-between pt-3 border-t border-white/20 text-sm">
        {/* Botão de Fogo (PUT) */}
        <button
          type="button"
          onClick={() => onLike(post)}
          aria-label={`Dar fogo nesta fofoca. Total atual: ${post.likes || 0}`}
          className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-bold cursor-pointer py-1 px-2 rounded hover:bg-purple-950/40 transition"
        >
          <Flame size={18} aria-hidden="true" />
          <span>{post.likes || 0} Fogos</span>
        </button>

        {/* Link para a Tela 3 (Detalhes e Respostas) */}
        {showDetailsLink && (
          <Link
            to={`/fofoca/${post.id}`}
            className="flex items-center gap-1.5 text-white hover:text-purple-400 font-semibold py-1 px-2 rounded hover:bg-zinc-900 transition"
          >
            <MessageSquare size={17} aria-hidden="true" />
            <span>
              Ver / Responder ({Array.isArray(post.replies) ? post.replies.length : 0})
            </span>
          </Link>
        )}

        {/* Botão de Queimar/Deletar (Abre o Modal) */}
        {onDeleteRequest && (
          <button
            type="button"
            onClick={() => onDeleteRequest(post)}
            aria-label={`Queimar a fofoca ${post.title}`}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-semibold cursor-pointer py-1 px-2 rounded hover:bg-red-950/40 transition"
          >
            <Trash2 size={17} aria-hidden="true" />
            <span>Queimar</span>
          </button>
        )}
      </div>
    </article>
  );
}