import { sql } from "@vercel/postgres";

// ⚠️ GET = buscar dados (equivalente a SELECT no SQL)
export async function GET(request) {
  try {
    // ⚠️ Pega parâmetros da URL (?nome=Ana&segredo=123)
    const { searchParams } = new URL(request.url);
    const nome = searchParams.get("nome");
    const segredo = searchParams.get("segredo");

    // ⚠️ Validação de entrada (como seu if (!nome.trim()))
    if (!nome || !segredo) {
      return Response.json(
        { sucesso: false, erro: "Nome e segredo são obrigatórios" },
        { status: 400 },
      );
    }

    // ⚠️ BUSCA NO BANCO - Equivalente ao seu loop for + if
    // Em C#: for (i = 0; i < contador; i++)
    //          if (participantes[i] == nome && segredos[i] == segredo)
    const resultado = await sql`
      SELECT sorteado 
      FROM participantes 
      WHERE nome = ${nome} 
        AND segredo = ${segredo}
      LIMIT 1
    `;

    // ⚠️ MESMA LÓGICA: encontrou ou não?
    if (resultado.rows.length > 0) {
      // ⚠️ Como seu: Console.WriteLine($"Você tirou: {sorteados[i]}");
      return Response.json({
        sucesso: true,
        tirou: resultado.rows[0].sorteado,
      });
    } else {
      // ⚠️ Como seu: if (encontrado == false) mostrar erro
      return Response.json({
        sucesso: false,
        erro: "Nome ou segredo incorretos",
      });
    }
  } catch (error) {
    console.error("Erro ao consultar:", error);
    return Response.json(
      { sucesso: false, erro: "Erro ao consultar banco: " + error.message },
      { status: 500 },
    );
  }
}
