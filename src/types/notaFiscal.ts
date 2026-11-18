// Tipos da leitura de nota fiscal feita pela IA (Edge Function `ia-nota-fiscal`).

export type ItemNotaFiscal = {
  /** Nome do alimento já limpo (ex.: "Arroz Branco") */
  nome: string;
  /** Quantidade inteira, já convertida para a unidade do app */
  quantidade: number;
  /** Unidade oficial do app (Miligrama, Grama, Quilograma, Mililitro, Litro) */
  unidade: string | null;
  /** Unidade como aparece na nota (ex.: "KG", "UN"), só para exibição */
  unidadeNota: string | null;
  precoUnitario: number | null;
  precoTotal: number | null;
  categoria: string;
};

export type AnaliseNotaFiscal = {
  estabelecimento: string | null;
  /** Data da compra no formato AAAA-MM-DD */
  dataCompra: string | null;
  total: number | null;
  itens: ItemNotaFiscal[];
};
