import { supabase } from "../lib/supabase";
import { adicionarExp } from "./nivelamento";

function getDataHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function getInicioSemana() {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const diasDesdeSegunda = diaSemana === 0 ? 6 : diaSemana - 1;

  hoje.setDate(hoje.getDate() - diasDesdeSegunda);

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

async function incrementarMissao(codigoMissao: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: missao, error: erroMissao } = await supabase
    .from("missoes")
    .select("id, meta, periodicidade")
    .eq("codigo", codigoMissao)
    .eq("ativa", true)
    .single();

  if (erroMissao || !missao) {
    console.warn(
      "Missão não encontrada:",
      erroMissao?.message
    );
    return null;
  }

  const dataReferencia =
    missao.periodicidade === "semanal"
      ? getInicioSemana()
      : getDataHoje();

  const { data: atual, error: erroBusca } = await supabase
    .from("progresso_missoes")
    .select("id, progresso, concluida, concluida_em")
    .eq("usuario_id", user.id)
    .eq("missao_id", missao.id)
    .eq("data_missao", dataReferencia)
    .maybeSingle();

  if (erroBusca) {
    console.warn(
      "Erro ao buscar progresso:",
      erroBusca.message
    );
    return null;
  }

  const novoProgresso = Math.min(
    (atual?.progresso ?? 0) + 1,
    missao.meta
  );

  const concluida = novoProgresso >= missao.meta;

  // Verifica se a missão acabou de ser concluída nesta exata ação
  const recemConcluida =
    concluida && !atual?.concluida;

  if (!atual) {
    const { error } = await supabase
      .from("progresso_missoes")
      .insert({
        usuario_id: user.id,
        missao_id: missao.id,
        data_missao: dataReferencia,
        progresso: novoProgresso,
        concluida,
        concluida_em: concluida
          ? new Date().toISOString()
          : null,
      });

    if (error) {
      console.warn(
        "Erro ao criar progresso:",
        error.message
      );
    }
  } else {
    const { error } = await supabase
      .from("progresso_missoes")
      .update({
        progresso: novoProgresso,
        concluida,
        concluida_em: concluida
          ? atual.concluida_em ??
            new Date().toISOString()
          : null,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", atual.id);

    if (error) {
      console.warn(
        "Erro ao atualizar progresso:",
        error.message
      );
    }
  }

  if (recemConcluida) {
    let xp = 10;

    if (codigoMissao === "cadastrar_alimentos") {
      xp = 20;
    }

    if (codigoMissao === "verificar_validade") {
      xp = 30;
    }

    if (
      codigoMissao === "cadastrar_alimentos_semanal"
    ) {
      xp = 50;
    }

    const resultadoExp = await adicionarExp(xp);

    return {
      xp,
      resultadoExp,
    };
  }

  return null;
}

export async function atualizarProgressoMissao(
  codigoMissao: string
) {
  try {
    const resultado =
      await incrementarMissao(codigoMissao);

    let resultadoSemanal = null;

    if (codigoMissao === "cadastrar_alimentos") {
      resultadoSemanal = await incrementarMissao(
        "cadastrar_alimentos_semanal"
      );
    }

    return {
      resultado,
      resultadoSemanal,
    };
  } catch (erro) {
    console.error(
      "Erro ao atualizar missão:",
      erro
    );

    return null;
  }
}

export async function buscarProgressoMissoes() {
  const resultadoInicial = {
    cadastrarAlimentos: 0,
    verificarValidade: 0,
    cadastrarAlimentosSemanal: 0,
  };

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return resultadoInicial;
    }

    const {
      data: missoes,
      error: erroMissoes,
    } = await supabase
      .from("missoes")
      .select("id, codigo, periodicidade")
      .in("codigo", [
        "cadastrar_alimentos",
        "verificar_validade",
        "cadastrar_alimentos_semanal",
      ]);

    if (erroMissoes || !missoes) {
      console.warn(
        "Erro ao buscar missões:",
        erroMissoes?.message
      );

      return resultadoInicial;
    }

    const {
      data: progressos,
      error: erroProgressos,
    } = await supabase
      .from("progresso_missoes")
      .select("missao_id, progresso, data_missao")
      .eq("usuario_id", user.id);

    if (erroProgressos || !progressos) {
      console.warn(
        "Erro ao buscar progressos:",
        erroProgressos?.message
      );

      return resultadoInicial;
    }

    const hoje = getDataHoje();
    const inicioSemana = getInicioSemana();

    const resultado = {
      ...resultadoInicial,
    };

    for (const missao of missoes) {
      const referencia =
        missao.periodicidade === "semanal"
          ? inicioSemana
          : hoje;

      const progresso = progressos.find(
        (item) =>
          item.missao_id === missao.id &&
          item.data_missao === referencia
      );

      if (
        missao.codigo === "cadastrar_alimentos"
      ) {
        resultado.cadastrarAlimentos =
          progresso?.progresso ?? 0;
      } else if (
        missao.codigo === "verificar_validade"
      ) {
        resultado.verificarValidade =
          progresso?.progresso ?? 0;
      } else if (
        missao.codigo ===
        "cadastrar_alimentos_semanal"
      ) {
        resultado.cadastrarAlimentosSemanal =
          progresso?.progresso ?? 0;
      }
    }

    return resultado;
  } catch (erro) {
    console.error(
      "Erro ao buscar progresso das missões:",
      erro
    );

    return resultadoInicial;
  }
}

