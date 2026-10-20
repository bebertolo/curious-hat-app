// src/services/api.js

// ⚠️ SUBSTITUA ESTA URL PELA DO SEU MOCKAPI.IO
const API_URL = "https://6ad69d0bf71f154ac486e9a6.mockapi.io/posts";

// 1. GET - Listar todas as fofocas ativas
export async function getPosts() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Falha ao buscar as fofocas no servidor.");
  const data = await response.json();
  const agora = Date.now();

  return data
    .filter((post) => Number(post.expiresAt) > agora)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
}

// 2. GET por ID - Buscar uma fofoca específica
export async function getPostById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error("Esta fofoca não foi encontrada ou já se autodestruiu!");
  const post = await response.json();

  if (Number(post.expiresAt) <= Date.now()) {
    throw new Error("Tarde demais! O tempo desta fofoca acabou e ela sumiu.");
  }
  return post;
}

// 3. POST - Criar nova fofoca
export async function createPost(novoPost) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novoPost),
  });
  if (!response.ok) throw new Error("Não foi possível publicar sua fofoca.");
  return response.json();
}

// 4. PUT - Atualizar fofoca (likes, tempo ou respostas)
export async function updatePost(id, dadosAtualizados) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosAtualizados),
  });
  if (!response.ok) throw new Error("Erro ao atualizar as informações.");
  return response.json();
}

// 5. DELETE - Queimar fofoca
export async function deletePost(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Erro ao tentar queimar esta fofoca.");
  return response.json();
}