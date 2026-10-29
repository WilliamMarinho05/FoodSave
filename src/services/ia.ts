import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mensagem } from "@/src/types/conversa";
import { supabase } from "@/src/lib/supabase";
import { buscarAlimentosEmEstoque } from "@/src/services/alimentos";

const CHAVE_CONVERSA = "foodsave:conversa-assistente";

// Nome da Edge Function do Supabase que conversa com o Gemini.
// Código dela: supabase/functions/ia-receitas/
const NOME_FUNCAO_IA = "ia-receitas";

export async function carregarConversa(): Promise<Mensagem[]> {
  try {
    const dados = await AsyncStorage.getItem(CHAVE_CONVERSA);

    if (!dados) {
      return [];
    }

    const lista = JSON.parse(dados);

    if (!Array.isArray(lista)) {
      return [];
    }

    return lista as Mensagem[];
  } catch (error) {
    console.error("Erro ao carregar conversa:", error);
    return [];
  }
}

export async function salvarConversa(mensagens: Mensagem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE_CONVERSA, JSON.stringify(mensagens));
  } catch (error) {
    console.error("Erro ao salvar conversa:", error);
  }
}

export async function limparConversa(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAVE_CONVERSA);
  } catch (error) {
    console.error("Erro ao limpar conversa:", error);
  }
}

// Monta, a partir do estoque do usuário, o texto que dá contexto à IA
// (ex.: "- Ovos: 12 unidade (vence 30/10/2026)").
async function montarEstoque(): Promise<string> {
  try {
    const alimentos = await buscarAlimentosEmEstoque();

    if (alimentos.length === 0) {
      return "(nenhum alimento cadastrado)";
    }

    return alimentos
      .map(
        (alimento) =>
          `- ${alimento.nome}: ${alimento.quantidade} ${alimento.unidade} (vence ${alimento.validade})`
      )
      .join("\n");
  } catch (error) {
    console.error("Erro ao montar estoque para a IA:", error);
    return "(não foi possível ler o estoque)";
  }
}

// Agora a função de verdade: chama a Edge Function `ia-receitas` do Supabase,
// que valida o login, monta o prompt de receitas e conversa com o Gemini.
// Enquanto a função/secret não estiverem no ar, cai no modo demonstração.
export async function enviarMensagemParaIA(texto: string): Promise<string> {
  const estoque = await montarEstoque();

  try {
    const { data, error } = await supabase.functions.invoke(NOME_FUNCAO_IA, {
      body: { pergunta: texto, estoque },
    });

    if (error) {
      throw error;
    }

    const resposta = (data as { resposta?: string } | null)?.resposta;

    if (typeof resposta !== "string" || !resposta.trim()) {
      throw new Error("A IA não devolveu resposta.");
    }

    return resposta;
  } catch (error) {
    console.warn("IA ainda não conectada, respondendo em modo demonstração:", error);
    return gerarRespostaSimulada(texto);
  }
}

function gerarRespostaSimulada(texto: string): string {
  const pergunta = texto.toLowerCase();

  if (pergunta.includes("receita")) {
    return (
      "Aqui vai uma ideia rápida: bata 2 ovos, junte tomate picado e cheiro-verde, " +
      "tempere com sal e faça uma omelete na frigideira. Em 10 minutos está pronto 🍳"
    );
  }

  if (
    pergunta.includes("vencid") ||
    pergunta.includes("vencem") ||
    pergunta.includes("validade")
  ) {
    return (
      "Alimentos perto do vencimento podem virar sopas, refogados, bolos de banana " +
      "ou smoothies. Use sempre primeiro o que vence mais cedo e deixe-o na frente na geladeira!"
    );
  }

  if (
    pergunta.includes("guardar") ||
    pergunta.includes("armazen") ||
    pergunta.includes("organiz")
  ) {
    return (
      "Uma dica: frutas que liberam etileno (banana, maçã e tomate) apressam o amadurecimento " +
      "dos vizinhos. Guarde-as separadas das verduras para tudo durar mais 🥬"
    );
  }

  return (
    "Por enquanto estou em modo demonstração — a IA real ainda não está conectada. " +
    "Assim que o cadastro da chave for concluído, vou responder de verdade com " +
    "receitas feitas com o que você tem na despensa 💚"
  );
}
