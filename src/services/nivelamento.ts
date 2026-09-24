import { supabase } from "../lib/supabase";

export const calcularExpNecessario = (nivelAtual: number) => {
  return nivelAtual * 100;
};

export const adicionarExp = async (expGanho: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: perfil, error } = await supabase
      .from("perfis")
      .select("nivel, exp")
      .eq("id", user.id)
      .single();

    if (error || !perfil) {
      console.error("Erro ao buscar perfil:", error);
      return null;
    }

    let novoNivel = perfil.nivel;
    let novoExp = perfil.exp + expGanho;
    let expNecessario = calcularExpNecessario(novoNivel);

    while (novoExp >= expNecessario) {
      novoExp -= expNecessario; // Subtrai o custo do nível e mantém o "troco" de exp
      novoNivel += 1; // Sobe de nível
      expNecessario = calcularExpNecessario(novoNivel); // Recalcula pro próximo nível
    }

    const { error: updateError } = await supabase
      .from("perfis")
      .update({ nivel: novoNivel, exp: novoExp })
      .eq("id", user.id);

    if (updateError) {
      console.error("Erro ao atualizar nível/exp:", updateError);
      return null;
    }

    // Retorna o resultado para mostrar um alerta de "Parabéns" na tela
    return { 
      nivel: novoNivel, 
      exp: novoExp, 
      upouDeNivel: novoNivel > perfil.nivel 
    };
  } catch (error) {
    console.error("Erro inesperado ao adicionar EXP:", error);
    return null;
  }
};

export const buscarProgressoNivel = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { nivel: 1, exp: 0 };

  const { data, error } = await supabase
    .from("perfis")
    .select("nivel, exp")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return { nivel: 1, exp: 0 };
  }

  return data;
};