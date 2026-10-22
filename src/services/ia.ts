import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mensagem } from "@/src/types/conversa";

const CHAVE_CONVERSA = "foodsave:conversa-assistente";

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

// ---------------------------------------------------------------------
// TODO (IA real): substituir o corpo desta função pela chamada à IA
// (por exemplo: Supabase Edge Function, OpenAI, Gemini...).
// Ela recebe o texto do usuário e deve devolver o texto da resposta.
// Quando a IA real entrar, use `carregarConversa()` para enviar o
// histórico completo junto com a nova mensagem.
// ---------------------------------------------------------------------
export async function enviarMensagemParaIA(texto: string): Promise<string> {
  // Atraso apenas para simular o tempo de resposta de uma IA.
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return gerarRespostaSimulada(texto);
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
    "Boa pergunta! Por enquanto sou só um preview do assistente — " +
    "quando a IA for conectada, vou responder de verdade com dicas da sua despensa 💚"
  );
}
