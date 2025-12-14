import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    const resultado = await sql`
      SELECT id, nome, segredo, sorteado
      FROM participantes
      ORDER BY created_at ASC
    `;

    return Response.json({
      sucesso: true,
      participantes: resultado.rows,
      total: resultado.rows.length,
    });
  } catch (error) {
    console.error("Erro ao listar participantes:", error);
    return Response.json(
      { sucesso: false, erro: "Erro ao listar: " + error.message },
      { status: 500 },
    );
  }
}
