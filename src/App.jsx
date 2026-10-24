// src/App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Feed } from "./pages/Feed";
import { SearchPage } from "./pages/SearchPage";
import { GossipDetail } from "./pages/GossipDetail";
import { Profile } from "./pages/Profile";

export default function App() {
  const [perfilAtivo, setPerfilAtivo] = useState(() => {
    const dados = localStorage.getItem("curiousHat_profile");
    return dados ? JSON.parse(dados) : null;
  });

  function handleLogout() {
    localStorage.removeItem("curiousHat_profile");
    setPerfilAtivo(null);
  }

  return (
    <BrowserRouter>
      {/* SE NÃO TIVER CADASTRO AINDA, MOSTRA APENAS A TELA DE CADASTRO OBRIGATÓRIO */}
      {!perfilAtivo ? (
        <div className="min-h-screen bg-black text-white flex flex-col justify-center py-8 px-4">
          <div className="max-w-2xl w-full mx-auto border border-white/40 rounded-2xl bg-black shadow-[0_0_30px_rgba(147,51,234,0.2)]">
            <Profile onProfileSaved={(novoPerfil) => setPerfilAtivo(novoPerfil)} />
          </div>
        </div>
      ) : (
        /* QUANDO CADASTRADO, LIBERA O SITE COMPLETO */
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row max-w-5xl mx-auto border-x border-white/40">
          <Navbar />

          <main className="flex-1 min-h-screen bg-black">
            <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/buscar" element={<SearchPage />} />
              <Route path="/fofoca/:id" element={<GossipDetail />} />
              <Route
                path="/perfil"
                element={
                  <Profile
                    onProfileSaved={(novoPerfil) => setPerfilAtivo(novoPerfil)}
                    onLogout={handleLogout}
                  />
                }
              />
            </Routes>
          </main>
        </div>
      )}
    </BrowserRouter>
  );
}
