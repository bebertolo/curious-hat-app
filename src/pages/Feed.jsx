// src/pages/Feed.jsx
import { useState, useEffect } from "react";
import { RefreshCw, Send, Clock } from "lucide-react";
import { getPosts, createPost, togglePostLike, deletePost } from "../services/api";
import { GossipCard } from "../components/GossipCard";
import { ConfirmModal } from "../components/ConfirmModal";
import { HatButton } from "../components/HatButton";

export function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [perfil] = useState(() => {
    const dados = localStorage.getItem("curiousHat_profile");
    return dados ? JSON.parse(dados) : null;
  });

  const [textoNovidade, setTextoNovidade] = useState("");
  const [modoAnonimo, setModoAnonimo] = useState(false);
  const [postTemporario, setPostTemporario] = useState(true);
  const [erroPostRapido, setErroPostRapido] = useState("");
  const [publicando, setPublicando] = useState(false);

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

  async function handlePublicarRapido(e) {
    e.preventDefault();
    if (!textoNovidade.trim() || textoNovidade.trim().length < 3) {
      setErroPostRapido("Escreva uma mensagem antes de postar!");
      return;
    }

    try {
      setPublicando(true);
      setErroPostRapido("");

      const agora = Date.now();
      const expiresAt = postTemporario
        ? agora + 15 * 60 * 1000
        : agora + 100 * 365 * 24 * 60 * 60 * 1000;

      // Se for anônimo: zera todos os vínculos de perfil.
      // Se for público: envia os dados públicos do perfil para que qualquer pessoa possa visitar o perfil dele!
      const novo = await createPost({
        authorId: modoAnonimo ? null : perfil?.userId,
        authorAvatar: modoAnonimo ? null : perfil?.avatarUrl,
        authorBanner: modoAnonimo ? null : perfil?.bannerImage,
        authorBio: modoAnonimo ? null : perfil?.bio,
        authorHandle: modoAnonimo
          ? null
          : perfil?.publicHandle || perfil?.accountName?.toLowerCase().replace(/\s+/g, ""),
        authorJoinedAt: modoAnonimo ? null : perfil?.joinedAt,
        codename: modoAnonimo ? perfil?.codename : perfil?.accountName,
        isAnonymous: modoAnonimo,
        title: "",
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
    const atualizado = await togglePostLike(post);
    setPosts((listaAtual) =>
      listaAtual.map((item) => (item.id === post.id ? atualizado : item))
    );
  } catch {
    setError("Não foi possível curtir agora.");
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
      <div className="border-b border-white/40 p-4 flex items-center justify-between bg-black sticky top-0 z-10">
        <h1 className="text-xl font-extrabold text-white">Página Inicial</h1>
        <HatButton variant="outline" onClick={carregarFofocas} ariaLabel="Atualizar timeline">
          <RefreshCw size={16} aria-hidden="true" />
          <span>Atualizar</span>
        </HatButton>
      </div>

      <div className="p-4 border-b border-white/40 bg-zinc-950/50">
        <form onSubmit={handlePublicarRapido} noValidate>
          <div className="flex gap-3">
            {perfil?.avatarUrl && !modoAnonimo ? (
              <img
                src={perfil.avatarUrl}
                alt={perfil.accountName}
                className="w-11 h-11 rounded-full object-cover border border-white/30 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-purple-950 border border-purple-400 flex items-center justify-center text-lg shrink-0">
                🎩
              </div>
            )}

            <div className="flex-1">
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
                className="w-full bg-black border border-white/40 focus:border-purple-400 p-3 rounded-xl text-white placeholder-zinc-400 resize-none text-base"
              />
            </div>
          </div>

          {erroPostRapido && (
            <p role="alert" className="text-red-400 text-xs font-bold mt-2">
              ⚠️ {erroPostRapido}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setModoAnonimo(!modoAnonimo)}
                title="Clique para alternar entre postar no seu Perfil ou Anônimo"
                className={`relative flex flex-col items-center justify-center px-4 py-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                  modoAnonimo
                    ? "bg-purple-950/90 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(192,132,252,0.3)]"
                    : "bg-black border-white/50 text-white hover:border-white"
                }`}
              >
                {modoAnonimo && (
                  <span
                    className="text-base leading-none -mt-3.5 mb-0.5 bg-black px-1.5 rounded-full border border-purple-400"
                    aria-hidden="true"
                  >
                    🎩
                  </span>
                )}
                <span className="text-xs font-extrabold tracking-wide">
                  {modoAnonimo ? `@${perfil?.codename}` : perfil?.accountName}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {modoAnonimo ? "Post Anônimo (Desvinculado)" : "Post no Perfil (Clique p/ mudar)"}
                </span>
              </button>

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
                <span>Temporário (15m)</span>
              </label>
            </div>

            <HatButton type="submit" variant="purple" disabled={publicando}>
              <Send size={15} aria-hidden="true" />
              <span>{publicando ? "Postando..." : "Postar"}</span>
            </HatButton>
          </div>
        </form>
      </div>

      {error && (
        <div role="alert" className="m-4 p-4 border border-red-400 bg-red-950/70 text-white rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-400">Carregando novidades...</div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center text-zinc-400">
          Nenhuma publicação ativa no momento.
        </div>
      ) : (
        posts.map((post) => (
          <GossipCard
            key={post.id}
            post={post}
            onLike={handleDarFogo}
            onDeleteRequest={setPostParaDeletar}
            onExpire={handleExpirar}
          />
        ))
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
