import { sql } from "@vercel/postgres";

export async function POST(request) {
  try {
    const { ids } = await request.json();

    // Validação
    if (!ids || ids.length === 0) {
      return Response.json(
        { sucesso: false, erro: "Nenhum ID fornecido" },
        { status: 400 }
      );
    }

    if (ids.length % 2 !== 0) {
      return Response.json(
        { sucesso: false, erro: "Número de participantes deve ser PAR" },
        { status: 400 }
      );
    }

    // Busca os participantes pelos IDs
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const query = `SELECT id, nome FROM participantes WHERE id IN (${placeholders}) ORDER BY RANDOM()`;
    
    const resultado = await sql.query(query, ids);
    const participantes = resultado.rows;

    if (participantes.length !== ids.length) {
      return Response.json(
        { sucesso: false, erro: "Alguns participantes não foram encontrados" },
        { status: 400 }
      );
    }

    for (let i = 0; i < participantes.length; i++) {
      const proximoIndex = (i + 1) % participantes.length;
      const sorteado = participantes[proximoIndex].nome;

      await sql`
        UPDATE participantes 
        SET sorteado = ${sorteado}
        WHERE id = ${participantes[i].id}
      `;
    }

    console.log(`✅ Sorteio realizado com ${participantes.length} participantes`);

    return Response.json({
      sucesso: true,
      mensagem: "Sorteio realizado com sucesso!",
      total: participantes.length,
    });
  } catch (error) {
    console.error("Erro ao fazer sorteio:", error);
    return Response.json(
      { sucesso: false, erro: "Erro ao sortear: " + error.message },
      { status: 500 }
    );
  }
}
