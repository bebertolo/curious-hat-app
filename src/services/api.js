
const API_URL = "https://6ad69d0bf71f154ac486e9a6.mockapi.io/posts";
export async function getPosts() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Falha ao buscar as fofocas no servidor.");
  const data = await response.json();
  const agora = Date.now();

  return data
    .filter((post) => Number(post.expiresAt) > agora)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
}
export async function getPostById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error("Esta fofoca não foi encontrada ou já se autodestruiu!");
  const post = await response.json();

  if (Number(post.expiresAt) <= Date.now()) {
    throw new Error("Tarde demais! O tempo desta fofoca acabou e ela sumiu.");
  }
  return post;
}
export async function createPost(novoPost) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novoPost),
  });
  if (!response.ok) throw new Error("Não foi possível publicar sua fofoca.");
  const criado = await response.json();
  window.dispatchEvent(new Event("curiousHat_postsUpdated"));
  return criado;
}
export async function updatePost(id, dadosAtualizados) {
  const payload = { ...dadosAtualizados };

  if (payload._toggleLikeAction) {
    const acao = payload._toggleLikeAction;
    const likesOriginais = Number(payload._originalLikes) || 0;
    const userKey = getCurrentUserKey();
    const listaAtual = Array.isArray(payload.likedBy) ? payload.likedBy.map(String) : [];

    delete payload._toggleLikeAction;
    delete payload._originalLikes;

    if (acao === "unlike") {
      payload.likes = Math.max(0, likesOriginais - 1);
      payload.likedBy = listaAtual.filter((u) => u !== userKey);
      unmarkPostAsLiked(id);
    } else {
      payload.likes = likesOriginais + 1;
      payload.likedBy = listaAtual.includes(userKey) ? listaAtual : [...listaAtual, userKey];
      markPostAsLiked(id);
    }
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Erro ao atualizar as informações.");
  const atualizado = await response.json();
  window.dispatchEvent(new Event("curiousHat_postsUpdated"));
  return atualizado;
}
export async function deletePost(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erro ao tentar queimar esta fofoca.");
  const deletado = await response.json();
  window.dispatchEvent(new Event("curiousHat_postsUpdated"));
  return deletado;
}
export function getCurrentUserKey() {
  const dados = localStorage.getItem("curiousHat_profile");
  if (!dados) return "visitante";
  const perfil = JSON.parse(dados);
  return String(perfil.userId || perfil.email || perfil.accountName || "visitante");
}
export function hasUserLiked(post) {
  if (!post || !post.id) return false;
  const userKey = getCurrentUserKey();
  const postIdStr = String(post.id);

  const likesDoPerfil = JSON.parse(
    localStorage.getItem(`curiousHat_likes_${userKey}`) || "[]"
  );
  const listaNoPost = Array.isArray(post.likedBy) ? post.likedBy.map(String) : [];

  return likesDoPerfil.includes(postIdStr) || listaNoPost.includes(userKey);
}
export function markPostAsLiked(postId) {
  const userKey = getCurrentUserKey();
  const storageKey = `curiousHat_likes_${userKey}`;
  const postIdStr = String(postId);

  const likesAtuais = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (!likesAtuais.includes(postIdStr)) {
    localStorage.setItem(storageKey, JSON.stringify([...likesAtuais, postIdStr]));
  }
}
export function unmarkPostAsLiked(postId) {
  const userKey = getCurrentUserKey();
  const storageKey = `curiousHat_likes_${userKey}`;
  const postIdStr = String(postId);

  const likesAtuais = JSON.parse(localStorage.getItem(storageKey) || "[]");
  localStorage.setItem(
    storageKey,
    JSON.stringify(likesAtuais.filter((id) => id !== postIdStr))
  );
}
export async function togglePostLike(post) {
  const jaCurtiu = hasUserLiked(post);
  return updatePost(post.id, {
    ...post,
    _toggleLikeAction: jaCurtiu ? "unlike" : "like",
    _originalLikes: Number(post.likes) || 0,
  });
}