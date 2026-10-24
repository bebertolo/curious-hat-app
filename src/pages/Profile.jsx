// src/pages/Profile.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit3,
  Shield,
  Calendar,
  Plus,
  UserCheck,
  Mail,
  Cake,
  LogOut,
} from "lucide-react";
import { getPosts, updatePost, deletePost } from "../services/api";
import { GossipCard } from "../components/GossipCard";
import { HatButton } from "../components/HatButton";
import { ConfirmModal } from "../components/ConfirmModal";

const AVATAR_PADRAO =
  "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=CuriousHat&backgroundColor=6b21a8";

export function Profile({ onProfileSaved, onLogout }) {
  const navigate = useNavigate();
  const fileInputAvatarRef = useRef(null);
  const fileInputBannerRef = useRef(null);

  const [perfilSalvo, setPerfilSalvo] = useState(() => {
    const dados = localStorage.getItem("curiousHat_profile");
    return dados ? JSON.parse(dados) : null;
  });

  // Se ainda não tem perfil cadastrado, abre direto no formulário de cadastro/edição
  const [editando, setEditando] = useState(!perfilSalvo);

  const [form, setForm] = useState({
    fullName: perfilSalvo?.fullName || "",
    email: perfilSalvo?.email || "",
    birthDate: perfilSalvo?.birthDate || "",
    accountName: perfilSalvo?.accountName || "",
    codename: perfilSalvo?.codename || "",
    password: perfilSalvo?.password || "",
    bio: perfilSalvo?.bio || "Observando tudo em silêncio no Curious Hat...",
    avatarUrl: perfilSalvo?.avatarUrl || AVATAR_PADRAO,
    bannerImage: perfilSalvo?.bannerImage || "",
    joinedAt: perfilSalvo?.joinedAt || "Outubro de 2026",
  });

  const [erros, setErros] = useState({});
  const [meusPosts, setMeusPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postParaDeletar, setPostParaDeletar] = useState(null);

  useEffect(() => {
    if (perfilSalvo) {
      carregarMeusPosts(perfilSalvo);
    }
  }, [perfilSalvo]);

  async function carregarMeusPosts(perfil) {
    try {
      setLoadingPosts(true);
      const todos = await getPosts();
      const filtrados = todos.filter(
        (p) =>
          p.codename?.toLowerCase() === perfil.codename?.toLowerCase() ||
          p.codename?.toLowerCase() === perfil.accountName?.toLowerCase()
      );
      setMeusPosts(filtrados);
    } catch {
      // Silencioso se a API estiver vazia
    } finally {
      setLoadingPosts(false);
    }
  }

  // Converte a foto escolhida no PC ou Celular para imagem real (comprimida para caber no navegador)
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
      novosErros.accountName = "Escolha como seu nome aparecerá no site (mínimo 3 letras).";
    }
    if (!form.codename.trim() || form.codename.trim().length < 3) {
      novosErros.codename = "Escolha seu Vulgo para postagens anônimas (mínimo 3 letras).";
    }
    if (!form.password || form.password.length < 6) {
      novosErros.password = "Crie uma senha de acesso com pelo menos 6 caracteres.";
    }
    if (!form.bio.trim() || form.bio.trim().length < 5) {
      novosErros.bio = "Escreva uma bio curta para o seu perfil.";
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

  function handleSalvar(e) {
    e.preventDefault();
    if (!validarFormulario()) return;

    const dadosFinais = {
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      accountName: form.accountName.trim(),
      codename: form.codename.trim().replace(/^@/, "").replace(/\s+/g, ""),
      bio: form.bio.trim(),
    };

    localStorage.setItem("curiousHat_profile", JSON.stringify(dadosFinais));
    setPerfilSalvo(dadosFinais);
    setEditando(false);

    if (onProfileSaved) {
      onProfileSaved(dadosFinais);
    }
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

  // MODO 1: TELA DE CADASTRO INICIAL OU EDIÇÃO DE PERFIL
  if (editando) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="border-b border-white pb-4 mb-6 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-white">
            {perfilSalvo ? "Editar Meu Perfil 🎩" : "Bem-vindo ao Curious Hat 🎩"}
          </h1>
          <p className="text-zinc-300 text-sm mt-1">
            {perfilSalvo
              ? "Passe o cursor sobre a foto ou capa para enviar uma imagem do seu dispositivo."
              : "Cadastre suas informações abaixo para liberar o acesso ao site."}
          </p>
        </div>

        {/* ÁREA DE FOTO DE PERFIL E PAPEL DE PAREDE COM EFEITO HOVER "+" */}
        <div className="mb-6 border border-white/40 rounded-2xl overflow-hidden bg-zinc-950">
          {/* Papel de Parede (Capa) Clicável */}
          <div
            onClick={() => fileInputBannerRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputBannerRef.current?.click()}
            aria-label="Alterar imagem de papel de parede"
            title="Clique para escolher um papel de parede dos seus arquivos"
            className="relative h-36 sm:h-44 w-full bg-gradient-to-r from-purple-900 via-fuchsia-900 to-red-900 cursor-pointer group overflow-hidden"
          >
            {form.bannerImage && (
              <img
                src={form.bannerImage}
                alt="Papel de parede do perfil"
                className="w-full h-full object-cover"
              />
            )}
            {/* Camada opaca + ícone "+" branco ao passar o mouse na capa */}
            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
              <Plus size={36} strokeWidth={2.5} className="text-white" />
              <span className="text-xs font-bold mt-1">Alterar Papel de Parede</span>
            </div>
            <input
              ref={fileInputBannerRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "bannerImage", 900)}
              className="hidden"
            />
          </div>

          {/* Foto de Perfil Redonda com Efeito Opaco e "+" Branco ao passar o cursor */}
          <div className="px-5 pb-4 flex items-end justify-between -mt-14 relative">
            <div
              onClick={() => fileInputAvatarRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && fileInputAvatarRef.current?.click()}
              aria-label="Alterar foto de perfil escolhendo dos arquivos"
              title="Clique para enviar uma foto do computador ou celular"
              className="relative w-28 h-28 rounded-full border-4 border-black bg-zinc-900 overflow-hidden cursor-pointer group shadow-xl"
            >
              <img
                src={form.avatarUrl}
                alt="Foto de perfil"
                className="w-full h-full object-cover group-hover:opacity-40 transition-opacity"
              />
              {/* Sinal de "+" Branco que aparece ao passar o mouse em cima */}
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

            <span className="text-xs text-zinc-300 italic">
              Passe o mouse na foto e clique no <strong>+</strong> para mudar
            </span>
          </div>
        </div>

        {/* FORMULÁRIO COM TODOS OS DADOS DO CADASTRO */}
        <form onSubmit={handleSalvar} noValidate className="space-y-4">
          {/* 1. Nome Completo */}
          <div>
            <label htmlFor="fullName" className="block font-bold text-white text-sm mb-1">
              1. Nome Completo *
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Ex: Bernardo Teleken"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="w-full bg-black border border-white p-3 rounded-xl text-white"
            />
            {erros.fullName && (
              <p role="alert" className="text-red-400 text-xs font-bold mt-1">
                ⚠️ {erros.fullName}
              </p>
            )}
          </div>

          {/* 2. E-mail e 3. Data de Nascimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block font-bold text-white text-sm mb-1">
                2. E-mail *
              </label>
              <input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full bg-black border border-white p-3 rounded-xl text-white"
              />
              {erros.email && (
                <p role="alert" className="text-red-400 text-xs font-bold mt-1">
                  ⚠️ {erros.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="birthDate" className="block font-bold text-white text-sm mb-1">
                3. Data de Nascimento *
              </label>
              <input
                id="birthDate"
                type="date"
                value={form.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                className="w-full bg-black border border-white p-3 rounded-xl text-white"
              />
              {erros.birthDate && (
                <p role="alert" className="text-red-400 text-xs font-bold mt-1">
                  ⚠️ {erros.birthDate}
                </p>
              )}
            </div>
          </div>

          {/* 4. Nome no Site e 5. Vulgo (Nome Anônimo) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="accountName" className="block font-bold text-white text-sm mb-1">
                4. Nome no Site (Público) *
              </label>
              <input
                id="accountName"
                type="text"
                placeholder="Ex: Bernardo"
                value={form.accountName}
                onChange={(e) => handleChange("accountName", e.target.value)}
                className="w-full bg-black border border-white p-3 rounded-xl text-white"
              />
              {erros.accountName && (
                <p role="alert" className="text-red-400 text-xs font-bold mt-1">
                  ⚠️ {erros.accountName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="codename" className="block font-bold text-purple-400 text-sm mb-1">
                5. Vulgo (Para Nome Anônimo 🎩) *
              </label>
              <input
                id="codename"
                type="text"
                placeholder="Ex: SombraDaNoite"
                value={form.codename}
                onChange={(e) => handleChange("codename", e.target.value)}
                className="w-full bg-black border border-purple-400 p-3 rounded-xl text-white"
              />
              {erros.codename && (
                <p role="alert" className="text-red-400 text-xs font-bold mt-1">
                  ⚠️ {erros.codename}
                </p>
              )}
            </div>
          </div>

          {/* 6. Senha de Acesso */}
          <div>
            <label htmlFor="password" className="block font-bold text-white text-sm mb-1">
              6. Senha da Conta *
            </label>
            <input
              id="password"
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full bg-black border border-white p-3 rounded-xl text-white"
            />
            {erros.password && (
              <p role="alert" className="text-red-400 text-xs font-bold mt-1">
                ⚠️ {erros.password}
              </p>
            )}
          </div>

          {/* 7. Bio do Perfil */}
          <div>
            <label htmlFor="bio" className="block font-bold text-white text-sm mb-1">
              7. Bio / Recado do Perfil *
            </label>
            <textarea
              id="bio"
              rows="2"
              maxLength={160}
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="w-full bg-black border border-white p-3 rounded-xl text-white"
            />
            {erros.bio && (
              <p role="alert" className="text-red-400 text-xs font-bold mt-1">
                ⚠️ {erros.bio}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/30">
            {perfilSalvo && (
              <HatButton variant="outline" onClick={() => setEditando(false)}>
                Cancelar
              </HatButton>
            )}
            <HatButton type="submit" variant="purple">
              <UserCheck size={18} aria-hidden="true" />
              <span>{perfilSalvo ? "Salvar Alterações" : "Concluir Cadastro e Entrar"}</span>
            </HatButton>
          </div>
        </form>
      </div>
    );
  }

  // MODO 2: PÁGINA DO PERFIL ESTILO X (ANTIGO TWITTER)
  return (
    <div>
      {/* Papel de Parede */}
      <div className="h-40 sm:h-52 w-full border-b border-white/40 bg-gradient-to-r from-purple-900 via-fuchsia-900 to-red-900 overflow-hidden">
        {perfilSalvo.bannerImage && (
          <img
            src={perfilSalvo.bannerImage}
            alt="Papel de parede do perfil"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Cabeçalho do Perfil */}
      <div className="px-4 sm:px-6 pb-5 border-b border-white">
        <div className="flex flex-wrap justify-between items-end -mt-14 sm:-mt-16 mb-3 gap-2">
          {/* Clicar na foto aqui também abre direto a edição para trocá-la */}
          <div
            onClick={() => setEditando(true)}
            title="Clique para editar foto e perfil"
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-black bg-zinc-900 overflow-hidden cursor-pointer group shadow-lg"
          >
            <img
              src={perfilSalvo.avatarUrl}
              alt={`Foto de ${perfilSalvo.accountName}`}
              className="w-full h-full object-cover group-hover:opacity-40 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <Plus size={36} strokeWidth={3} className="text-white" />
            </div>
          </div>

          <div className="flex gap-2">
            <HatButton variant="outline" onClick={() => setEditando(true)}>
              <Edit3 size={16} aria-hidden="true" />
              <span>Editar Perfil</span>
            </HatButton>
            {onLogout && (
              <HatButton
                variant="red"
                onClick={onLogout}
                ariaLabel="Sair da conta e voltar para tela de cadastro"
              >
                <LogOut size={16} aria-hidden="true" />
                <span>Sair</span>
              </HatButton>
            )}
          </div>
        </div>

        {/* Nome no Site e Vulgo Anônimo */}
        <h1 className="text-2xl font-black text-white leading-tight">
          {perfilSalvo.accountName}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-1 mb-3">
          <span className="text-purple-400 font-bold text-sm">
            🎩 Vulgo: @{perfilSalvo.codename}
          </span>
          <span className="text-xs bg-zinc-900 border border-white/30 text-zinc-300 px-2.5 py-0.5 rounded-full">
            Nome completo: {perfilSalvo.fullName}
          </span>
        </div>

        {/* Bio */}
        <p className="text-zinc-100 text-sm leading-relaxed mb-4">
          {perfilSalvo.bio}
        </p>

        {/* Detalhes da Conta (E-mail, Data de Nascimento e Entrada) */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 pt-2 border-t border-white/20">
          <span className="flex items-center gap-1">
            <Mail size={14} className="text-purple-400" aria-hidden="true" />
            {perfilSalvo.email}
          </span>
          {perfilSalvo.birthDate && (
            <span className="flex items-center gap-1">
              <Cake size={14} className="text-red-400" aria-hidden="true" />
              Nasc.: {perfilSalvo.birthDate.split("-").reverse().join("/")}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={14} className="text-purple-400" aria-hidden="true" />
            Entrou em {perfilSalvo.joinedAt}
          </span>
        </div>
      </div>

      {/* Histórico de Publicações do Usuário */}
      <div className="border-b border-white/40 px-6 py-3 bg-zinc-950 flex justify-between items-center">
        <span className="font-extrabold text-purple-400 border-b-2 border-purple-400 pb-2 text-sm">
          Minhas Publicações ({meusPosts.length})
        </span>
        <span className="text-xs text-zinc-400 flex items-center gap-1">
          <Shield size={13} aria-hidden="true" /> Públicas e Anônimas
        </span>
      </div>

      {loadingPosts ? (
        <p className="p-8 text-center text-zinc-300">Carregando suas publicações...</p>
      ) : meusPosts.length === 0 ? (
        <div className="p-10 text-center space-y-3">
          <p className="text-zinc-300 text-sm">
            Você ainda não fez nenhuma publicação. Vá até a Página Inicial para postar!
          </p>
          <HatButton variant="purple" onClick={() => navigate("/")} className="mx-auto">
            Ir para a Página Inicial
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