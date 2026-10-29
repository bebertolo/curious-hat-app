// Identifica qual perfil está logado no momento
export function getCurrentUserKey() {
  const dados = localStorage.getItem("curiousHat_profile");
  if (!dados) return "visitante";
  const perfil = JSON.parse(dados);
  return perfil.userId || perfil.email || perfil.accountName || "visitante";
}

// Verifica se o perfil atual já deu like neste post
export function hasUserLiked(post) {
  const userKey = getCurrentUserKey();
  const likesDoPerfil = JSON.parse(
    localStorage.getItem(`curiousHat_likes_${userKey}`) || "[]"
  );
  const listaNoPost = Array.isArray(post.likedBy) ? post.likedBy : [];
  return likesDoPerfil.includes(post.id) || listaNoPost.includes(userKey);
}

// Permite apenas 1 like por perfil (se já curtiu, clicar novamente remove o like)
export async function togglePostLike(post) {
  const userKey = getCurrentUserKey();
  const storageKey = `curiousHat_likes_${userKey}`;
  const likesDoPerfil = JSON.parse(localStorage.getItem(storageKey) || "[]");
  const listaNoPost = Array.isArray(post.likedBy) ? post.likedBy : [];

  const jaCurtiu =
    likesDoPerfil.includes(post.id) || listaNoPost.includes(userKey);

  const novaListaNoPost = jaCurtiu
    ? listaNoPost.filter((id) => id !== userKey)
    : [...listaNoPost, userKey];

  const novosLikesDoPerfil = jaCurtiu
    ? likesDoPerfil.filter((id) => id !== post.id)
    : [...likesDoPerfil, post.id];

  const totalAtual = Number(post.likes) || 0;
  const novoTotal = jaCurtiu ? Math.max(0, totalAtual - 1) : totalAtual + 1;

  const atualizado = await updatePost(post.id, {
    ...post,
    likes: novoTotal,
    likedBy: novaListaNoPost,
  });

  localStorage.setItem(storageKey, JSON.stringify(novosLikesDoPerfil));

  return {
    ...atualizado,
    likes: novoTotal,
    likedBy: novaListaNoPost,
  };
}