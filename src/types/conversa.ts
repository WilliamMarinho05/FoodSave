export type PapelMensagem = "usuario" | "ia";

export interface Mensagem {
  id: string;
  papel: PapelMensagem;
  texto: string;
  criadoEm: string;
}
