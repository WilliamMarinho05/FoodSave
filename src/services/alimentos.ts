import { supabase } from "../lib/supabase";

export type AlimentoBanco = {
  id: string;
  nome: string;
  categoria: string;
  quantidade: string;
  unidade: string;
  peso: string;
  dataCompra: string;
  validade: string;
  status: string;
};

type NovoAlimento = {
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  peso?: string;
  dataCompra: string;
  validade: string;
};

// Converte DD/MM/AAAA para AAAA-MM-DD
function converterDataParaBanco(data: string) {
  if (!data) return null;

  // Se já estiver no formato do banco
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return data;
  }

  const partes = data.split("/");

  if (partes.length !== 3) {
    return null;
  }

  const [dia, mes, ano] = partes;

  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

// Converte AAAA-MM-DD para DD/MM/AAAA
function formatarData(data: string | null) {
  if (!data) return "";

  const somenteData = data.split("T")[0];
  const [ano, mes, dia] = somenteData.split("-");

  return `${dia}/${mes}/${ano}`;
}

export async function cadastrarAlimento(alimento: NovoAlimento) {
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

  const dataCompra = converterDataParaBanco(alimento.dataCompra);
  const validade = converterDataParaBanco(alimento.validade);

  if (!dataCompra) {
    throw new Error("Data de compra inválida.");
  }

  if (!validade) {
    throw new Error("Data de validade inválida.");
  }

  const { data, error } = await supabase
    .from("alimentos")
    .insert({
      usuario_id: user.id,

      nome: alimento.nome.trim(),
      categoria: alimento.categoria.trim(),

      quantidade_inicial: alimento.quantidade,
      quantidade_atual: alimento.quantidade,

      unidade_medida: alimento.unidade.trim(),

      data_compra: dataCompra,
      data_validade: validade,

      status: "EM_ESTOQUE",
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao cadastrar alimento:", error.message);
    throw error;
  }

  return data;
}

// Busca somente os alimentos que ainda estão em estoque
export async function buscarAlimentosEmEstoque(): Promise<AlimentoBanco[]> {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (erroUsuario) {
    console.error("Erro ao identificar usuário:", erroUsuario.message);
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
      data_compra,
      data_validade,
      status,
      criado_em
    `)
    .eq("usuario_id", user.id)
    .eq("status", "EM_ESTOQUE")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar alimentos:", error.message);
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    nome: item.nome,
    categoria: item.categoria ?? "",
    quantidade: String(item.quantidade_atual ?? 0),
    unidade: item.unidade_medida ?? "",
    peso: "",
    dataCompra: formatarData(item.data_compra),
    validade: formatarData(item.data_validade),
    status: item.status,
  }));
}