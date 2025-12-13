import { sql } from "@vercel/postgres";

export async function POST() {
  try {
    await sql`DELETE FROM participantes`;
    return Response.json({ sucesso: true });
  } catch (error) {
    console.error("Erro ao resetar participantes:", error);
    return Response.json(
      { sucesso: false, erro: "Erro ao resetar: " + error.message },
      { status: 500 },
    );
  }
}
