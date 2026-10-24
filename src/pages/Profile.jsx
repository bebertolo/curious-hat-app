
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, Shield, Sparkles, UserCheck, Calendar } from "lucide-react";
import { getPosts, updatePost, deletePost } from "../services/api";
import { GossipCard } from "../components/GossipCard";
import { HatButton } from "../components/HatButton";
import { ConfirmModal } from "../components/ConfirmModal";

const AVATARES_PRONTOS =[
  "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ShadowHat&backgroundColor=7e22ce",
  "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=RedFox&backgroundColor=b91c1c",
  "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=CyberCat&backgroundColor=18181b",
  "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=PurpleOwl&backgroundColor=6b21a8",
];

const BANNERS_PRONTOS = [
  { id: "roxo", label: "Nebulosa Roxa", css: "bg-gradient-to-r from-purple-900 via-fuchsia-900 to-black" },
  { id: "vermelho", label: "Alerta Vermelho", css: "bg-gradient-to-r from-red-900 via-rose-950 to-black" },
  { id: "cyber", label: "Noite Sombría", css: "bg-gradient-to-r from-zinc-900 via-purple-950 to-red-950" },
];

export function Profile() {
  const navigate = useNavigate();

  // Carrega o perfil salvo no navegador (se existir)
  const [perfilSalvo, setPerfilSalvo] = useState(() => {
    const dados = localStorage.getItem("curiousHat_profile");
    return dados ? JSON.parse(dados) : null;
  });

  // Se não tiver perfil ainda, já abre no modo de cadastro/edição
  const [editando, setEditando] = useState(!perfilSalvo);

  const [form, setForm] = useState({
    accountName: perfilSalvo?.accountName || "",
    codename: perfilSalvo?.codename || "",
    bio: perfilSalvo?.bio || "",
    avatarUrl: perfilSalvo?.avatarUrl || AVATARES_PRONTOS[0],
    bannerStyle: perfilSalvo?.bannerStyle || BANNERS_PRONTOS[0].css,
    joinedAt: perfilSalvo?.joinedAt || "Outubro de 2026",
  });

  const [erros, setErros] = useState({});
  const [meusPosts, setMeusPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postParaDeletar, setPostParaDeletar] = useState(null);

  // Busca as fofocas que pertencem ao codinome deste perfil
  useEffect(() => {
    if (perfilSalvo?.codename) {
      carregarMeusPosts(perfilSalvo.codename);
    }
  }, [perfilSalvo]);

  async function carregarMeusPosts(codinomeAtual) {
    try {
      setLoadingPosts(true);
      const todos = await getPosts();
      const filtrados = todos.filter(
        (p) => p.codename?.toLowerCase() === codinomeAtual.toLowerCase()
      );
      setMeusPosts(filtrados);
    } catch {
      // Silencioso caso a API ainda esteja vazia
    } finally {
      setLoadingPosts(false);
    }
  }

  function validarCadastro() {
    const novosErros = {};
    if (!form.accountName.trim() || form.accountName.trim().length < 3) {
      novosErros.accountName = "Digite seu Nome (mínimo 3 letras).";
    }
    if (!form.codename.trim() || form.codename.trim().length < 3) {
      novosErros.codename = "Escolha seu Vulgo (mínimo 3 letras, sem espaços).";
    }
    if (!form.bio.trim() || form.bio.trim().length < 5) {
      novosErros.bio = "Conte que tipo de foofqueiro você é (mínimo 5 letras).";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function handleSalvarPerfil(e) {
    e.preventDefault();
    if (!validarCadastro()) return;

    const dadosLimpos = {
      ...form,
      accountName: form.accountName.trim(),
      codename: form.codename.trim().replace(/^@/, "").replace(/\s+/g, ""),
      bio: form.bio.trim(),
    };

    localStorage.setItem("curiousHat_profile", JSON.stringify(dadosLimpos));
    setPerfilSalvo(dadosLimpos);
    setEditando(false);
  }

  async function handleDarFogo(post) {
    const atualizado = await updatePost(post.id, {
      ...post,
      likes: (Number(post.likes) || 0) + 1,
    });
    setMeusPosts((atuais) => atuais.map((p) => (p.id === post.id ? atualizado : p)));
  }

  async function confirmarExclusao() {
    if (!postParaDeletar) return;
    await deletePost(postParaDeletar.id);
    setMeusPosts((atuais) => atuais.filter((p) => p.id !== postParaDeletar.id));
    setPostParaDeletar(null);
  }

  // MODO 1: TELA DE CADASTRO / EDIÇÃO DE PERFIL
  if (editando) {
    return (
      <div className="p-4 sm:p-6">
        <div className="border-b border-white pb-4 mb-6">
          <h1 className="text-2xl font-extrabold text-white">
            {perfilSalvo ? "Editar Perfil🎩" : "Criar Perfil🎩"}
          </h1>
          <p className="text-zinc-300 text-sm mt-1">
            Para publicar fofocas ou comentários, configure sua conta e sua identidade secreta.
          </p>
        </div>

        {/* Prévia ao vivo de como vai ficar no estilo X/Twitter */}
        <div className="mb-6 border border-white/40 rounded-2xl overflow-hidden bg-black">
          <div className={`h-28 w-full ${form.bannerStyle}`} />
          <div className="px-4 pb-4 relative flex justify-between items-end -mt-10">
            <img
              src={form.avatarUrl}
              alt="Prévia do avatar"
              width="80"
              height="80"
              className="w-20 h-20 rounded-full border-4 border-black bg-zinc-900 object-cover"
            />
            <span className="text-xs text-purple-400 font-mono border border-purple-400/50 px-2 py-1 rounded-full">
              Prévia do Perfil
            </span>
          </div>
          <div className="px-4 pb-4">
            <p className="font-extrabold text-lg text-white">
              {form.accountName || "Nome"}
            </p>
            <p className="text-purple-400 text-sm font-bold">
              @{form.codename || "seu_codinome_anonimo"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSalvarPerfil} noValidate className="space-y-5">
          {/* Nome da Conta */}
          <div>
            <label htmlFor="accountName" className="block font-bold text-white mb-1">
              1. Nome da Conta (Exibido no seu Perfil) *
            </label>
            <input
              id="accountName"
              type="text"
              placeholder="Ex: Bernardo T. / Rainha da Fofoca"
              value={form.accountName}
              onChange={(e) => setForm({ ...form, accountName: e.target.value })}
              className="w-full bg-black border border-white p-3 rounded-lg text-white"
            />
            {erros.accountName && (
              <p role="alert" className="text-red-400 text-sm font-semibold mt-1">
                ⚠️ {erros.accountName}
              </p>
            )}
          </div>

          {/* Codinome Anônimo */}
          <div>
            <label htmlFor="codename" className="block font-bold text-white mb-1">
              2. Codinome Anônimo (Aparece nas Fofocas que você publicar) *
            </label>
            <input
              id="codename"
              type="text"
              placeholder="Ex: SombraDoBlocoC"
              value={form.codename}
              onChange={(e) => setForm({ ...form, codename: e.target.value })}
              className="w-full bg-black border border-purple-400 p-3 rounded-lg text-white"
            />
            {erros.codename && (
              <p role="alert" className="text-red-400 text-sm font-semibold mt-1">
                ⚠️ {erros.codename}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block font-bold text-white mb-1">
              3. Bio do Perfil *
            </label>
            <textarea
              id="bio"
              rows="2"
              maxLength={160}
              placeholder="Ex: Observando tudo em silêncio desde 2025..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full bg-black border border-white p-3 rounded-lg text-white"
            />
            {erros.bio && (
              <p role="alert" className="text-red-400 text-sm font-semibold mt-1">
                ⚠️ {erros.bio}
              </p>
            )}
          </div>

          {/* Escolha da Foto de Perfil */}
          <div>
            <span className="block font-bold text-white mb-2">4. Escolha sua Foto de Perfil:</span>
            <div className="flex flex-wrap gap-3 mb-2">
              {AVATARES_PRONTOS.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setForm({ ...form, avatarUrl: url })}
                  aria-label={`Escolher avatar opção ${i + 1}`}
                  className={`p-1 rounded-full border-2 cursor-pointer transition ${
                    form.avatarUrl === url ? "border-purple-400 scale-110" : "border-transparent opacity-60"
                  }`}
                >
                  <img src={url} alt={`Avatar ${i + 1}`} width="52" height="52" className="w-13 h-13 rounded-full" />
                </button>
              ))}
            </div>
            <label htmlFor="avatarUrl" className="block text-xs text-zinc-300 mb-1">
              Ou cole o link (URL) de qualquer imagem da internet:
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              className="w-full bg-black border border-white/60 p-2 rounded-lg text-white text-sm"
            />
          </div>

          {/* Escolha do Papel de Parede (Capa estilo Twitter/X) */}
          <div>
            <span className="block font-bold text-white mb-2">
              5. Papel de Parede do Perfil (Capa estilo X):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BANNERS_PRONTOS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setForm({ ...form, bannerStyle: b.css })}
                  className={`h-16 rounded-xl border-2 flex items-center justify-center font-bold text-sm cursor-pointer ${
                    b.css
                  } ${form.bannerStyle === b.css ? "border-white" : "border-white/20 opacity-60"}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/30">
            {perfilSalvo && (
              <HatButton variant="outline" onClick={() => setEditando(false)}>
                Cancelar
              </HatButton>
            )}
            <HatButton type="submit" variant="purple">
              <UserCheck size={18} aria-hidden="true" />
              <span>Salvar Perfil e Continuar</span>
            </HatButton>
          </div>
        </form>
      </div>
    );
  }

  // MODO 2: PÁGINA DO PERFIL ESTILO X (ANTIGO TWITTER)
  return (
    <div>
      {/* Papel de Parede (Capa Superior) */}
      <div className={`h-36 sm:h-48 w-full border-b border-white/40 ${perfilSalvo.bannerStyle}`} />

      {/* Área de Informações do Usuário */}
      <div className="px-4 sm:px-6 pb-5 border-b border-white">
        {/* Foto de Perfil sobreposta + Botão Editar Perfil */}
        <div className="flex justify-between items-end -mt-14 sm:-mt-16 mb-3">
          <img
            src={perfilSalvo.avatarUrl}
            alt={`Foto de perfil de ${perfilSalvo.accountName}`}
            width="112"
            height="112"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-black bg-zinc-900 object-cover shadow-lg"
          />

          <div className="flex gap-2">
            <HatButton variant="outline" onClick={() => setEditando(true)}>
              <Edit3 size={16} aria-hidden="true" />
              <span>Editar Perfil</span>
            </HatButton>
            <HatButton variant="purple" onClick={() => navigate("/novo")}>
              <Sparkles size={16} aria-hidden="true" />
              <span>Nova Fofoca</span>
            </HatButton>
          </div>
        </div>

        {/* Nome da Conta e @Codinome Anônimo */}
        <h1 className="text-2xl font-black text-white leading-tight">
          {perfilSalvo.accountName}
        </h1>
        <div className="flex items-center gap-2 mt-0.5 mb-3">
          <span className="text-purple-400 font-bold text-sm">
            @{perfilSalvo.codename}
          </span>
          <span className="text-xs bg-zinc-900 border border-purple-400/50 text-purple-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Shield size={12} aria-hidden="true" /> Identidade Anônima Ativa
          </span>
        </div>

        {/* Bio */}
        <p className="text-zinc-100 text-sm leading-relaxed mb-4">
          {perfilSalvo.bio}
        </p>

        {/* Metadados e Contadores estilo Twitter */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300">
          <span className="flex items-center gap-1">
            <Calendar size={14} aria-hidden="true" className="text-purple-400" />
            Entrou em {perfilSalvo.joinedAt}
          </span>
          <span>
            <strong className="text-white">{meusPosts.length}</strong> Segredos ativos no momento
          </span>
        </div>
      </div>

      {/* Aba de Publicações do Usuário */}
      <div className="border-b border-white/40 px-6 py-3 bg-zinc-950">
        <span className="font-extrabold text-purple-400 border-b-2 border-purple-400 pb-3 inline-block">
          Fofocas & Comentários de @{perfilSalvo.codename}
        </span>
      </div>

      {loadingPosts ? (
        <p className="p-8 text-center text-zinc-300">Carregando suas publicações...</p>
      ) : meusPosts.length === 0 ? (
        <div className="p-10 text-center space-y-3">
          <p className="text-zinc-300">
            Você ainda não tem nenhuma fofoca ativa com o codinome <strong>@{perfilSalvo.codename}</strong>.
          </p>
          <HatButton variant="purple" onClick={() => navigate("/novo")} className="mx-auto">
            Soltar Minha Primeira Fofoca
          </HatButton>
        </div>
      ) : (
        meusPosts.map((post) => (
          <GossipCard
            key={post.id}
            post={post}
            onLike={handleDarFogo}
            onDeleteRequest={setPostParaDeletar}
            onExpire={(id) => setMeusPosts((atuais) => atuais.filter((p) => p.id !== id))}
          />
        ))
      )}

      <ConfirmModal
        post={postParaDeletar}
        onCancel={() => setPostParaDeletar(null)}
        onConfirm={confirmarExclusao}
      />
    </div>
  );
}