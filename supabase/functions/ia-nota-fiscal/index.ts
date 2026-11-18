import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Modelo com VISÃO da Groq. É o mesmo modelo multimodal disponível no plano
// gratuito da conta. Se mudar, confira em https://console.groq.com/docs/vision
const MODELO = "qwen/qwen3.8-27b";

// Prompt de leitura de nota fiscal. O foco é extrair SOMENTE nome,
// quantidade e preço dos alimentos comprados, já no formato do app.
const PROMPT_SISTEMA = `
Você lê fotos de notas fiscais e cupons fiscais de supermercado brasileiros
para o app FoodSave. Sua tarefa é identificar os alimentos/produtos comprados
e extrair nome, quantidade e preço de cada um.

Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois, neste formato:
{
  "estabelecimento": "nome do mercado ou null",
  "dataCompra": "AAAA-MM-DD ou null",
  "total": 123.45,
  "itens": [
    {
      "nome": "Nome do alimento",
      "quantidade": 2,
      "unidade": "Quilograma",
      "unidadeNota": "KG",
      "precoUnitario": 12.5,
      "precoTotal": 25.0,
      "categoria": "Grãos e Cereais"
    }
  ]
}

Regras obrigatórias:
1. "quantidade" deve ser um número INTEIRO maior que zero.
2. "unidade" deve ser exatamente uma destas opções: "Miligrama", "Grama",
   "Quilograma", "Mililitro", "Litro" — ou null quando não der para determinar.
3. Quando a nota mostrar peso/volume fracionado, converta para a unidade menor
   para manter o número inteiro:
   0,756 KG -> 756 com "Grama"; 1,5 L -> 1500 com "Mililitro";
   0,5 L -> 500 com "Mililitro".
4. "unidadeNota" guarda a unidade como aparece na nota (ex.: "KG", "UN", "L",
   "CX") ou null. Para itens contados (ex.: 12 ovos) use "UN" e, se houver
   peso/volume total impresso, prefira converter para "Grama"/"Mililitro".
5. Preços em reais, apenas números decimais (ex.: 12.90). Use null quando não
   estiver legível. "precoTotal" é o valor da linha; "precoUnitario" é o preço
   por unidade/quilo/litro quando aparecer.
6. "categoria" deve ser exatamente uma destas opções: "Frutas",
   "Verduras e Legumes", "Carnes", "Laticínios", "Grãos e Cereais",
   "Bebidas", "Outros".
7. Ignore linhas que não são alimentos/produtos: desconto, total, troco,
   impostos, CPF, forma de pagamento, código de barras, número do cupom,
   itens de limpeza/higiene.
8. Não invente itens, quantidades ou preços: se um item estiver ilegível, pule.
9. Nome limpo, sem códigos internos, em português do Brasil, com as iniciais
   maiúsculas.
10. Se a imagem não for uma nota fiscal de mercado, devolva:
    {"estabelecimento": null, "dataCompra": null, "total": null, "itens": []}.
`;

function respostaJson(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// A IA às vezes devolve o JSON cercado por ```json ... ``` mesmo em JSON mode.
function extrairJson(texto: string): unknown {
  const limpo = texto
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(limpo);
  } catch {
    const inicio = limpo.indexOf("{");
    const fim = limpo.lastIndexOf("}");
    if (inicio === -1 || fim === -1 || fim <= inicio) return null;
    try {
      return JSON.parse(limpo.slice(inicio, fim + 1));
    } catch {
      return null;
    }
  }
}

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
      return respostaJson({ erro: "Não autenticado." }, 401);
    }

    // 2. Recebe a imagem (base64, sem o prefixo "data:") e o tipo
    const { imagem, tipo } = await req.json();

    if (typeof imagem !== "string" || imagem.length < 100) {
      return respostaJson({ erro: "Imagem não enviada." }, 400);
    }

    const tipoImagem =
      typeof tipo === "string" && tipo.startsWith("image/")
        ? tipo
        : "image/jpeg";

    const dataUrl = imagem.startsWith("data:")
      ? imagem
      : `data:${tipoImagem};base64,${imagem}`;

    // 3. Chama o Groq com visão + JSON mode (tier gratuito, sem cartão)
    const respostaIA = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")!}`,
        },
        body: JSON.stringify({
          model: MODELO,
          messages: [
            { role: "system", content: PROMPT_SISTEMA },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Leia esta nota fiscal e devolva o JSON com os alimentos, quantidades e preços.",
                },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_completion_tokens: 4096,
        }),
      }
    );

    const dados = await respostaIA.json();

    if (!respostaIA.ok) {
      const detalhe = dados?.error?.message ?? respostaIA.statusText;
      console.error("Groq rejeitou a leitura da nota:", respostaIA.status, detalhe);
      return respostaJson({ erro: `Groq não respondeu: ${detalhe}` }, 502);
    }

    const texto: string = dados.choices?.[0]?.message?.content ?? "";
    const analise = texto ? extrairJson(texto) : null;

    if (!analise || typeof analise !== "object") {
      console.error("Nota sem JSON válido:", texto.slice(0, 500));
      return respostaJson(
        { erro: "Não consegui interpretar a nota. Tente uma foto mais nítida." },
        502
      );
    }

    const resultado = analise as Record<string, unknown>;

    if (!Array.isArray(resultado.itens)) {
      resultado.itens = [];
    }

    return respostaJson({ analise: resultado });
  } catch (e) {
    console.error("Erro inesperado na leitura da nota:", e);
    return respostaJson({ erro: String(e) }, 500);
  }
});
