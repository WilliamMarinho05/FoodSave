import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { supabase } from "@/src/lib/supabase";
import {
  AnaliseNotaFiscal,
  ItemNotaFiscal,
} from "@/src/types/notaFiscal";

// Edge Function que lê a nota fiscal com o modelo de visão da Groq.
// Código: supabase/functions/ia-nota-fiscal/
const NOME_FUNCAO_NOTA = "ia-nota-fiscal";

// Mesmas categorias do formulário de cadastro (app/cadastrar_alimento)
const CATEGORIAS = [
  "Frutas",
  "Verduras e Legumes",
  "Carnes",
  "Laticínios",
  "Grãos e Cereais",
  "Bebidas",
  "Outros",
];

// As únicas unidades aceitas pelo formulário de cadastro
const UNIDADES_POR_APELIDO: Record<string, string> = {
  miligrama: "Miligrama",
  miligramas: "Miligrama",
  mg: "Miligrama",
  grama: "Grama",
  gramas: "Grama",
  g: "Grama",
  gr: "Grama",
  quilograma: "Quilograma",
  quilogramas: "Quilograma",
  quilo: "Quilograma",
  quilos: "Quilograma",
  kg: "Quilograma",
  kilo: "Quilograma",
  kilos: "Quilograma",
  mililitro: "Mililitro",
  mililitros: "Mililitro",
  ml: "Mililitro",
  litro: "Litro",
  litros: "Litro",
  l: "Litro",
  lt: "Litro",
};

function semAcento(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function textoOuNulo(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const texto = valor.replace(/\s+/g, " ").trim();
  return texto ? texto : null;
}

function normalizarUnidade(...candidatas: unknown[]): string | null {
  for (const candidata of candidatas) {
    if (typeof candidata !== "string") continue;

    const unidade = UNIDADES_POR_APELIDO[semAcento(candidata)];

    if (unidade) return unidade;
  }

  return null;
}

function normalizarCategoria(valor: unknown): string {
  if (typeof valor !== "string") return "Outros";

  const alvo = semAcento(valor);

  return (
    CATEGORIAS.find((categoria) => semAcento(categoria) === alvo) ?? "Outros"
  );
}

function normalizarNome(valor: unknown): string {
  if (typeof valor !== "string") return "";

  return valor
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\d{3,}\s+/, "")
    // "Arroz 5kg", "Leite 1L", "Café 500g": o peso/volume já vem em
    // quantidade/unidade, então não precisa ficar no nome (o formulário
    // de cadastro não aceita números no nome).
    .replace(/\b\d+([.,]\d+)?\s*(kg|g|mg|ml|l|lt|un|und|unid|cx|pct|dz)\b\.?/gi, " ")
    .replace(/[0-9%°º]/g, " ")
    // O formulário de cadastro só aceita letras e espaços
    .replace(/[-–—_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60)
    .trim();
}

function paraNumero(valor: unknown): number | null {
  if (valor == null || valor === "") return null;

  let numero: number;

  if (typeof valor === "number") {
    numero = valor;
  } else {
    let texto = String(valor).trim();

    // "1.234,56" (pt-BR) x "1.5" (decimal com ponto)
    if (texto.includes(",")) {
      texto = texto.replace(/\./g, "").replace(",", ".");
    }

    numero = Number(texto.replace(/[^\d.-]/g, ""));
  }

  if (!Number.isFinite(numero) || numero <= 0) return null;

  return numero;
}

function paraPreco(valor: unknown): number | null {
  if (valor == null || valor === "") return null;

  let numero: number;

  if (typeof valor === "number") {
    numero = valor;
  } else {
    let texto = String(valor).replace(/[^\d,.-]/g, "");

    if (texto.includes(",")) {
      texto = texto.replace(/\./g, "").replace(",", ".");
    }

    numero = Number(texto);
  }

  if (!Number.isFinite(numero) || numero < 0) return null;

  return Math.round(numero * 100) / 100;
}

function normalizarData(valor: unknown): string | null {
  if (typeof valor !== "string") return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;

  // Alguns modelos devolvem DD/MM/AAAA
  const partes = valor.split("/");

  if (partes.length === 3) {
    const [dia, mes, ano] = partes;
    if (ano.length === 4) {
      return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    }
  }

  return null;
}

function normalizarItem(bruto: unknown): ItemNotaFiscal | null {
  if (!bruto || typeof bruto !== "object") return null;

  const item = bruto as Record<string, unknown>;
  const nome = normalizarNome(item.nome);

  if (!nome) return null;

  let unidade = normalizarUnidade(item.unidade, item.unidadeNota);
  let quantidade = paraNumero(item.quantidade) ?? 1;

  // Se a IA devolveu uma fração (ex.: 0,756 kg), converte para a unidade
  // menor para o formulário aceitar apenas números inteiros.
  if (quantidade < 1) {
    if (unidade === "Quilograma") {
      quantidade *= 1000;
      unidade = "Grama";
    } else if (unidade === "Litro") {
      quantidade *= 1000;
      unidade = "Mililitro";
    }
  }

  quantidade = Math.max(1, Math.min(Math.round(quantidade), 99999));

  return {
    nome,
    quantidade,
    unidade,
    unidadeNota: textoOuNulo(item.unidadeNota),
    precoUnitario: paraPreco(item.precoUnitario),
    precoTotal: paraPreco(item.precoTotal),
    categoria: normalizarCategoria(item.categoria),
  };
}

function normalizarAnalise(bruto: unknown): AnaliseNotaFiscal {
  const analise =
    bruto && typeof bruto === "object"
      ? (bruto as Record<string, unknown>)
      : {};

  const itens = Array.isArray(analise.itens)
    ? analise.itens
        .map(normalizarItem)
        .filter((item): item is ItemNotaFiscal => item !== null)
    : [];

  return {
    estabelecimento: textoOuNulo(analise.estabelecimento),
    dataCompra: normalizarData(analise.dataCompra),
    total: paraPreco(analise.total),
    itens,
  };
}

// Lê a imagem original e devolve base64 puro. Usado como plano B quando o
// redimensionamento não está disponível (ex.: navegador sem suporte).
async function uriParaBase64(uri: string): Promise<string> {
  const resposta = await fetch(uri);
  const blob = await resposta.blob();

  return await new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      const resultado = String(leitor.result ?? "");
      const virgula = resultado.indexOf(",");

      if (virgula === -1) {
        reject(new Error("Não foi possível ler a foto da nota."));
        return;
      }

      resolve(resultado.slice(virgula + 1));
    };

    leitor.onerror = () =>
      reject(leitor.error ?? new Error("Não foi possível ler a foto da nota."));

    leitor.readAsDataURL(blob);
  });
}

