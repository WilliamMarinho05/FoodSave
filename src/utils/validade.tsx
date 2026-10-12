// Utilitários de validade compartilhados.
// Mantém a mesma regra do painel da Home: "atenção" = vence em até 3 dias.

export type StatusValidade = "vencido" | "atencao" | "noPrazo" | "semData";

export const DIAS_ATENCAO = 3;

// Cores no mesmo padrão do PainelValidade (bordas leves) + tons de texto do Alertas
export const CORES_STATUS: Record<
  StatusValidade,
  { borda: string; fundo: string; pill: string; texto: string }
> = {
  vencido: {
    borda: "#FFD6D6",
    fundo: "#FFFBFB",
    pill: "#FFEDED",
    texto: "#C62828",
  },
  atencao: {
    borda: "#FFE3C5",
    fundo: "#FFFCF7",
    pill: "#FFF3E0",
    texto: "#B8700B",
  },
  noPrazo: {
    borda: "#D1F2D9",
    fundo: "#FFFFFF",
    pill: "#EAF4E9",
    texto: "#287A43",
  },
  semData: {
    borda: "#EAEAEA",
    fundo: "#FFFFFF",
    pill: "#F2F2F2",
    texto: "#8C9AA0",
  },
};

// Recebe DD/MM/AAAA (formato que o service já entrega) e devolve
// quantos dias faltam (negativo = já venceu). Retorna null se inválida.
export function diasAteValidade(validade: string): number | null {
  if (!validade) return null;

  const partes = validade.split("/");
  if (partes.length !== 3) return null;

  const [dia, mes, ano] = partes.map(Number);
  if (!dia || !mes || !ano) return null;

  const dataValidade = new Date(ano, mes - 1, dia);
  if (Number.isNaN(dataValidade.getTime())) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return Math.round(
    (dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function statusDaValidade(dias: number | null): StatusValidade {
  if (dias === null) return "semData";
  if (dias < 0) return "vencido";
  if (dias <= DIAS_ATENCAO) return "atencao";
  return "noPrazo";
}

export function textoPrazo(dias: number | null): string {
  if (dias === null) return "Sem validade";
  if (dias < -1) return `Vencido há ${Math.abs(dias)} dias`;
  if (dias === -1) return "Venceu ontem";
  if (dias === 0) return "Vence hoje";
  if (dias === 1) return "Vence amanhã";
  return `Vence em ${dias} dias`;
}

// Remove acentos e caixa para busca/comparação
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
