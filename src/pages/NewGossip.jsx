// src/pages/NewGossip.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../services/api";
import { HatButton } from "../components/HatButton";

export function NewGossip() {
  const navigate = useNavigate();

  // Estado dos 6 campos do formulário
  const [form, setForm] = useState({
    codename: "",
    title: "",
    category: "",
    durationMinutes: "",
    spiciness: "",
    content: "",
  });

  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroApi, setErroApi] = useState("");

  // Função que valida campo por campo antes de enviar
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
    if (!form.durationMinutes) {
      novosErros.durationMinutes = "Escolha em quanto tempo o post vai se autodestruir.";
    }
    if (!form.spiciness) {
      novosErros.spiciness = "Classifique o nível de impacto da fofoca.";
    }
    if (!form.content.trim() || form.content.trim().length < 15) {
      novosErros.content = "Conte os detalhes! A fofoca deve ter pelo menos 15 caracteres.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    // Limpa o erro daquele campo assim que o usuário começa a corrigir
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
      const tempoEmMs = Number(form.durationMinutes) * 60 * 1000;

      await createPost({
        codename: form.codename.trim().replace(/^@/, ""),
        title: form.title.trim(),
        category: form.category,
        spiciness: form.spiciness,
        content: form.content.trim(),
        likes: 0,
        createdAt: agora,
        expiresAt: agora + tempoEmMs,
        replies: [],
      });

      // Redireciona de volta para a Timeline após publicar com sucesso
      navigate("/");
    } catch (err) {
      setErroApi(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="border-b border-white pb-4 mb-6">
        <h1 className="text-2xl font-extrabold text-white">Soltar Fofoca no Chapéu 🎩</h1>
        <p className="text-zinc-300 text-sm mt-1">
          Preencha todos os campos obrigatórios (*). Sua identidade real não é salva.
        </p>
      </div>

      {erroApi && (
        <div role="alert" className="mb-6 p-4 border-2 border-red-400 bg-red-950 text-white rounded-xl">
          {erroApi}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* CAMPO 1: Codinome */}
        <div>
          <label htmlFor="codename" className="block font-bold text-white mb-1">
            1. Seu Codinome Anônimo *
          </label>
          <input
            id="codename"
            type="text"
            placeholder="Ex: CorvoDaUnijui, MisterioRoxo..."
            value={form.codename}
            onChange={(e) => handleChange("codename", e.target.value)}
            aria-invalid={!!erros.codename}
            aria-describedby={erros.codename ? "erro-codename" : undefined}
            className="w-full bg-black border border-white p-3 rounded-lg text-white"
          />
          {erros.codename && (
            <p id="erro-codename" role="alert" className="text-red-400 text-sm font-semibold mt-1">
              ⚠️ {erros.codename}
            </p>
          )}
        </div>

        {/* CAMPO 2: Título */}
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
            aria-invalid={!!erros.title}
            aria-describedby={erros.title ? "erro-title" : undefined}
            className="w-full bg-black border border-white p-3 rounded-lg text-white"
          />
          {erros.title && (
            <p id="erro-title" role="alert" className="text-red-400 text-sm font-semibold mt-1">
              ⚠️ {erros.title}
            </p>
          )}
        </div>

        {/* CAMPOS 3 e 4: Categoria e Tempo de Expiração */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block font-bold text-white mb-1">
              3. Categoria *
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              aria-invalid={!!erros.category}
              aria-describedby={erros.category ? "erro-category" : undefined}
              className="w-full bg-black border border-white p-3 rounded-lg text-white"
            >
              <option value="">Selecione uma categoria...</option>
              <option value="Romance">Romance</option>
              <option value="Treta">Treta</option>
              <option value="Traição">Traição</option>
              <option value="Confissão">Confissão</option>
              <option value="Informações">Informações</option>
              <option value="Outros">Outros</option>

            </select>
            {erros.category && (
              <p id="erro-category" role="alert" className="text-red-400 text-sm font-semibold mt-1">
                ⚠️ {erros.category}
              </p>
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
              aria-invalid={!!erros.durationMinutes}
              aria-describedby={erros.durationMinutes ? "erro-duration" : undefined}
              className="w-full bg-black border border-red-400 p-3 rounded-lg text-white"
            >
              <option value="">Escolha a duração...</option>
              <option value="1">⚡ 1 Minuto</option>
              <option value="15">15 Minutos</option>
              <option value="60">1 Hora</option>
              <option value="1440">24 Horas</option>
              <option value="0">💬 Comentário</option>
            </select>
            {erros.durationMinutes && (
              <p id="erro-duration" role="alert" className="text-red-400 text-sm font-semibold mt-1">
                ⚠️ {erros.durationMinutes}
              </p>
            )}
          </div>
        </div>

        {/* CAMPO 5: Nível de Impacto */}
        <div>
          <label htmlFor="spiciness" className="block font-bold text-white mb-1">
            5. Nível de Impacto (Termômetro) *
          </label>
          <select
            id="spiciness"
            value={form.spiciness}
            onChange={(e) => handleChange("spiciness", e.target.value)}
            aria-invalid={!!erros.spiciness}
            aria-describedby={erros.spiciness ? "erro-spiciness" : undefined}
            className="w-full bg-black border border-white p-3 rounded-lg text-white"
          >
            <option value="">Selecione o nível...</option>
            <option value="Leve">🤫 Leve (Curiosidade)</option>
            <option value="Quente">👀 Quente (Babado Forte)</option>
            <option value="Bomba">🔥 Bomba (Urgente)</option>
          </select>
          {erros.spiciness && (
            <p id="erro-spiciness" role="alert" className="text-red-400 text-sm font-semibold mt-1">
              ⚠️ {erros.spiciness}
            </p>
          )}
        </div>

        {/* CAMPO 6: Conteúdo da Fofoca */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="content" className="font-bold text-white">
              6. Conteúdo da Fofoca *
            </label>
            <span className="text-xs text-zinc-300">{form.content.length}/280</span>
          </div>
          <textarea
            id="content"
            rows="4"
            maxLength={280}
            placeholder="Conte tudo sem revelar quem você é..."
            value={form.content}
            onChange={(e) => handleChange("content", e.target.value)}
            aria-invalid={!!erros.content}
            aria-describedby={erros.content ? "erro-content" : undefined}
            className="w-full bg-black border border-white p-3 rounded-lg text-white"
          />
          {erros.content && (
            <p id="erro-content" role="alert" className="text-red-400 text-sm font-semibold mt-1">
              ⚠️ {erros.content}
            </p>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/30">
          <HatButton variant="outline" onClick={() => navigate("/")}>
            Cancelar
          </HatButton>
          <HatButton type="submit" variant="purple" disabled={enviando}>
            {enviando ? "Publicando..." : "Publicar Fofoca"}
          </HatButton>
        </div>
      </form>
    </div>
  );
}