// Reduz e comprime a foto antes de enviar: nota fiscal continua legível e o
// upload fica leve (a Edge Function tem limite de tamanho de requisição).
async function prepararImagem(uri: string) {
  try {
    const contexto = ImageManipulator.manipulate(uri);

    contexto.resize({ width: 1400, height: null });

    const imagem = await contexto.renderAsync();

    const salva = await imagem.saveAsync({
      base64: true,
      compress: 0.65,
      format: SaveFormat.JPEG,
    });

    if (salva.base64) {
      return salva.base64;
    }
  } catch (erro) {
    // No navegador (versão web do app) o redimensionamento pode falhar em
    // alguns aparelhos; nesse caso mandamos a foto original.
    console.warn("Não foi possível redimensionar a foto da nota:", erro);
  }

  return uriParaBase64(uri);
}

// Tenta aproveitar a mensagem de erro que a Edge Function devolveu
async function mensagemDoErro(erro: unknown): Promise<string | null> {
  const contexto = (erro as { context?: Response })?.context;

  if (contexto && typeof contexto.json === "function") {
    try {
      const corpo = await contexto.json();
      if (typeof corpo?.erro === "string" && corpo.erro.trim()) {
        return corpo.erro;
      }
    } catch {
      // corpo não era JSON: usa a mensagem genérica
    }
  }

  return null;
}

/**
 * Envia a foto da nota fiscal para a Edge Function `ia-nota-fiscal`,
 * que usa o modelo de visão da Groq para extrair nome, quantidade e preço
 * de cada alimento.
 */
export async function analisarNotaFiscal(
  uri: string
): Promise<AnaliseNotaFiscal> {
  const imagem = await prepararImagem(uri);

  const { data, error } = await supabase.functions.invoke(NOME_FUNCAO_NOTA, {
    body: { imagem, tipo: "image/jpeg" },
  });

  if (error) {
    console.error("Erro ao analisar nota fiscal:", error);

    const mensagem = await mensagemDoErro(error);

    throw new Error(
      mensagem ??
        "Não foi possível analisar a nota agora. Tente de novo ou cadastre manualmente."
    );
  }

  const corpo = data as { analise?: unknown; erro?: string } | null;

  if (corpo?.erro) {
    throw new Error(corpo.erro);
  }

  if (!corpo?.analise) {
    throw new Error("A IA não devolveu os itens da nota.");
  }

  return normalizarAnalise(corpo.analise);
}
