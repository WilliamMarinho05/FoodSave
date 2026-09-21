export type HabitoTrofeu = 'VALIDADE' | 'CONSUMO' | 'ORGANIZACAO' | 'CONSTANCIA';

// Espelha as colunas da view public.vw_trofeus_usuario
export interface TrofeuUsuario {
  trofeu_id: string;
  codigo: string;
  nome: string;
  descricao: string;
  mensagem_motivacional: string;
  icone: string;
  habito: HabitoTrofeu;
  meta_quantidade: number;
  ordem: number;
  conquistado: boolean;
  conquistado_em: string | null;
  visualizado: boolean;
  progresso_atual: number;
}

export const ROTULO_HABITO: Record<HabitoTrofeu, string> = {
  VALIDADE: 'Validade',
  CONSUMO: 'Consumo',
  ORGANIZACAO: 'Organização',
  CONSTANCIA: 'Constância',
};
