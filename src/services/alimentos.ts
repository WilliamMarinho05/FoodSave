import { supabase } from "../lib/supabase";

type NovoAlimento = {
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  dataCompra: string;
  validade: string;
};

export async function cadastrarAlimento(alimento: NovoAlimento) {
  // Descobre o usuário logado
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (erroUsuario) {
    throw new Error("Erro ao identificar usuário.");
  }

  if (!user) {
    throw new Error("Usuário não está logado.");
  }

  // Cadastra o alimento
  const { data, error } = await supabase
    .from("alimentos")
    .insert({
      usuario_id: user.id,

      nome: alimento.nome,
      categoria: alimento.categoria,

      quantidade_inicial: alimento.quantidade,
      quantidade_atual: alimento.quantidade,

      unidade_medida: alimento.unidade,

      data_compra: alimento.dataCompra,
      data_validade: alimento.validade,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao cadastrar alimento:", error.message);
    throw error;
  }

  return data;
}