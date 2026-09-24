import { supabase } from "../lib/supabase";

export type StatusHistorico =
  | "Consumido"
  | "Descartado"
  | "Vencido";

export type ItemHistorico = {
  id: string;
  nome: string;
  categoria: string;
  quantidade: string;
  unidade: string;
  data: string;
  status: StatusHistorico;
};

function formatarData(data: string | null | undefined) {
  if (!data) {
    return "-";
  }

  const somenteData = data.split("T")[0];
  const partes = somenteData.split("-");

  if (partes.length !== 3) {
    return data;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

// ----------------------------------------------------
// BUSCAR HISTÓRICO REAL DO SUPABASE
// ----------------------------------------------------

export async function buscarHistorico(): Promise<ItemHistorico[]> {
  try {
    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser();

    if (erroUsuario) {
      console.error(
        "Erro ao identificar usuário:",
        erroUsuario.message
      );

      return [];
    }

    if (!user) {
      console.warn("Usuário não está logado.");
      return [];
    }

    const { data, error } = await supabase
      .from("alimentos")
      .select(`
        id,
        nome,
        categoria,
        quantidade_atual,
        unidade_medida,
        status,
        data_validade,
        atualizado_em
      `)
      .eq("usuario_id", user.id)
      .in("status", [
        "CONSUMIDO",
        "DESCARTADO",
        "VENCIDO",
      ])
      .order("atualizado_em", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Erro ao buscar histórico:",
        error.message
      );

      return [];
    }

    const historico: ItemHistorico[] = (data ?? []).map(
      (item: any) => {
        let status: StatusHistorico;

        if (item.status === "CONSUMIDO") {
          status = "Consumido";
        } else if (item.status === "DESCARTADO") {
          status = "Descartado";
        } else {
          status = "Vencido";
        }

        return {
          id: item.id,
          nome: item.nome ?? "",
          categoria: item.categoria ?? "",
          quantidade: String(
            item.quantidade_atual ?? 0
          ),
          unidade: item.unidade_medida ?? "",
          data: formatarData(
            item.atualizado_em ??
              item.data_validade
          ),
          status,
        };
      }
    );

    return historico;
  } catch (erro) {
    console.error(
      "Erro inesperado ao buscar histórico:",
      erro
    );

    return [];
  }
}