// Utilitários de data. Todas as datas trafegam como "AAAA-MM-DD" (formato do banco)
// e só são convertidas para DD/MM/AAAA na hora de exibir.

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

export function paraISO(ano: number, mes0: number, dia: number) {
  return `${ano}-${String(mes0 + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

// Data de hoje no fuso do aparelho (evita o problema do toISOString/UTC)
export function hojeISO() {
  const d = new Date();
  return paraISO(d.getFullYear(), d.getMonth(), d.getDate());
}

export function partesISO(iso: string) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return { ano, mes: mes - 1, dia };
}

export function formatarBR(iso: string) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function diasNoMes(ano: number, mes0: number) {
  return new Date(ano, mes0 + 1, 0).getDate();
}

// 0 = domingo ... 6 = sábado
export function diaSemanaDoPrimeiro(ano: number, mes0: number) {
  return new Date(ano, mes0, 1).getDay();
}
