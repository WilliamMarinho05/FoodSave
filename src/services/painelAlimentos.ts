import { supabase } from '../lib/supabase';

export interface ResumoValidades {
  noPrazo: number;
  atencao: number;
  vencidos: number;
}

export async function getResumoValidades(): Promise<ResumoValidades> {
  const resumoPadrao = { noPrazo: 0, atencao: 0, vencidos: 0 };

  try {
    const { data, error } = await supabase
      .from('alimentos')
      .select('data_validade')
      .eq('status', 'EM_ESTOQUE')
      .gt('quantidade_atual', 0);

    if (error || !data) {
      console.warn('Erro ou nenhum dado retornado:', error?.message);
      return resumoPadrao;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const limiteAtencao = new Date(hoje);
    limiteAtencao.setDate(hoje.getDate() + 3);

    let noPrazo = 0;
    let atencao = 0;
    let vencidos = 0;

    data.forEach((item) => {
      if (!item?.data_validade) return;

      const partes = item.data_validade.split('-');
      if (partes.length !== 3) return;

      const [ano, mes, dia] = partes.map(Number);
      const dataValidade = new Date(ano, mes - 1, dia);

      if (dataValidade < hoje) {
        vencidos++;
      } else if (dataValidade <= limiteAtencao) {
        atencao++;
      } else {
        noPrazo++;
      }
    });

    return { noPrazo, atencao, vencidos };
  } catch (err) {
    console.error('Falha inesperada ao processar validades:', err);
    return resumoPadrao;
  }
}
export async function getEstatisticasPerfil() {
  const estatisticasPadrao = { cadastrados: 0, salvos: 0, descartados: 0 };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return estatisticasPadrao;

    const { data, error } = await supabase
      .from('alimentos')
      .select('status')
      .eq('usuario_id', user.id);

    if (error || !data) {
      console.warn('Erro ao buscar estatísticas:', error?.message);
      return estatisticasPadrao;
    }

    let salvos = 0;
    let descartados = 0;

    data.forEach((item) => {
      if (item.status === 'CONSUMIDO') salvos++;
      // Caso futuramente adicione um botão de descartar alimento estragado:
      if (item.status === 'DESCARTADO') descartados++; 
    });

    return {
      cadastrados: data.length,
      salvos,
      descartados,
    };
  } catch (err) {
    console.error('Falha inesperada ao processar estatísticas:', err);
    return estatisticasPadrao;
  }
}