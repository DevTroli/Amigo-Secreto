"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [etapa, setEtapa] = useState("cadastro");
  const [participantes, setParticipantes] = useState([]);
  const [nome, setNome] = useState("");
  const [segredo, setSegredo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  // Carrega participantes do banco ao montar
  useEffect(() => {
    carregarParticipantes();
  }, []);

  const baseInput =
    "w-full h-11 sm:h-12 rounded-2xl bg-[#0b1220] border border-[#34425d] px-4 text-xs sm:text-sm font-mono text-[#f9fff4] placeholder:text-[#8b95b5] focus:outline-none focus:ring-2 focus:ring-[#f7c566] focus:border-[#f7c566] transition";

  const primaryButton =
    "w-full h-11 sm:h-12 rounded-full bg-gradient-to-r from-[#d7263d] via-[#f7c566] to-[#9be15d] text-[#240b0b] font-mono text-sm sm:text-base font-bold tracking-[0.2em] border border-white/40 shadow-[0_0_0_1px_rgba(0,0,0,0.7),0_18px_40px_rgba(247,197,102,0.7)] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:translate-y-[1px] transition";

  const secondaryButton =
    "h-10 px-6 rounded-full bg-[#050b17] text-[#e6f0ff] font-mono text-xs tracking-[0.18em] border border-[#34425d] hover:bg-[#10172a] disabled:opacity-40 flex items-center justify-center gap-2";

  // ======== LÓGICA CORRIGIDA ========

  const carregarParticipantes = async () => {
    try {
      const response = await fetch("/api/participantes/listar");
      const data = await response.json();

      if (data.sucesso) {
        setParticipantes(data.participantes);
      }
    } catch (error) {
      console.error("Erro ao carregar participantes:", error);
    }
  };

  // ✅ NOVO: Adicionar participante DIRETO no banco (etapa CADASTRO)
  const adicionarParticipante = async () => {
    if (!nome.trim() || !segredo.trim()) {
      setMensagem("❌ Preencha nome e segredo!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/participantes/adicionar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          segredo: segredo.trim(),
        }),
      });

      const data = await response.json();

      if (data.sucesso) {
        setMensagem(`✅ ${data.participante.nome} cadastrado!`);
        setNome("");
        setSegredo("");

        // Recarrega a lista
        await carregarParticipantes();

        setTimeout(() => setMensagem(""), 3000);
      } else {
        setMensagem(data.erro || "❌ Erro ao cadastrar");
      }
    } catch (error) {
      setMensagem("❌ Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOVO: Fazer sorteio (sem adicionar, só faz a lógica circular)
  const realizarSorteio = async () => {
    if (participantes.length < 4) {
      setMensagem("❌ Mínimo 4 participantes!");
      return;
    }
    if (participantes.length % 2 !== 0) {
      setMensagem("❌ Número de participantes deve ser PAR!");
      return;
    }

    setLoading(true);
    setMensagem("🎲 Sorteando...");

    try {
      const response = await fetch("/api/sorteio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: participantes.map((p) => p.id), // Envia apenas os IDs
        }),
      });

      const data = await response.json();

      if (data.sucesso) {
        setMensagem("🎉 Sorteio realizado! Qualquer pessoa pode consultar.");

        setTimeout(() => {
          setEtapa("consulta");
          setMensagem("");
        }, 2000);
      } else {
        setMensagem(data.erro || "❌ Erro ao fazer sorteio");
      }
    } catch (error) {
      setMensagem("❌ Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const consultarResultado = async () => {
    if (!nome.trim() || !segredo.trim()) {
      setMensagem("❌ Preencha seu nome e segredo!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/consultar?nome=${encodeURIComponent(
          nome.trim(),
        )}&segredo=${encodeURIComponent(segredo.trim())}`,
      );
      const data = await response.json();

      if (data.sucesso) {
        setMensagem(`🎁 Você tirou: ${data.tirou}`);
      } else {
        setMensagem(data.erro || "❌ Dados incorretos!");
      }

      setNome("");
      setSegredo("");
    } catch (error) {
      setMensagem("❌ Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const limparTudoLocal = () => {
    setNome("");
    setSegredo("");
    setMensagem("");
  };

  const novoSorteio = async () => {
    setLoading(true);
    setMensagem("");

    try {
      const resp = await fetch("/api/reset", { method: "POST" });
      const data = await resp.json();

      if (!resp.ok || !data.sucesso) {
        setMensagem(data.erro || "❌ Erro ao limpar");
        return;
      }

      limparTudoLocal();
      setParticipantes([]);
      setEtapa("cadastro");
      setMensagem("🧹 Tudo limpo! Comece um novo sorteio.");
      setTimeout(() => setMensagem(""), 2500);
    } catch (error) {
      setMensagem("❌ Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const Breadcrumb = () => {
    const steps = [
      { id: "cadastro", label: "CADASTRO" },
      { id: "sorteio", label: "SORTEIO" },
      { id: "consulta", label: "CONSULTA" },
    ];

    return (
      <nav className="flex items-center justify-between mb-8 font-mono text-[10px] sm:text-xs tracking-[0.18em] text-[#e6f0ff]">
        {steps.map((step, index) => {
          const isActive = etapa === step.id;
          const isClickable =
            step.id === "cadastro" ||
            (step.id === "sorteio" && participantes.length >= 4) ||
            step.id === "consulta";

          return (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              {index > 0 && (
                <div className="h-px flex-1 bg-gradient-to-r from-[#34425d] to-[#9be15d]/70" />
              )}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && setEtapa(step.id)}
                className={[
                  "px-3 py-2 rounded-full border font-mono transition",
                  isActive
                    ? "bg-[#177245] text-[#fdf7e6] border-[#9be15d]"
                    : "bg-[#050b17] text-[#e6f0ff] border-[#34425d] hover:bg-[#0d1324] disabled:opacity-30 disabled:cursor-default",
                ].join(" ")}
              >
                {step.label}
              </button>
            </div>
          );
        })}
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05040D] via-[#130b2b] to-[#02131d] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl flex flex-col gap-10">
        {/* HEADER */}
        <header className="flex items-center gap-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#177245] via-[#d7263d] to-[#f7c566] shadow-[0_0_45px_rgba(247,197,102,0.75)] flex items-center justify-center border border-white/40">
            <span className="text-3xl">🎄</span>
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[0.18em] text-white">
              AMIGO SECRETO
            </h1>
            <p className="mt-3 inline-flex items-center gap-2 text-base sm:text-lg font-mono text-[#fdf7e6] bg-[#050b17]/80 px-5 py-2 rounded-full border border-[#34425d]">
              <span>🎅</span>
              {etapa === "cadastro" &&
                "Cadastre-se aqui! Todos na mesma página"}
              {etapa === "sorteio" && "Revise e confirme o sorteio"}
              {etapa === "consulta" &&
                "Digite seu nome e segredo para ver quem você tirou"}
            </p>
          </div>
        </header>

        {/* CARD PRINCIPAL */}
        <main className="bg-[#060814]/90 border border-[#233044] rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.85)] px-6 sm:px-10 md:px-12 lg:px-16 py-10 sm:py-12 flex flex-col gap-8">
          <Breadcrumb />

          {mensagem && (
            <div>
              <div
                className={`w-full rounded-2xl px-6 py-4 text-center font-mono text-base sm:text-lg border-2 ${
                  mensagem.includes("✅") ||
                  mensagem.includes("🎉") ||
                  mensagem.includes("🎁") ||
                  mensagem.includes("🧹")
                    ? "bg-[#071b13] text-[#e1ffe9] border-[#9be15d]"
                    : "bg-[#3b1020] text-[#ffd1df] border-[#d7263d]"
                }`}
              >
                {mensagem}
              </div>
            </div>
          )}

          {/* ETAPA CADASTRO */}
          {etapa === "cadastro" && (
            <section className="mt-2 sm:mt-4 flex flex-col gap-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <label className="flex items-center gap-2 font-mono text-xs sm:text-sm text-[#f7fbe9] mb-2 uppercase tracking-[0.18em]">
                    <span className="text-base text-[#9be15d]">👤</span>
                    Seu nome
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      document.getElementById("segredo-input")?.focus()
                    }
                    placeholder="João Silva"
                    className={baseInput}
                  />
                </div>

                <div className="flex-1">
                  <label className="flex items-center gap-2 font-mono text-xs sm:text-sm text-[#f7fbe9] mb-2 uppercase tracking-[0.18em]">
                    <span className="text-base text-[#f05b5b]">🔒</span>
                    Seu segredo
                  </label>
                  <input
                    id="segredo-input"
                    type="password"
                    value={segredo}
                    onChange={(e) => setSegredo(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && adicionarParticipante()
                    }
                    placeholder="Data especial, apelido..."
                    className={baseInput}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={adicionarParticipante}
                disabled={loading}
                className={primaryButton}
              >
                {loading ? "⏳ CADASTRANDO..." : "+ CADASTRAR-SE"}
              </button>

              {participantes.length > 0 && (
                <div className="flex flex-col gap-6">
                  <div className="rounded-2xl border border-[#233044] bg-[#050812]/90 px-4 sm:px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-mono text-[#9be15d] uppercase tracking-widest">
                        👥 Participantes cadastrados
                      </h3>
                      <span className="text-lg font-bold text-[#f7c566]">
                        {participantes.length}
                      </span>
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-2">
                      {participantes.map((p, i) => (
                        <div
                          key={p.id}
                          className="h-10 flex items-center gap-3 rounded-xl bg-[#0b1220] px-4 text-xs sm:text-sm font-mono text-[#f1e9ff] border border-transparent hover:border-[#f7c566] transition"
                        >
                          <span className="w-6 text-center text-[#9be15d]">
                            {i + 1}
                          </span>
                          <span className="truncate">{p.nome}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#34425d] bg-[#0a1015]/80 px-4 sm:px-5 py-3 text-center">
                    <p className="font-mono text-xs sm:text-sm text-[#e6f0ff]">
                      {participantes.length < 4
                        ? `❌ Faltam ${4 - participantes.length} para um mínimo de 4 participantes`
                        : participantes.length % 2 !== 0
                          ? `❌ ${participantes.length} é ímpar! Mais 1 precisa se cadastrar`
                          : `✅ ${participantes.length} participantes prontos para sorteio!`}
                    </p>
                  </div>

                  <div className="mt-2 flex gap-4">
                    <button
                      onClick={() => setEtapa("sorteio")}
                      disabled={
                        participantes.length < 4 ||
                        participantes.length % 2 !== 0
                      }
                      className={primaryButton}
                    >
                      PROSSEGUIR PARA SORTEIO 🎲
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ETAPA SORTEIO */}
          {etapa === "sorteio" && (
            <section className="mt-4 flex flex-col items-center gap-8 text-center">
              <div className="flex flex-col items-center gap-4 max-w-xl">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-[#d7263d] via-[#f7c566] to-[#9be15d] shadow-[0_0_45px_rgba(247,197,102,0.75)] flex items-center justify-center border border-white/40">
                  <span className="text-3xl md:text-4xl">🎲</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-[0.18em]">
                  CONFIRMAR SORTEIO
                </h2>
                <p className="font-mono text-xs md:text-sm text-[#e6f0ff] leading-relaxed">
                  {participantes.length} participantes cadastrados. Ao
                  confirmar, o sorteio será realizado e todos poderão consultar
                  em qualquer dispositivo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-xl mt-2">
                <button
                  onClick={() => setEtapa("cadastro")}
                  disabled={loading}
                  className={secondaryButton}
                >
                  ← VOLTAR
                </button>

                <button
                  onClick={realizarSorteio}
                  disabled={loading}
                  className={primaryButton}
                >
                  {loading ? "🎲 SORTEANDO..." : "CONFIRMAR SORTEIO"}
                </button>

                <button
                  type="button"
                  onClick={novoSorteio}
                  disabled={loading}
                  className={secondaryButton}
                >
                  🧹 NOVO SORTEIO
                </button>
              </div>
            </section>
          )}

          {/* ETAPA CONSULTA */}
          {etapa === "consulta" && (
            <section className="flex flex-col items-center gap-12 mt-10">
              <div className="flex flex-col items-center text-center gap-4 max-w-2xl">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#177245] via-[#d7263d] to-[#f7c566] shadow-[0_0_45px_rgba(247,197,102,0.75)] flex items-center justify-center border border-white/40">
                  <span className="text-3xl">🎁</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-[0.25em]">
                  DESCUBRA SEU AMIGO
                </h2>
              </div>

              <div className="w-full max-w-xl rounded-3xl bg-[#050812]/90 border border-[#254034] px-6 sm:px-10 py-9 sm:py-11 flex flex-col gap-7 shadow-[0_26px_90px_rgba(0,0,0,0.9)]">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-mono text-xs sm:text-sm text-[#f7fbe9] uppercase tracking-[0.18em]">
                      <span className="text-base text-[#9be15d]">👤</span>
                      Seu nome
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        document.getElementById("segredo-consulta")?.focus()
                      }
                      placeholder="Seu nome"
                      className={baseInput}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-mono text-xs sm:text-sm text-[#f7fbe9] uppercase tracking-[0.18em]">
                      <span className="text-base text-[#f05b5b]">🔒</span>
                      Seu segredo
                    </label>
                    <input
                      id="segredo-consulta"
                      type="password"
                      value={segredo}
                      onChange={(e) => setSegredo(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && consultarResultado()
                      }
                      placeholder="Seu segredo"
                      className={baseInput}
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={consultarResultado}
                    disabled={loading}
                    className={primaryButton}
                  >
                    {loading ? "🔍 CONSULTANDO..." : "REVELAR MEU AMIGO 🎁"}
                  </button>
                </div>

                <div className="pt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={novoSorteio}
                    disabled={loading}
                    className={secondaryButton}
                  >
                    🧹 NOVO SORTEIO
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