/*
 * ==========================================================
 * DADOS DAS MISSÕES PARA A TELA DE MISSÕES
 * ==========================================================
 *
 * Esta parte busca os dados cadastrados na tabela "missoes"
 * e combina com o progresso do usuário.
 *
 * Ela não altera a lógica existente de atualização das
 * missões.
 */

export type MissaoComProgresso = {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  meta: number;
  recompensa_pontos: number;
  periodicidade: string;
  progresso: number;
  concluida: boolean;
};

export async function buscarMissoesComProgresso(): Promise<
  MissaoComProgresso[]
> {
  try {
    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser();

    if (erroUsuario || !user) {
      console.warn(
        "Usuário não está logado."
      );

      return [];
    }

    /*
     * Busca os dados das missões diretamente
     * da tabela "missoes".
     */
    const {
      data: missoes,
      error: erroMissoes,
    } = await supabase
      .from("missoes")
      .select(`
        id,
        codigo,
        titulo,
        descricao,
        meta,
        recompensa_pontos,
        periodicidade
      `)
      .eq("ativa", true);

    if (erroMissoes || !missoes) {
      console.warn(
        "Erro ao buscar missões:",
        erroMissoes?.message
      );

      return [];
    }

    /*
     * Busca o progresso do usuário logado.
     */
    const {
      data: progressos,
      error: erroProgressos,
    } = await supabase
      .from("progresso_missoes")
      .select(`
        missao_id,
        progresso,
        concluida,
        data_missao
      `)
      .eq("usuario_id", user.id);

    if (erroProgressos) {
      console.warn(
        "Erro ao buscar progresso das missões:",
        erroProgressos.message
      );

      return [];
    }

    const hoje = getDataHoje();
    const inicioSemana = getInicioSemana();

    /*
     * Combina os dados da missão com
     * o progresso do usuário.
     */
    return missoes.map((missao) => {
      const dataReferencia =
        missao.periodicidade === "semanal"
          ? inicioSemana
          : hoje;

      const progressoMissao = progressos?.find(
        (item) =>
          item.missao_id === missao.id &&
          item.data_missao === dataReferencia
      );

      return {
        id: missao.id,
        codigo: missao.codigo,
        titulo: missao.titulo,
        descricao: missao.descricao,
        meta: missao.meta,
        recompensa_pontos:
          missao.recompensa_pontos,
        periodicidade:
          missao.periodicidade,
        progresso:
          progressoMissao?.progresso ?? 0,
        concluida:
          progressoMissao?.concluida ?? false,
      };
    });
  } catch (erro) {
    console.error(
      "Erro inesperado ao carregar missões:",
      erro
    );

    return [];
  }
}