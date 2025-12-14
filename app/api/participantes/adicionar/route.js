import { sql } from "@vercel/postgres";

export async function POST(request) {
  try {
    const { nome, segredo } = await request.json();

    // Validação
    if (!nome || !segredo) {
      return Response.json(
        { sucesso: false, erro: "Nome e segredo são obrigatórios" },
        { status: 400 },
      );
    }

    // Verifica se já existe
    const existe = await sql`
      SELECT id FROM participantes 
      WHERE nome = ${nome}
    `;

    if (existe.rows.length > 0) {
      return Response.json(
        { sucesso: false, erro: "Este nome já foi cadastrado" },
        { status: 400 },
      );
    }

    // Insere novo participante (sorteado vazio pois sorteio ainda não foi feito)
    const resultado = await sql`
      INSERT INTO participantes (nome, segredo, sorteado)
      VALUES (${nome}, ${segredo}, '')
      RETURNING id, nome, segredo, sorteado
    `;

    console.log(`✅ Novo participante: ${nome}`);

    return Response.json({
      sucesso: true,
      mensagem: "Participante cadastrado com sucesso!",
      participante: resultado.rows[0],
    });
  } catch (error) {
    console.error("Erro ao adicionar participante:", error);
    return Response.json(
      { sucesso: false, erro: "Erro ao cadastrar: " + error.message },
      { status: 500 },
    );
  }
}
