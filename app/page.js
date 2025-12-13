"use client";

import { useState } from "react";

export default function Home() {
  // ⚠️ Em C#: int contador = 0;
  // Em React: precisamos de useState para reatividade
  const [etapa, setEtapa] = useState("cadastro"); // cadastro, sorteio, consulta
  const [participantes, setParticipantes] = useState([]);
  const [nome, setNome] = useState("");
  const [segredo, setSegredo] = useState("");
  const [mensagem, setMensagem] = useState("");

  // ⚠️ LÓGICA 1: Adicionar Participante
  // Em C#: participantes[contador++] = nome;
  // Em React: precisa criar novo array (imutabilidade)
  const adicionarParticipante = () => {
    if (!nome.trim() || !segredo.trim()) {
      setMensagem("❌ Preencha nome e segredo!");
      return;
    }

    const novo = {
      nome: nome.trim(),
      segredo: segredo.trim(),
      sorteado: "",
    };

    // ⚠️ Spread operator [...array, item] = adiciona no final
    setParticipantes([...participantes, novo]);

    setNome("");
    setSegredo("");
    setMensagem(
      `✅ ${novo.nome} adicionado! Total: ${participantes.length + 1} participantes`,
    );
  };

  // ⚠️ LÓGICA 2: Validar Número Par
  // MESMA lógica do C#!
  const validarPar = () => {
    if (participantes.length < 4) {
      setMensagem("❌ Adicione pelo menos 4 participantes!");
      return false;
    }

    if (participantes.length % 2 !== 0) {
      // ⚠️ Mesmo que C#: % 2 == 1
      setMensagem("❌ Número de participantes deve ser PAR!");
      return false;
    }

    return true;
  };

  // ⚠️ LÓGICA 3: Embaralhar (Fisher-Yates)
  // Exatamente a SUA lógica do C#!
  const embaralhar = (array) => {
    const resultado = [...array]; // Copia o array

    // ⚠️ MESMO LOOP DO C#!
    for (let i = 0; i < resultado.length; i++) {
      const j = Math.floor(Math.random() * resultado.length); // rnd.Next()

      // ⚠️ MESMA TROCA COM temp!
      const temp = resultado[i];
      resultado[i] = resultado[j];
      resultado[j] = temp;
    }

    return resultado;
  };

  // ⚠️ LÓGICA 4: Criar Lista Circular
  // A FÓRMULA (i+1) % length É IDÊNTICA!
  const realizarSorteio = async () => {
    if (!validarPar()) return;

    setMensagem("🎲 Sorteando...");

    // Embaralha
    const embaralhados = embaralhar(participantes);

    // ⚠️ Cria lista circular - MESMA LÓGICA DO C#!
    const comSorteio = embaralhados.map((p, i) => ({
      ...p,
      sorteado: embaralhados[(i + 1) % embaralhados.length].nome, // ⚠️ SUA FÓRMULA!
    }));

    // Salvar no banco
    try {
      const response = await fetch("/api/sorteio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantes: comSorteio }),
      });

      if (response.ok) {
        setMensagem("🎉 Sorteio realizado com sucesso!");
        setTimeout(() => setEtapa("consulta"), 2000);
      } else {
        setMensagem("❌ Erro ao salvar sorteio");
      }
    } catch (error) {
      setMensagem("❌ Erro: " + error.message);
    }
  };

  // ⚠️ LÓGICA 5: Consultar (busca com autenticação)
  const consultarResultado = async () => {
    if (!nome.trim() || !segredo.trim()) {
      setMensagem("❌ Preencha nome e segredo!");
      return;
    }

    try {
      const response = await fetch(
        `/api/consultar?nome=${encodeURIComponent(nome)}&segredo=${encodeURIComponent(segredo)}`,
      );

      const data = await response.json();

      // ⚠️ MESMA LÓGICA DE if/else DO C#!
      if (data.sucesso) {
        setMensagem(`🎁 Você tirou: ${data.sorteado}`);
      } else {
        setMensagem("❌ Nome ou segredo incorretos!");
      }

      setNome("");
      setSegredo("");
    } catch (error) {
      setMensagem("❌ Erro: " + error.message);
    }
  };

  // ⚠️ INTERFACE (HTML/JSX)
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-4xl font-bold text-center text-gray-800">
            🎄 Amigo Secreto
          </h1>
          <p className="text-center text-gray-600 mt-2">
            {etapa === "cadastro" && "Cadastre os participantes"}
            {etapa === "sorteio" && "Confirme o sorteio"}
            {etapa === "consulta" && "Consulte quem você tirou"}
          </p>
        </div>

        {/* Mensagens */}
        {mensagem && (
          <div
            className={`rounded-lg p-4 mb-6 text-center font-semibold ${mensagem.includes("✅") ||
              mensagem.includes("🎉") ||
              mensagem.includes("🎁")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}
          >
            {mensagem}
          </div>
        )}

        {/* ETAPA 1: CADASTRO */}
        {etapa === "cadastro" && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Participante
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    document.getElementById("segredo").focus()
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segredo Pessoal
                </label>
                <input
                  id="segredo"
                  type="password"
                  value={segredo}
                  onChange={(e) => setSegredo(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && adicionarParticipante()
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Data especial, apelido..."
                />
              </div>

              <button
                onClick={adicionarParticipante}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg"
              >
                ➕ Adicionar Participante
              </button>
            </div>

            {/* Lista de Participantes */}
            {participantes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Participantes Cadastrados ({participantes.length})
                  {participantes.length % 2 !== 0 && (
                    <span className="text-red-500 ml-2">
                      ⚠️ Precisa ser PAR!
                    </span>
                  )}
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {participantes.map((p, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 px-4 py-3 rounded flex items-center gap-2"
                    >
                      <span className="font-medium">
                        {i + 1}. {p.nome}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setEtapa("sorteio")}
              disabled={participantes.length < 2}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-lg"
            >
              Prosseguir para Sorteio →
            </button>
          </div>
        )}

        {/* ETAPA 2: SORTEIO */}
        {etapa === "sorteio" && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎲</div>
            <h2 className="text-2xl font-bold mb-4">Realizar Sorteio</h2>
            <p className="text-gray-600 mb-6">
              {participantes.length} participantes cadastrados
            </p>
            <p className="text-sm text-red-600 mb-8">
              ⚠️ Após o sorteio, não será possível alterar!
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setEtapa("cadastro")}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 rounded-lg"
              >
                ← Voltar
              </button>
              <button
                onClick={realizarSorteio}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg"
              >
                🎉 Sortear Agora!
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 3: CONSULTA */}
        {etapa === "consulta" && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold">Consultar Resultado</h2>
              <p className="text-gray-600 mt-2">Digite seu nome e segredo</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu Nome
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Digite seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu Segredo
                </label>
                <input
                  type="password"
                  value={segredo}
                  onChange={(e) => setSegredo(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && consultarResultado()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Digite seu segredo"
                />
              </div>

              <button
                onClick={consultarResultado}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-lg"
              >
                🔍 Consultar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
