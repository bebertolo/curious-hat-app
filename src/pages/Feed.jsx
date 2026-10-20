// src/pages/Feed.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import { getPosts, updatePost, deletePost } from "../services/api";
import { GossipCard } from "../components/GossipCard";
import { ConfirmModal } from "../components/ConfirmModal";
import { HatButton } from "../components/HatButton";

export function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados das Interações do Usuário (Busca, Filtro e Ordenação)
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [ordenacao, setOrdenacao] = useState("recentes");

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

  // Interação PUT: Dar "Fogo" na fofoca
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
      setError("Não foi possível dar fogo nesta fofoca agora.");
    }
  }

  // Interação DELETE: Confirmar exclusão no Modal
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

  // Remove da tela instantaneamente quando o cronômetro chega a zero
  function handleExpirar(idExpirado) {
    setPosts((listaAtual) => listaAtual.filter((item) => item.id !== idExpirado));
  }

  // Pipeline de Filtro + Ordenação
  const postsFiltrados = posts
    .filter((post) => {
      const termo = busca.toLowerCase();
      const bateBusca =
        post.title?.toLowerCase().includes(termo) ||
        post.content?.toLowerCase().includes(termo) ||
        post.codename?.toLowerCase().includes(termo);
      const bateCategoria = categoria === "Todas" || post.category === categoria;
      return bateBusca && bateCategoria;
    })
    .sort((a, b) => {
      if (ordenacao === "fogos") return (Number(b.likes) || 0) - (Number(a.likes) || 0);
      if (ordenacao === "expirando") return Number(a.expiresAt) - Number(b.expiresAt);
      return Number(b.createdAt) - Number(a.createdAt); // 'recentes'
    });

  return (
    <div>
      {/* Cabeçalho da Timeline */}
      <div className="border-b border-white p-4 flex items-center justify-between bg-black sticky top-0 z-10">
        <h1 className="text-xl font-extrabold text-white">Timeline de Segredos</h1>
        <HatButton
          variant="outline"
          onClick={carregarFofocas}
          ariaLabel="Atualizar timeline de fofocas"
        >
          <RefreshCw size={16} aria-hidden="true" />
          <span>Atualizar</span>
        </HatButton>
      </div>

      {/* Barra de Interações: Busca + Categoria + Ordenação */}
      <div className="p-4 border-b border-white/60 bg-zinc-950 space-y-3">
        {/* 1. Campo de Busca */}
        <div className="relative">
          <label htmlFor="campo-busca" className="sr-only">
            Buscar por palavra-chave ou codinome
          </label>
          <Search
            size={18}
            className="absolute left-3.5 top-3 text-zinc-400"
            aria-hidden="true"
          />
          <input
            id="campo-busca"
            type="search"
            placeholder="Buscar fofoca, assunto ou @codinome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-black border border-white text-white pl-10 pr-4 py-2 rounded-full text-sm"
          />
        </div>

        {/* 2. Seletores de Filtro e Ordenação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="filtro-categoria" className="block text-xs text-zinc-300 mb-1 font-semibold">
              Filtrar por Categoria:
            </label>
            <select
              id="filtro-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-black border border-purple-400 text-white px-3 py-2 rounded-lg text-sm"
            >
              <option value="Todas">Todas as Categorias</option>
              <option value="Faculdade">Faculdade</option>
              <option value="Romance">Romance</option>
              <option value="Treta">Treta</option>
              <option value="Confissão">Confissão</option>
            </select>
          </div>

          <div>
            <label htmlFor="filtro-ordem" className="block text-xs text-zinc-300 mb-1 font-semibold">
              Ordenar por:
            </label>
            <select
              id="filtro-ordem"
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              className="w-full bg-black border border-white text-white px-3 py-2 rounded-lg text-sm"
            >
              <option value="recentes">Mais Recentes</option>
              <option value="fogos">🔥 Mais Bombadas (Fogos)</option>
              <option value="expirando">⏳ Prestes a Sumir</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tratamento Visual de Erros da API */}
      {error && (
        <div role="alert" className="m-4 p-4 border-2 border-red-400 bg-red-950/70 text-white rounded-xl">
          <p className="font-bold text-red-300">Ops! Algo deu errado:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Listagem de Posts */}
      {loading ? (
        <div className="p-12 text-center text-zinc-300 font-semibold">
          Vasculhando o chapéu em busca de segredos ativos...
        </div>
      ) : postsFiltrados.length === 0 ? (
        <div className="p-12 text-center space-y-4">
          <p className="text-zinc-300 text-lg">
            Nenhuma fofoca ativa encontrada com esses filtros (ou todas já sumiram!).
          </p>
          <Link
            to="/novo"
            className="inline-block bg-purple-700 hover:bg-purple-600 text-white font-bold px-6 py-2.5 rounded-full border border-purple-400"
          >
            Soltar a Primeira Fofoca
          </Link>
        </div>
      ) : (
        <div>
          {postsFiltrados.map((post) => (
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

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        post={postParaDeletar}
        onCancel={() => setPostParaDeletar(null)}
        onConfirm={confirmarExclusao}
        isDeleting={deletando}
      />
    </div>
  );
}