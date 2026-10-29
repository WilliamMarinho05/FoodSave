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

// Modelo disponível no plano gratuito da Groq (confirmado pela lista de
// modelos da conta). Se um dia sair do ar, gere a lista de modelos
// disponíveis com: GET https://api.groq.com/openai/v1/models
// Alternativa mais leve: "openai/gpt-oss-20b"
const MODELO = "openai/gpt-oss-120b";

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

    // 3. Chama o Groq (API no formato da OpenAI, tier gratuito, sem cartão)
    const respostaIA = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")!}`,
      },
      body: JSON.stringify({
        model: MODELO,
        messages: [
          { role: "system", content: PROMPT_SISTEMA },
          { role: "user", content: mensagem },
        ],
        temperature: 0.7,
      }),
    });

    const dados = await respostaIA.json();

    if (!respostaIA.ok) {
      const detalhe = dados?.error?.message ?? respostaIA.statusText;
      console.error("Groq rejeitou a chamada:", respostaIA.status, detalhe);
      return new Response(
        JSON.stringify({ erro: `Groq não respondeu: ${detalhe}` }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const texto: string = dados.choices?.[0]?.message?.content?.trim() ?? "";

    if (!texto) {
      console.error("Groq respondeu vazio:", JSON.stringify(dados));
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
