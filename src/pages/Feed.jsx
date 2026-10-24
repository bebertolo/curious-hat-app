// src/pages/Feed.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Send, Clock } from "lucide-react";
import { getPosts, createPost, updatePost, deletePost } from "../services/api";
import { GossipCard } from "../components/GossipCard";
import { ConfirmModal } from "../components/ConfirmModal";
import { HatButton } from "../components/HatButton";

export function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carrega o perfil salvo para pegar o Nome da Conta e o Codinome Anônimo
  const [perfil] = useState(() => {
    const dados = localStorage.getItem("curiousHat_profile");
    return dados ? JSON.parse(dados) : null;
  });

  // Estados da caixa rápida "Qual as novidades..." no topo da Home
  const [textoNovidade, setTextoNovidade] = useState("");
  const [modoAnonimo, setModoAnonimo] = useState(false); // false = Nome da Conta | true = Codinome com chapéu
  const [postTemporario, setPostTemporario] = useState(true); // caixinha marcada = some após 15 min
  const [erroPostRapido, setErroPostRapido] = useState("");
  const [publicando, setPublicando] = useState(false);

  // Estados do Modal de Exclusão
  const [postParaDeletar, setPostParaDeletar] = useState(null);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => {
    carregarFofocas();
  }, []);

  async function carregarFofocas() {
    try {
      setLoading(true);
      setError("");
      const dados = await getPosts();
      setPosts(dados);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Publicar direto pelo topo da Home
  async function handlePublicarRapido(e) {
    e.preventDefault();
    if (!textoNovidade.trim() || textoNovidade.trim().length < 5) {
      setErroPostRapido("Escreva pelo menos 5 caracteres antes de publicar!");
      return;
    }

    try {
      setPublicando(true);
      setErroPostRapido("");

      const agora = Date.now();
      // Se a caixinha estiver marcada, some em 15 minutos. Se desmarcada, dura 100 anos (Comentário Fixo)
      const expiresAt = postTemporario
        ? agora + 15 * 60 * 1000
        : agora + 100 * 365 * 24 * 60 * 60 * 1000;

      // Define se vai sair com o Codinome Anônimo ou com o Nome da Conta
      const autorEscolhido = modoAnonimo
        ? perfil?.codename || "AnonimoDoChapeu"
        : perfil?.accountName || "Visitante";

      const novo = await createPost({
        codename: autorEscolhido,
        isAnonymous: modoAnonimo,
        title: "", // Sem título, estilo X/Twitter
        category: "Geral",
        spiciness: modoAnonimo ? "Quente" : "Leve",
        content: textoNovidade.trim(),
        likes: 0,
        createdAt: agora,
        expiresAt: expiresAt,
        replies: [],
      });

      setPosts((listaAtual) => [novo, ...listaAtual]);
      setTextoNovidade("");
    } catch (err) {
      setErroPostRapido(err.message);
    } finally {
      setPublicando(false);
    }
  }

  async function handleDarFogo(post) {
    try {
      const atualizado = await updatePost(post.id, {
        ...post,
        likes: (Number(post.likes) || 0) + 1,
      });
      setPosts((listaAtual) =>
        listaAtual.map((item) => (item.id === post.id ? atualizado : item))
      );
    } catch {
      setError("Não foi possível dar fogo nesta publicação agora.");
    }
  }

  async function confirmarExclusao() {
    if (!postParaDeletar) return;
    try {
      setDeletando(true);
      await deletePost(postParaDeletar.id);
      setPosts((listaAtual) =>
        listaAtual.filter((item) => item.id !== postParaDeletar.id)
      );
      setPostParaDeletar(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletando(false);
    }
  }

  function handleExpirar(idExpirado) {
    setPosts((listaAtual) => listaAtual.filter((item) => item.id !== idExpirado));
  }

  return (
    <div>
      {/* Topo da Home */}
      <div className="border-b border-white p-4 flex items-center justify-between bg-black sticky top-0 z-10">
        <h1 className="text-xl font-extrabold text-white">Página Inicial</h1>
        <HatButton
          variant="outline"
          onClick={carregarFofocas}
          ariaLabel="Atualizar timeline"
        >
          <RefreshCw size={16} aria-hidden="true" />
          <span>Atualizar</span>
        </HatButton>
      </div>

      {/* CAIXA DE POSTAGEM RÁPIDA NO TOPO ("Qual as novidades...") */}
      <div className="p-4 border-b border-white bg-zinc-950/60">
        {!perfil ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border border-purple-400/50 rounded-xl bg-black">
            <p className="text-sm text-zinc-200">
              Crie seu perfil com <strong>Nome da Conta</strong> e <strong>Codinome Anônimo</strong> para publicar!
            </p>
            <Link
              to="/perfil"
              className="bg-purple-700 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-full text-sm border border-purple-400 shrink-0"
            >
              Criar Perfil
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePublicarRapido} noValidate>
            <label htmlFor="caixa-novidades" className="sr-only">
              Qual as novidades
            </label>
            <textarea
              id="caixa-novidades"
              rows="3"
              maxLength={280}
              placeholder="Qual as novidades..."
              value={textoNovidade}
              onChange={(e) => {
                setTextoNovidade(e.target.value);
                if (erroPostRapido) setErroPostRapido("");
              }}
              className="w-full bg-black border border-white/60 focus:border-purple-400 p-3 rounded-xl text-white placeholder-zinc-400 resize-none text-base"
            />

            {erroPostRapido && (
              <p role="alert" className="text-red-400 text-xs font-bold mt-1">
                ⚠️ {erroPostRapido}
              </p>
            )}

            {/* Barra Inferior da Caixa de Texto */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2">
              <div className="flex flex-wrap items-center gap-4">
                {/* BOTÃO QUE ALTERNA ENTRE NOME DA CONTA E CODINOME COM CHAPÉU EM CIMA */}
                <button
                  type="button"
                  onClick={() => setModoAnonimo(!modoAnonimo)}
                  title="Clique para alternar entre seu Nome e seu Codinome Anônimo"
                  className={`relative flex flex-col items-center justify-center px-4 py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                    modoAnonimo
                      ? "bg-purple-950/80 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(192,132,252,0.3)]"
                      : "bg-black border-white/50 text-white hover:border-white"
                  }`}
                >
                  {/* Pequeno chapéu em cima quando está no modo anônimo */}
                  {modoAnonimo && (
                    <span
                      className="text-base leading-none -mt-3.5 mb-0.5 bg-black px-1 rounded-full border border-purple-400"
                      aria-hidden="true"
                    >
                      🎩
                    </span>
                  )}
                  <span className="text-xs font-extrabold tracking-wide">
                    {modoAnonimo ? `@${perfil.codename}` : perfil.accountName}
                  </span>
                  <span className="text-[10px] text-zinc-300">
                    (Clique p/ mudar)
                  </span>
                </button>

                {/* PEQUENO CAMPO PARA MARCAR (Temporário vs Fixo) */}
                <label
                  htmlFor="check-temporario"
                  className="flex items-center gap-2 text-xs text-zinc-200 cursor-pointer select-none border border-white/30 px-3 py-2 rounded-xl bg-black hover:border-red-400 transition"
                >
                  <input
                    id="check-temporario"
                    type="checkbox"
                    checked={postTemporario}
                    onChange={(e) => setPostTemporario(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                  <Clock size={14} className="text-red-400" aria-hidden="true" />
                  <span>Fofoca temporária (15m)</span>
                </label>
              </div>

              {/* Botão Publicar */}
              <HatButton type="submit" variant="purple" disabled={publicando}>
                <Send size={15} aria-hidden="true" />
                <span>{publicando ? "Postando..." : "Postar"}</span>
              </HatButton>
            </div>
          </form>
        )}
      </div>

      {/* Tratamento de Erro */}
      {error && (
        <div role="alert" className="m-4 p-4 border-2 border-red-400 bg-red-950/70 text-white rounded-xl">
          <p className="font-bold text-red-300">Ops! Algo deu errado:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Feed de Publicações */}
      {loading ? (
        <div className="p-12 text-center text-zinc-300 font-semibold">
          Carregando novidades...
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center text-zinc-300">
          Nenhuma publicação ativa no momento. Escreva a primeira ali em cima!
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <GossipCard
              key={post.id}
              post={post}
              onLike={handleDarFogo}
              onDeleteRequest={setPostParaDeletar}
              onExpire={handleExpirar}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        post={postParaDeletar}
        onCancel={() => setPostParaDeletar(null)}
        onConfirm={confirmarExclusao}
        isDeleting={deletando}
      />
    </div>
  );
}