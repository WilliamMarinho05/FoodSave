import { supabase } from "../lib/supabase";

function getDataHoje() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

// Atualiza o progresso de uma missão
export async function atualizarProgressoMissao(
  codigoMissao: string
) {
  try {
    // Descobre qual usuário está logado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("Usuário não está logado.");
      return;
    }

    // Busca a missão
    const { data: missao, error: erroMissao } = await supabase
      .from("missoes")
      .select("id, meta")
      .eq("codigo", codigoMissao)
      .eq("ativa", true)
      .single();

    if (erroMissao || !missao) {
      console.warn(
        "Missão não encontrada:",
        erroMissao?.message
      );
      return;
    }

    const dataHoje = getDataHoje();

    // Busca o progresso de hoje
    const {
      data: progressoAtual,
      error: erroProgresso,
    } = await supabase
      .from("progresso_missoes")
      .select("id, progresso, concluida")
      .eq("usuario_id", user.id)
      .eq("missao_id", missao.id)
      .eq("data_missao", dataHoje)
      .maybeSingle();

    if (erroProgresso) {
      console.warn(
        "Erro ao buscar progresso:",
        erroProgresso.message
      );
      return;
    }

    const progressoAnterior =
      progressoAtual?.progresso ?? 0;

    const novoProgresso = Math.min(
      progressoAnterior + 1,
      missao.meta
    );

    const concluida = novoProgresso >= missao.meta;

    // Se ainda não existe progresso hoje, cria
    if (!progressoAtual) {
      const { error } = await supabase
        .from("progresso_missoes")
        .insert({
          usuario_id: user.id,
          missao_id: missao.id,
          data_missao: dataHoje,
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

      return;
    }

    // Se já existe, atualiza
    const { error } = await supabase
      .from("progresso_missoes")
      .update({
        progresso: novoProgresso,
        concluida,
        concluida_em: concluida
          ? progressoAtual.concluida
            ? undefined
            : new Date().toISOString()
          : null,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", progressoAtual.id);

    if (error) {
      console.warn(
        "Erro ao atualizar progresso:",
        error.message
      );
    }
  } catch (erro) {
    console.error(
      "Erro inesperado ao atualizar missão:",
      erro
    );
  }
}

// Busca o progresso das missões de hoje
export async function buscarProgressoMissoes() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("Usuário não está logado.");

      return {
        cadastrarAlimentos: 0,
        verificarValidade: 0,
      };
    }

    const hoje = getDataHoje();

    const { data, error } = await supabase
      .from("progresso_missoes")
      .select(`
        progresso,
        missoes (
          codigo
        )
      `)
      .eq("usuario_id", user.id)
      .eq("data_missao", hoje);

    if (error) {
      console.warn(
        "Erro ao buscar progresso das missões:",
        error.message
      );

      return {
        cadastrarAlimentos: 0,
        verificarValidade: 0,
      };
    }

    let cadastrarAlimentos = 0;
    let verificarValidade = 0;

    data?.forEach((item: any) => {
      if (
        item.missoes?.codigo ===
        "cadastrar_alimentos"
      ) {
        cadastrarAlimentos = item.progresso;
      }

      if (
        item.missoes?.codigo ===
        "verificar_validade"
      ) {
        verificarValidade = item.progresso;
      }
    });

    return {
      cadastrarAlimentos,
      verificarValidade,
    };
  } catch (erro) {
    console.error(
      "Erro inesperado ao buscar progresso:",
      erro
    );

    return {
      cadastrarAlimentos: 0,
      verificarValidade: 0,
    };
  }
}