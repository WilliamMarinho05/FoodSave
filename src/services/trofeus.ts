import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { TrofeuUsuario } from '../types/trofeu';

/* ---------- Aviso interno: "confira se há troféus novos" ---------- */
type Ouvinte = () => void;
const ouvintes = new Set<Ouvinte>();

export function aoVerificarConquistas(ouvinte: Ouvinte): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function emitirVerificarConquistas(): void {
  ouvintes.forEach((ouvinte) => ouvinte());
}

/* ---------- Sessão ---------- */
export async function obterSessao(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;

  if (__DEV__) return entrarComUsuarioDeTeste(); // GAMBIARRA DEV (apagar esta linha)

  return null;
}

// ===== GAMBIARRA DEV: início (apagar até o "fim" quando o login funcionar) =====
// Sem sessão, em desenvolvimento, entra com o usuário de teste definido no .env
let loginEmAndamento: Promise<Session | null> | null = null;

function entrarComUsuarioDeTeste(): Promise<Session | null> {
  const email = process.env.EXPO_PUBLIC_DEV_EMAIL;
  const senha = process.env.EXPO_PUBLIC_DEV_SENHA;
  if (!email || !senha) return Promise.resolve(null);

  // Evita vários logins simultâneos
  if (!loginEmAndamento) {
    loginEmAndamento = supabase.auth
      .signInWithPassword({ email, password: senha })
      .then(({ data, error }) => {
        if (error) {
          console.warn('[dev] Falha ao entrar com o usuário de teste:', error.message);
          return null;
        }
        return data.session;
      })
      .finally(() => {
        loginEmAndamento = null;
      });
  }
  return loginEmAndamento;
}
// ===== GAMBIARRA DEV: fim =====

/* ---------- Troféus ---------- */

// Todos os troféus (conquistados e bloqueados) do usuário logado, com progresso
export async function getTrofeusUsuario(): Promise<TrofeuUsuario[]> {
  try {
    await obterSessao();

    const { data, error } = await supabase
      .from('vw_trofeus_usuario')
      .select('*')
      .order('ordem', { ascending: true });

    if (error || !data) {
      console.warn('Erro ao buscar troféus:', error?.message);
      return [];
    }

    return data as TrofeuUsuario[];
  } catch (err) {
    console.error('Falha inesperada ao buscar troféus:', err);
    return [];
  }
}

// Troféus já conquistados cuja tela "Conquista Desbloqueada" ainda não foi exibida
export async function getTrofeusPendentes(): Promise<TrofeuUsuario[]> {
  try {
    await obterSessao();

    const { data, error } = await supabase
      .from('vw_trofeus_usuario')
      .select('*')
      .eq('conquistado', true)
      .eq('visualizado', false)
      .order('conquistado_em', { ascending: true });

    if (error || !data) {
      console.warn('Erro ao buscar conquistas pendentes:', error?.message);
      return [];
    }

    return data as TrofeuUsuario[];
  } catch (err) {
    console.error('Falha inesperada ao buscar conquistas pendentes:', err);
    return [];
  }
}

export async function marcarTrofeuVisualizado(trofeuId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('rpc_marcar_trofeu_visualizado', {
      p_trofeu_id: trofeuId,
    });

    if (error) {
      console.warn('Erro ao marcar troféu como visualizado:', error.message);
    }
  } catch (err) {
    console.error('Falha inesperada ao marcar troféu como visualizado:', err);
  }
}

/* ---------- Consumo de alimento (gatilho dos troféus) ---------- */

// Marca um alimento como consumido. O trigger do banco (trg_alimento_avaliar_trofeus)
// avalia as metas e concede o troféu; depois avisamos o app para exibir a conquista.
export async function marcarAlimentoComoConsumido(alimentoId: string): Promise<boolean> {
  try {
    await obterSessao();

    const { data: alimento, error: erroBusca } = await supabase
      .from('alimentos')
      .select('id, usuario_id, quantidade_atual')
      .eq('id', alimentoId)
      .eq('status', 'EM_ESTOQUE')
      .single();

    if (erroBusca || !alimento) {
      console.warn('Alimento não encontrado ou já encerrado:', erroBusca?.message);
      return false;
    }

    const { error: erroUpdate } = await supabase
      .from('alimentos')
      .update({
        status: 'CONSUMIDO',
        quantidade_atual: 0,
        data_encerramento: new Date().toISOString(),
      })
      .eq('id', alimentoId);

    if (erroUpdate) {
      console.warn('Erro ao marcar alimento como consumido:', erroUpdate.message);
      return false;
    }

    // Registro no histórico (quantidade_movimentada precisa ser > 0 no banco)
    if (Number(alimento.quantidade_atual) > 0) {
      const { error: erroHistorico } = await supabase.from('historico_alimentos').insert({
        alimento_id: alimento.id,
        usuario_id: alimento.usuario_id,
        tipo_evento: 'CONSUMO_TOTAL',
        quantidade_movimentada: alimento.quantidade_atual,
      });

      if (erroHistorico) {
        console.warn('Erro ao registrar histórico de consumo:', erroHistorico.message);
      }
    }

    emitirVerificarConquistas();
    return true;
  } catch (err) {
    console.error('Falha inesperada ao consumir alimento:', err);
    return false;
  }
}
