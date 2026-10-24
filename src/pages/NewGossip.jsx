// src/pages/NewGossip.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { createPost } from "../services/api";
import { HatButton } from "../components/HatButton";

export function NewGossip() {
  const navigate = useNavigate();

  // Verifica se o usuário já criou o perfil
  const perfilSalvo = (() => {
    const dados = localStorage.getItem("curiousHat_profile");
    return dados ? JSON.parse(dados) : null;
  })();

  const [form, setForm] = useState({
    codename: perfilSalvo?.codename || "",
    title: "",
    category: "",
    durationMinutes: "",
    spiciness: "",
    content: "",
  });

  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroApi, setErroApi] = useState("");

  if (!perfilSalvo) {
    return (
      <div className="p-8 text-center space-y-4 border-b border-white/40">
        <div className="w-16 h-16 rounded-full bg-purple-950 border-2 border-purple-400 flex items-center justify-center mx-auto text-2xl">
          🎩
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          Crie seu Perfil Antes de Publicar!
        </h1>
        <p className="text-zinc-300 max-w-md mx-auto text-sm leading-relaxed">
          Para soltar uma fofoca ou comentário no <strong>Curious Hat</strong>, você precisa primeiro escolher o seu <strong>Nome da Conta</strong> e o seu <strong>Codinome Anônimo</strong>.
        </p>
        <div className="pt-2">
          <Link
            to="/perfil"
            className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-full border border-purple-400"
          >
            <UserPlus size={18} aria-hidden="true" />
            <span>Criar Meu Perfil Agora</span>
          </Link>
        </div>
      </div>
    );
  }

  function validarFormulario() {
    const novosErros = {};
    if (!form.codename.trim() || form.codename.trim().length < 3) {
      novosErros.codename = "Informe um codinome com pelo menos 3 caracteres.";
    }
    if (!form.title.trim() || form.title.trim().length < 5) {
      novosErros.title = "O título do babado precisa ter no mínimo 5 caracteres.";
    }
    if (!form.category) {
      novosErros.category = "Selecione uma categoria obrigatória.";
    }
    if (form.durationMinutes === "") {
      novosErros.durationMinutes = "Escolha a duração ou 'Comentário Fixo'.";
    }
    if (!form.spiciness) {
      novosErros.spiciness = "Classifique o nível de impacto da fofoca.";
    }
    if (!form.content.trim() || form.content.trim().length < 15) {
      novosErros.content = "Conte os detalhes! O texto deve ter pelo menos 15 caracteres.";
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      setEnviando(true);
      setErroApi("");

      const agora = Date.now();
      const minutos = Number(form.durationMinutes);

      const expiresAt =
        minutos === 0
          ? agora + 100 * 365 * 24 * 60 * 60 * 1000
          : agora + minutos * 60 * 1000;

      await createPost({
        codename: form.codename.trim().replace(/^@/, ""),
        title: form.title.trim(),
        category: form.category,
        spiciness: form.spiciness,
        content: form.content.trim(),
        likes: 0,
        createdAt: agora,
        expiresAt: expiresAt,
        replies: [],
      });

      navigate("/");
    } catch (err) {
      setErroApi(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="border-b border-white pb-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Soltar Fofoca no Chapéu 🎩</h1>
          <p className="text-zinc-300 text-sm mt-1">
            Publicando como <strong className="text-purple-400">@{perfilSalvo.codename}</strong> ({perfilSalvo.accountName})
          </p>
        </div>
        <img
          src={perfilSalvo.avatarUrl}
          alt="Seu avatar"
          width="44"
          height="44"
          className="w-11 h-11 rounded-full border-2 border-purple-400 object-cover"
        />
      </div>

      {erroApi && (
        <div role="alert" className="mb-6 p-4 border-2 border-red-400 bg-red-950 text-white rounded-xl">
          {erroApi}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="codename" className="block font-bold text-white mb-1">
            1. Seu Codinome Anônimo *
          </label>
          <input
            id="codename"
            type="text"
            value={form.codename}
            onChange={(e) => handleChange("codename", e.target.value)}
            className="w-full bg-zinc-950 border border-purple-400 p-3 rounded-lg text-purple-300 font-bold"
          />
          {erros.codename && (
            <p role="alert" className="text-red-400 text-sm font-semibold mt-1">⚠️ {erros.codename}</p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block font-bold text-white mb-1">
            2. Título / Assunto da Fofoca *
          </label>
          <input
            id="title"
            type="text"
            placeholder="Ex: Viram o que aconteceu no bloco C ontem?"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full bg-black border border-white p-3 rounded-lg text-white"
          />
          {erros.title && (
            <p role="alert" className="text-red-400 text-sm font-semibold mt-1">⚠️ {erros.title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block font-bold text-white mb-1">
              3. Categoria *
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full bg-black border border-white p-3 rounded-lg text-white"
            >
              <option value="">Selecione uma categoria...</option>
              <option value="Faculdade">Faculdade</option>
              <option value="Romance">Romance</option>
              <option value="Treta">Treta</option>
              <option value="Confissão">Confissão</option>
            </select>
            {erros.category && (
              <p role="alert" className="text-red-400 text-sm font-semibold mt-1">⚠️ {erros.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="durationMinutes" className="block font-bold text-white mb-1">
              4. Tempo para Sumir *
            </label>
            <select
              id="durationMinutes"
              value={form.durationMinutes}
              onChange={(e) => handleChange("durationMinutes", e.target.value)}
              className="w-full bg-black border border-red-400 p-3 rounded-lg text-white"
            >
              <option value="">Escolha a duração...</option>
              <option value="0">💬 Comentário (Fica para sempre!)</option>
              <option value="1">⚡ 1 Minuto (Teste rápido)</option>
              <option value="15">15 Minutos</option>
              <option value="60">1 Hora</option>
              <option value="1440">24 Horas</option>
            </select>
            {erros.durationMinutes && (
              <p role="alert" className="text-red-400 text-sm font-semibold mt-1">⚠️ {erros.durationMinutes}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="spiciness" className="block font-bold text-white mb-1">
            5. Nível de Impacto *
          </label>
          <select
            id="spiciness"
            value={form.spiciness}
            onChange={(e) => handleChange("spiciness", e.target.value)}
            className="w-full bg-black border border-white p-3 rounded-lg text-white"
          >
            <option value="">Selecione o nível...</option>
            <option value="Leve">🤫 Leve (Curiosidade)</option>
            <option value="Quente">👀 Quente (Babado Forte)</option>
            <option value="Bomba">🔥 Bomba (Urgente)</option>
          </select>
          {erros.spiciness && (
            <p role="alert" className="text-red-400 text-sm font-semibold mt-1">⚠️ {erros.spiciness}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="content" className="font-bold text-white">
              6. Conteúdo da Fofoca ou Comentário *
            </label>
            <span className="text-xs text-zinc-300">{form.content.length}/280</span>
          </div>
          <textarea
            id="content"
            rows="4"
            maxLength={280}
            placeholder="Conte tudo..."
            value={form.content}
            onChange={(e) => handleChange("content", e.target.value)}
            className="w-full bg-black border border-white p-3 rounded-lg text-white"
          />
          {erros.content && (
            <p role="alert" className="text-red-400 text-sm font-semibold mt-1">⚠️ {erros.content}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/30">
          <HatButton variant="outline" onClick={() => navigate("/")}>
            Cancelar
          </HatButton>
          <HatButton type="submit" variant="purple" disabled={enviando}>
            {enviando ? "Publicando..." : "Publicar no Curious Hat"}
          </HatButton>
        </div>
      </form>
    </div>
  );
}