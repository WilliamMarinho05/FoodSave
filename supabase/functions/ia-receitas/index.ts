import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// PROMPT DE SISTEMA — aqui está o "foco em receitas". Ajuste à vontade.
const PROMPT_SISTEMA = `
Você é o assistente de receitas do app FoodSave. Regras obrigatórias:

1. Receitas usam SOMENTE alimentos da lista de estoque enviada pelo usuário.
2. Respeite rigorosamente as quantidades que ele possui — nunca peça
   mais de um ingrediente do que ele tem.
3. Priorize os alimentos próximos do vencimento e diga quais aproveitou.
4. Se faltar algum ingrediente, sugira substituição por outro item do
   estoque dele (ou diga claramente o que precisaria comprar).
5. Formato da resposta: nome do prato, tempo estimado, ingredientes com
   quantidade e modo de preparo numerado. Resposta curta e direta.
6. Perguntas fora do tema receitas/alimentos/conservação recebem um
   lembrete gentil de que você só ajuda com receitas.
7. Responda sempre em português do Brasil.
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Confirma que quem chamou está logado (token enviado pelo app)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ erro: "Não autenticado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { pergunta, estoque } = await req.json();

    // 2. Monta a mensagem com o contexto do estoque
    const mensagem = `Meu estoque atual:\n${estoque}\n\nMinha pergunta: ${pergunta}`;

    // 3. Chama o Gemini
    const respostaIA = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": Deno.env.get("GEMINI_API_KEY")!,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: PROMPT_SISTEMA }] },
          contents: [{ role: "user", parts: [{ text: mensagem }] }],
          generationConfig: { temperature: 0.7 },
        }),
      }
    );

    const dados = await respostaIA.json();
    const texto = (dados.candidates?.[0]?.content?.parts ?? [])
      .map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim();

    if (!texto) {
      return new Response(
        JSON.stringify({ erro: "A IA não devolveu resposta." }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ resposta: texto }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ erro: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
