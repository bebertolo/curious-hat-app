// src/pages/Profile.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  Plus,
  UserCheck,
  LogOut,
  ArrowLeft,
  UserPlus,
  Check,
} from "lucide-react";
import { getPosts, updatePost, deletePost } from "../services/api";
import { GossipCard } from "../components/GossipCard";
import { HatButton } from "../components/HatButton";
import { ConfirmModal } from "../components/ConfirmModal";

const AVATAR_PADRAO =
  "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=CuriousHat&backgroundColor=6b21a8";

export function Profile({ onProfileSaved, onLogout }) {
  const navigate = useNavigate();
  const { id: idUrl } = useParams(); // Pega o ID ou nome do usuário quando clicamos no perfil de alguém
  const fileInputAvatarRef = useRef(null);
  const fileInputBannerRef = useRef(null);

  const [meuPerfil, setMeuPerfil] = useState(() => {
    const dados = localStorage.getItem("curiousHat_profile");
    return dados ? JSON.parse(dados) : null;
  });

  // Verifica se estamos visitando o perfil de outra pessoa
  const visitandoOutroUsuario =
    Boolean(idUrl) &&
    idUrl !== meuPerfil?.userId &&
    decodeURIComponent(idUrl).toLowerCase() !== meuPerfil?.accountName?.toLowerCase();

  const [editando, setEditando] = useState(!meuPerfil && !visitandoOutroUsuario);
  const [abaAtiva, setAbaAtiva] = useState("posts");
  const [enviandoCadastro, setEnviandoCadastro] = useState(false);

  // Estado para quando estamos vendo o perfil de outra pessoa
  const [perfilVisitado, setPerfilVisitado] = useState(null);
  const [seguindo, setSeguindo] = useState(false);

  const [form, setForm] = useState({
    userId: meuPerfil?.userId || "",
    fullName: meuPerfil?.fullName || "",
    email: meuPerfil?.email || "",
    birthDate: meuPerfil?.birthDate || "",
    accountName: meuPerfil?.accountName || "",
    codename: meuPerfil?.codename || "",
    password: meuPerfil?.password || "",
    bio: meuPerfil?.bio || "Observando tudo no Curious Hat.",
    avatarUrl: meuPerfil?.avatarUrl || AVATAR_PADRAO,
    bannerImage: meuPerfil?.bannerImage || "",
    joinedAt: meuPerfil?.joinedAt || "Outubro de 2026",
  });

  const [erros, setErros] = useState({});
  const [postsDoPerfil, setPostsDoPerfil] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postParaDeletar, setPostParaDeletar] = useState(null);

  useEffect(() => {
    carregarDadosDoPerfil();
  }, [idUrl, meuPerfil]);

  async function carregarDadosDoPerfil() {
    try {
      setLoadingPosts(true);
      const todosOsPosts = await getPosts();

      // CASO 1: Visitando o perfil de OUTRA pessoa que postou no feed
      if (visitandoOutroUsuario) {
        const idDecodificado = decodeURIComponent(idUrl);

        // Filtra apenas os posts públicos dessa pessoa (nunca inclui posts anônimos)
        const postsDessaPessoa = todosOsPosts.filter(
          (p) =>
            !p.isAnonymous &&
            (p.authorId === idDecodificado ||
              p.codename?.toLowerCase() === idDecodificado.toLowerCase())
        );

        setPostsDoPerfil(postsDessaPessoa);

        // Tenta achar nos usuários locais ou reconstrói o perfil pelos dados públicos salvos no post
        const usuariosLocais = JSON.parse(localStorage.getItem("curiousHat_users") || "[]");
        const usuarioLocal = usuariosLocais.find(
          (u) =>
            u.userId === idDecodificado ||
            u.accountName?.toLowerCase() === idDecodificado.toLowerCase()
        );

        const postMaisRecente = postsDessaPessoa[0];

        if (usuarioLocal) {
          setPerfilVisitado(usuarioLocal);
        } else if (postMaisRecente) {
          setPerfilVisitado({
            userId: postMaisRecente.authorId || idDecodificado,
            accountName: postMaisRecente.codename,
            publicHandle:
              postMaisRecente.authorHandle ||
              postMaisRecente.codename?.toLowerCase().replace(/\s+/g, ""),
            bio: postMaisRecente.authorBio || "Usuário do Curious Hat 🎩",
            avatarUrl:
              postMaisRecente.authorAvatar ||
              `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(postMaisRecente.codename)}&backgroundColor=6b21a8`,
            bannerImage: postMaisRecente.authorBanner || "",
            joinedAt: postMaisRecente.authorJoinedAt || "Outubro de 2026",
          });
        } else {
          setPerfilVisitado({
            userId: idDecodificado,
            accountName: idDecodificado,
            publicHandle: idDecodificado.toLowerCase().replace(/\s+/g, ""),
            bio: "Usuário do Curious Hat 🎩",
            avatarUrl: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(idDecodificado)}&backgroundColor=6b21a8`,
            bannerImage: "",
            joinedAt: "Outubro de 2026",
          });
        }
      } else if (meuPerfil) {
        // CASO 2: Vendo o MEU PRÓPRIO perfil
        setPerfilVisitado(null);
        const meusPostsPublicos = todosOsPosts.filter(
          (p) =>
            !p.isAnonymous &&
            (p.authorId === meuPerfil.userId ||
              (!p.authorId && p.codename?.toLowerCase() === meuPerfil.accountName?.toLowerCase()))
        );
        setPostsDoPerfil(meusPostsPublicos);
      }
    } catch {
      // Silencioso caso a API esteja vazia
    } finally {
      setLoadingPosts(false);
    }
  }

  function handleImageUpload(event, campoDestino, larguraMax = 400) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const proporcao = larguraMax / img.width;
        canvas.width = larguraMax;
        canvas.height = img.height * (proporcao < 1 ? proporcao : 1);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const base64Comprimido = canvas.toDataURL("image/jpeg", 0.8);
        setForm((prev) => ({ ...prev, [campoDestino]: base64Comprimido }));
      };
      img.src = e.target.result;
    };
    leitor.readAsDataURL(arquivo);
  }

  function validarFormulario() {
    const novosErros = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 5) {
      novosErros.fullName = "Informe seu nome completo (mínimo 5 caracteres).";
    }
    if (!form.email.trim() || !form.email.includes("@") || !form.email.includes(".")) {
      novosErros.email = "Informe um endereço de e-mail válido.";
    }
    if (!form.birthDate) {
      novosErros.birthDate = "Informe sua data de nascimento.";
    }
    if (!form.accountName.trim() || form.accountName.trim().length < 3) {
      novosErros.accountName = "Escolha seu Nome no Site (mínimo 3 letras).";
    }
    if (!form.codename.trim() || form.codename.trim().length < 3) {
      novosErros.codename = "Escolha seu Vulgo secreto (mínimo 3 letras).";
    }
    if (!form.password || form.password.length < 6) {
      novosErros.password = "A senha deve ter pelo menos 6 caracteres.";
    }
    if (!form.bio.trim() || form.bio.trim().length < 5) {
      novosErros.bio = "Escreva uma bio para o seu perfil.";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (erros[campo]) {
      setErros((prev) => ({ ...prev, [campo]: "" }));
    }
  }

  async function dispararEmailConfirmacao(emailDestino, nomeUsuario) {
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(emailDestino)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: "Bem-vindo ao Curious Hat! Confirmação de Conta 🎩",
          Nome: nomeUsuario,
          Mensagem: `Olá, ${nomeUsuario}! Sua conta no Curious Hat foi criada com sucesso.`,
          _template: "table",
        }),
      });
    } catch {
      // Prossegue normalmente
    }
  }

  async function handleSalvar(e) {
    e.preventDefault();
    if (!validarFormulario()) return;

    setEnviandoCadastro(true);
    const eraContaNova = !meuPerfil;

    const idUnico =
      meuPerfil?.userId || `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const handlePublico = form.accountName
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, "");

    const dadosFinais = {
      ...form,
      userId: idUnico,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      accountName: form.accountName.trim(),
      publicHandle: handlePublico || "usuario",
      codename: form.codename.trim().replace(/^@/, "").replace(/\s+/g, ""),
      bio: form.bio.trim(),
    };

    const usuariosExistentes = JSON.parse(localStorage.getItem("curiousHat_users") || "[]");
    const outrosUsuarios = usuariosExistentes.filter(
      (u) => u.userId !== idUnico && u.email.toLowerCase() !== dadosFinais.email.toLowerCase()
    );
    localStorage.setItem(
      "curiousHat_users",
      JSON.stringify([...outrosUsuarios, dadosFinais])
    );

    localStorage.setItem("curiousHat_profile", JSON.stringify(dadosFinais));

    let msgEmail = "";
    if (eraContaNova) {
      await dispararEmailConfirmacao(dadosFinais.email, dadosFinais.accountName);
      msgEmail = `Conta criada! Enviamos um e-mail de confirmação para ${dadosFinais.email}.`;
    }

    setEnviandoCadastro(false);
    setMeuPerfil(dadosFinais);
    setEditando(false);

    if (onProfileSaved) {
      onProfileSaved(dadosFinais, msgEmail);
    }
  }

  async function handleDarFogo(post) {
    const atualizado = await updatePost(post.id, {
      ...post,
      likes: (Number(post.likes) || 0) + 1,
    });
    setPostsDoPerfil((atuais) => atuais.map((p) => (p.id === post.id ? atualizado : p)));
  }

  async function confirmarExclusao() {
    if (!postParaDeletar) return;
    await deletePost(postParaDeletar.id);
    setPostsDoPerfil((atuais) => atuais.filter((p) => p.id !== postParaDeletar.id));
    setPostParaDeletar(null);
  }

  // MODO 1: TELA DE CADASTRO OU EDIÇÃO DO PRÓPRIO PERFIL
  if (editando && !visitandoOutroUsuario) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="border-b border-white/30 pb-4 mb-6">
          <h1 className="text-2xl font-extrabold text-white">
            {meuPerfil ? "Editar Perfil" : "Criar sua conta no Curious Hat 🎩"}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Passe o cursor sobre a foto ou capa para clicar no '+' e escolher uma imagem dos seus arquivos.
          </p>
        </div>

        <div className="mb-6 border border-white/30 rounded-2xl overflow-hidden bg-zinc-950">
          <div
            onClick={() => fileInputBannerRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputBannerRef.current?.click()}
            aria-label="Alterar papel de parede"
            className="relative h-36 sm:h-44 w-full bg-gradient-to-r from-purple-900 via-zinc-900 to-red-950 cursor-pointer group overflow-hidden"
          >
            {form.bannerImage && (
              <img
                src={form.bannerImage}
                alt="Capa do perfil"
                className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
              />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
              <Plus size={38} strokeWidth={2.5} className="text-white" />
              <span className="text-xs font-bold mt-1">Escolher Papel de Parede</span>
            </div>
            <input
              ref={fileInputBannerRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "bannerImage", 900)}
              className="hidden"
            />
          </div>

          <div className="px-5 pb-4 flex items-end justify-between -mt-14 relative">
            <div
              onClick={() => fileInputAvatarRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputAvatarRef.current?.click()}
              aria-label="Alterar foto de perfil"
              className="relative w-28 h-28 rounded-full border-4 border-black bg-zinc-900 overflow-hidden cursor-pointer group shadow-xl"
            >
              <img
                src={form.avatarUrl}
                alt="Foto de perfil"
                className="w-full h-full object-cover group-hover:opacity-40 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Plus size={42} strokeWidth={3} className="text-white drop-shadow" />
              </div>
              <input
                ref={fileInputAvatarRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "avatarUrl", 300)}
                className="hidden"
              />
            </div>

            <span className="text-xs text-zinc-400">
              Clique na foto ou capa para enviar arquivo
            </span>
          </div>
        </div>

        <form onSubmit={handleSalvar} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="accountName" className="block font-bold text-white text-sm mb-1">
                Nome no Site (Público no Perfil) *
              </label>
              <input
                id="accountName"
                type="text"
                placeholder="Ex: Bernardo Bertolo"
                value={form.accountName}
                onChange={(e) => handleChange("accountName", e.target.value)}
                className="w-full bg-black border border-white p-3 rounded-xl text-white text-sm"
              />
              {erros.accountName && (
                <p role="alert" className="text-red-400 text-xs font-bold mt-1">⚠️ {erros.accountName}</p>
              )}
            </div>

            <div>
              <label htmlFor="codename" className="block font-bold text-purple-400 text-sm mb-1">
                Vulgo Anônimo (Oculto do Perfil 🎩) *
              </label>
              <input
                id="codename"
                type="text"
                placeholder="Ex: SombraDoBlocoC"
                value={form.codename}
                onChange={(e) => handleChange("codename", e.target.value)}
                className="w-full bg-black border border-purple-400 p-3 rounded-xl text-white text-sm"
              />
              {erros.codename && (
                <p role="alert" className="text-red-400 text-xs font-bold mt-1">⚠️ {erros.codename}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block font-bold text-white text-sm mb-1">
              Bio do Perfil *
            </label>
            <textarea
              id="bio"
              rows="2"
              maxLength={160}
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="w-full bg-black border border-white p-3 rounded-xl text-white text-sm"
            />
            {erros.bio && (
              <p role="alert" className="text-red-400 text-xs font-bold mt-1">⚠️ {erros.bio}</p>
            )}
          </div>

          <div className="pt-2 border-t border-white/20">
            <p className="text-xs text-zinc-400 mb-3 font-semibold">
              🔒 Dados privados de cadastro e login (não aparecem no seu perfil público):
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block font-bold text-white text-sm mb-1">
                  Nome Completo *
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full bg-black border border-white/60 p-3 rounded-xl text-white text-sm"
                />
                {erros.fullName && (
                  <p role="alert" className="text-red-400 text-xs font-bold mt-1">⚠️ {erros.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block font-bold text-white text-sm mb-1">
                    E-mail (Para Login e Confirmação) *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full bg-black border border-white/60 p-3 rounded-xl text-white text-sm"
                  />
                  {erros.email && (
                    <p role="alert" className="text-red-400 text-xs font-bold mt-1">⚠️ {erros.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="birthDate" className="block font-bold text-white text-sm mb-1">
                    Data de Nascimento *
                  </label>
                  <input
                    id="birthDate"
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                    className="w-full bg-black border border-white/60 p-3 rounded-xl text-white text-sm"
                  />
                  {erros.birthDate && (
                    <p role="alert" className="text-red-400 text-xs font-bold mt-1">⚠️ {erros.birthDate}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block font-bold text-white text-sm mb-1">
                  Senha de Acesso *
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Mínimo de 6 caracteres"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full bg-black border border-white/60 p-3 rounded-xl text-white text-sm"
                />
                {erros.password && (
                  <p role="alert" className="text-red-400 text-xs font-bold mt-1">⚠️ {erros.password}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/30">
            {meuPerfil && (
              <HatButton variant="outline" onClick={() => setEditando(false)}>
                Cancelar
              </HatButton>
            )}
            <HatButton type="submit" variant="purple" disabled={enviandoCadastro}>
              <UserCheck size={18} aria-hidden="true" />
              <span>
                {enviandoCadastro
                  ? "Salvando..."
                  : meuPerfil
                  ? "Salvar Perfil"
                  : "Criar Conta e Enviar E-mail"}
              </span>
            </HatButton>
          </div>
        </form>
      </div>
    );
  }

  // Define qual perfil está sendo mostrado na tela (o visitado ou o meu)
  const dadosExibidos = visitandoOutroUsuario ? perfilVisitado : meuPerfil;

  if (!dadosExibidos) {
    return <p className="p-8 text-center text-zinc-400">Carregando perfil...</p>;
  }

  const postsExibidos =
    abaAtiva === "curtidas"
      ? postsDoPerfil.filter((p) => (Number(p.likes) || 0) > 0)
      : postsDoPerfil;

  // MODO 2: VISUALIZAÇÃO DE PERFIL ESTILO X/TWITTER (MEU OU DE OUTRA PESSOA)
  return (
    <div>
      {/* Topo Estilo X com Seta Voltar e Contador */}
      <div className="sticky top-0 z-10 bg-black/85 backdrop-blur-md px-4 py-2.5 border-b border-white/25 flex items-center gap-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="p-2 rounded-full hover:bg-zinc-900 text-white transition cursor-pointer"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-white leading-tight">
            {dadosExibidos.accountName}
          </h1>
          <p className="text-xs text-zinc-400">{postsDoPerfil.length} posts</p>
        </div>
      </div>

      {/* Papel de Parede */}
      <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-purple-900 via-zinc-900 to-red-950 overflow-hidden border-b border-white/20">
        {dadosExibidos.bannerImage && (
          <img
            src={dadosExibidos.bannerImage}
            alt="Papel de parede"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Cabeçalho do Perfil */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-3">
          {/* Se for meu perfil, posso clicar na foto para editar. Se for de outro, apenas exibe a foto */}
          <div
            onClick={() => !visitandoOutroUsuario && setEditando(true)}
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-black bg-zinc-900 overflow-hidden shadow-xl ${
              !visitandoOutroUsuario ? "cursor-pointer group" : ""
            }`}
          >
            <img
              src={dadosExibidos.avatarUrl || AVATAR_PADRAO}
              alt={dadosExibidos.accountName}
              className={`w-full h-full object-cover ${
                !visitandoOutroUsuario ? "group-hover:opacity-40 transition-opacity" : ""
              }`}
            />
            {!visitandoOutroUsuario && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Plus size={36} strokeWidth={3} className="text-white" />
              </div>
            )}
          </div>

          {/* Botões do Canto Direito: "Seguir" (se for outro usuário) ou "Editar perfil / Sair" (se for o meu) */}
          <div className="flex items-center gap-2">
            {visitandoOutroUsuario ? (
              <button
                type="button"
                onClick={() => setSeguindo(!seguindo)}
                className={`px-5 py-2 rounded-full font-extrabold text-sm transition cursor-pointer flex items-center gap-1.5 ${
                  seguindo
                    ? "bg-black text-white border border-white/60 hover:border-red-400 hover:text-red-400"
                    : "bg-white text-black hover:bg-zinc-200"
                }`}
              >
                {seguindo ? (
                  <>
                    <Check size={16} aria-hidden="true" />
                    <span>Seguindo</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} aria-hidden="true" />
                    <span>Seguir</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditando(true)}
                  className="px-4 py-1.5 rounded-full border border-white/50 hover:bg-zinc-900 text-white font-bold text-sm transition cursor-pointer"
                >
                  Editar perfil
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Sair da conta"
                    className="p-2 rounded-full border border-red-500/50 hover:bg-red-950/50 text-red-400 transition cursor-pointer"
                  >
                    <LogOut size={18} aria-hidden="true" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mb-3">
          <h2 className="text-xl font-black text-white leading-tight">
            {dadosExibidos.accountName}
          </h2>
          <p className="text-sm text-zinc-400">
            @{dadosExibidos.publicHandle || dadosExibidos.accountName?.toLowerCase().replace(/\s+/g, "")}
          </p>
        </div>

        <p className="text-white text-sm leading-relaxed mb-3">
          {dadosExibidos.bio}
        </p>

        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
          <Calendar size={15} aria-hidden="true" />
          <span>Ingressou em {dadosExibidos.joinedAt || "Outubro de 2026"}</span>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <span className="text-zinc-400">
            <strong className="text-white">14</strong> Seguindo
          </span>
          <span className="text-zinc-400">
            <strong className="text-white">{seguindo ? 29 : 28}</strong> Seguidores
          </span>
        </div>
      </div>

      {/* Abas Estilo X/Twitter */}
      <div className="grid grid-cols-2 border-b border-white/30 text-sm font-bold text-center">
        <button
          type="button"
          onClick={() => setAbaAtiva("posts")}
          className={`py-3.5 hover:bg-zinc-900/60 transition cursor-pointer relative ${
            abaAtiva === "posts" ? "text-white" : "text-zinc-400"
          }`}
        >
          <span>Posts</span>
          {abaAtiva === "posts" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-purple-500 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("curtidas")}
          className={`py-3.5 hover:bg-zinc-900/60 transition cursor-pointer relative ${
            abaAtiva === "curtidas" ? "text-white" : "text-zinc-400"
          }`}
        >
          <span>Fogos</span>
          {abaAtiva === "curtidas" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-purple-500 rounded-full" />
          )}
        </button>
      </div>

      {loadingPosts ? (
        <p className="p-8 text-center text-zinc-400 text-sm">Carregando posts...</p>
      ) : postsExibidos.length === 0 ? (
        <div className="p-10 text-center space-y-2">
          <p className="text-white font-bold text-base">Nenhum post público encontrado</p>
          <p className="text-zinc-400 text-xs max-w-sm mx-auto">
            As publicações públicas de {dadosExibidos.accountName} aparecerão aqui.
          </p>
        </div>
      ) : (
        postsExibidos.map((post) => (
          <GossipCard
            key={post.id}
            post={post}
            onLike={handleDarFogo}
            onDeleteRequest={!visitandoOutroUsuario ? setPostParaDeletar : null}
            onExpire={(id) => setPostsDoPerfil((atuais) => atuais.filter((p) => p.id !== id))}
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