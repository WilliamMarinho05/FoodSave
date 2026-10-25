// Filtros de digitação e helpers de texto usados nos formulários.

// Remove acentos e deixa minúsculo, para comparar textos de forma tolerante
export function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Somente letras (com acentos) e espaços
export function somenteLetras(texto: string) {
  return texto.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "").replace(/^\s+/, "");
}

// Somente números inteiros
export function somenteInteiros(texto: string) {
  return texto.replace(/\D/g, "");
}

// Números reais: aceita vírgula ou ponto (exibe sempre vírgula), até 3 casas
export function somenteDecimal(texto: string) {
  let s = texto.replace(/[^0-9.,]/g, "").replace(/\./g, ",");

  const i = s.indexOf(",");
  if (i !== -1) {
    s = s.slice(0, i + 1) + s.slice(i + 1).replace(/,/g, "").slice(0, 3);
  }

  if (s.startsWith(",")) {
    s = "0" + s;
  }

  return s;
}

export function paraNumero(texto: string) {
  return Number(texto.replace(",", "."));
}

export function limparEspacos(texto: string) {
  return texto.replace(/\s+/g, " ").trim();
}

export function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Remove repetidos (ignorando acento/caixa), mantendo a primeira ocorrência
export function unicos(lista: string[]) {
  const vistos = new Set<string>();
  const resultado: string[] = [];

  for (const item of lista) {
    const chave = normalizar(item);
    if (!chave || vistos.has(chave)) continue;
    vistos.add(chave);
    resultado.push(item);
  }

  return resultado;
}
