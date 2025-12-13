import { sql } from "@vercel/postgres";

// ⚠️ POST = salvar dados (equivalente a INSERT no SQL)
export async function POST(request) {
  try {
    const { participantes } = await request.json();

    // ⚠️ Validação (como meu while de número par!)
    if (!participantes || participantes.length === 0) {
      return Response.json(
        { erro: "Nenhum participante fornecido" },
        { status: 400 },
      );
    }

    if (participantes.length % 2 !== 0) {
      // ⚠️ MESMA LÓGICA DO C#!
      return Response.json(
        { erro: "Número de participantes deve ser PAR" },
        { status: 400 },
      );
    }

    // ⚠️ Limpa a tabela antes (para novo sorteio)
    await sql`DELETE FROM participantes`;

    // ⚠️ LOOP para inserir cada participante
    // Em C#: for (int i = 0; i < participantes.length; i++)
    for (const participante of participantes) {
      await sql`
        INSERT INTO participantes (nome, segredo, sorteado)
        VALUES (${participante.nome}, ${participante.segredo}, ${participante.sorteado})
      `;
    }

    return Response.json({
      sucesso: true,
      mensagem: "Sorteio salvo com sucesso!",
      total: participantes.length,
    });
  } catch (error) {
    console.error("Erro ao salvar sorteio:", error);
    return Response.json(
      { erro: "Erro ao salvar no banco: " + error.message },
      { status: 500 },
    );
  }
}
