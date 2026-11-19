import { supabase } from "../lib/supabase";
import { adicionarExp } from "./nivelamento";

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

export type NovoAlimento = {
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  peso?: number | null;
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

type LinhaAlimento = {
  usuario_id: string;
  nome: string;
  categoria: string;
  quantidade_inicial: number;
  quantidade_atual: number;
  unidade_medida: string;
  data_compra: string;
  data_validade: string;
  peso?: number;
  status: string;
};

async function obterUsuarioLogado() {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (erroUsuario) {
    console.error("Erro ao identificar usuário:", erroUsuario.message);
    throw new Error("Erro ao identificar usuário.");
  }

  if (!user) {
    throw new Error("Usuário não está logado.");
  }

  return user;
}

// Valida e monta a linha que vai para a tabela alimentos. Usada tanto no
// cadastro individual quanto no cadastro em lote da nota fiscal.
function prepararLinha(usuarioId: string, alimento: NovoAlimento): LinhaAlimento {
  const dataCompra = converterDataParaBanco(alimento.dataCompra);
  const validade = converterDataParaBanco(alimento.validade);

  if (!dataCompra) throw new Error("Data de compra inválida.");
  if (!validade) throw new Error("Data de validade inválida.");
  if (validade < dataCompra) {
    throw new Error("A validade não pode ser antes da data de compra.");
  }

  const nome = alimento.nome.trim();
  const categoria = alimento.categoria.trim();
  const unidade = alimento.unidade.trim();

  if (!nome) throw new Error("Informe o nome do alimento.");
  if (!categoria) throw new Error("Informe a categoria do alimento.");
  if (!unidade) throw new Error("Informe a unidade do alimento.");

  if (
    !Number.isFinite(alimento.quantidade) ||
    !Number.isInteger(alimento.quantidade) ||
    alimento.quantidade <= 0
  ) {
    throw new Error("A quantidade deve ser um número inteiro maior que zero.");
  }

  return {
    usuario_id: usuarioId,
    nome,
    categoria,
    quantidade_inicial: alimento.quantidade,
    quantidade_atual: alimento.quantidade,
    unidade_medida: unidade,
    data_compra: dataCompra,
    data_validade: validade,
    // Só envia o peso quando informado (coluna "peso" na tabela alimentos)
    ...(alimento.peso != null ? { peso: alimento.peso } : {}),
    status: "EM_ESTOQUE",
  };
}

export async function cadastrarAlimento(alimento: NovoAlimento) {
  const user = await obterUsuarioLogado();
  const linha = prepararLinha(user.id, alimento);

  const { data, error } = await supabase
    .from("alimentos")
    .insert(linha)
    .select()
    .single();

  if (error) {
    console.error("Erro ao cadastrar alimento:", error.message);
    throw error;
  }

  return data;
}

/**
 * Cadastra vários alimentos de uma só vez (usado pela leitura da nota fiscal).
 * O insert com várias linhas é uma única transação no banco: ou todos os itens
 * entram na lista do usuário, ou nenhum entra.
 *
 * @returns quantidade de alimentos efetivamente cadastrados
 */
export async function cadastrarAlimentosEmLote(
  alimentos: NovoAlimento[]
): Promise<number> {
  if (alimentos.length === 0) {
    throw new Error("Nenhum alimento para cadastrar.");
  }

  const user = await obterUsuarioLogado();
  const linhas = alimentos.map((alimento) => prepararLinha(user.id, alimento));

  const { data, error } = await supabase
    .from("alimentos")
    .insert(linhas)
    .select("id");

  if (error) {
    console.error("Erro ao cadastrar alimentos em lote:", error.message);
    throw error;
  }

  return data?.length ?? linhas.length;
}

// Nomes, categorias e unidades que o usuário já cadastrou (mais recentes primeiro),
// usados para sugerir opções no formulário de cadastro
export async function buscarOpcoesCadastro() {
  const vazio = {
    nomes: [] as string[],
    categorias: [] as string[],
    unidades: [] as string[],
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return vazio;

  const { data, error } = await supabase
    .from("alimentos")
    .select("nome, categoria, unidade_medida")
    .eq("usuario_id", user.id)
    .order("criado_em", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Erro ao buscar opções de cadastro:", error.message);
    return vazio;
  }

  const unicos = (valores: (string | null)[]) => {
    const vistos = new Set<string>();
    const lista: string[] = [];

    for (const valor of valores) {
      const texto = (valor ?? "").trim();
      const chave = texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      if (!texto || vistos.has(chave)) continue;

      vistos.add(chave);
      lista.push(texto);
    }

    return lista;
  };

  const linhas = data ?? [];

  return {
    nomes: unicos(linhas.map((l) => l.nome)),
    categorias: unicos(linhas.map((l) => l.categoria)),
    unidades: unicos(linhas.map((l) => l.unidade_medida)),
  };
}

// Busca somente os alimentos que ainda estão em estoque
export async function buscarAlimentosEmEstoque(): Promise<AlimentoBanco[]> {
  const {
    data: { user },
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (erroUsuario) {
    console.error("Erro ao identificar usuário:", erroUsuario.message);
    throw new Error("Erro ao identificar usuário.");
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
    throw new Error("Erro ao buscar alimentos.");
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
export async function consumirAlimento(alimentoId: string) {
  const { data: { user }, error: erroUsuario } = await supabase.auth.getUser();

  if (erroUsuario) throw new Error("Erro ao identificar usuário.");
  if (!user) throw new Error("Usuário não está logado.");

  const { data: alimento, error: erroBusca } = await supabase
    .from("alimentos")
    .select("id, quantidade_atual, status")
    .eq("id", alimentoId)
    .eq("usuario_id", user.id)
    .single();

  if (erroBusca || !alimento) throw new Error("Alimento não encontrado.");

  const quantidadeAtual = Number(alimento.quantidade_atual ?? 0);

  if (quantidadeAtual <= 0) {
    throw new Error("Este alimento não possui quantidade disponível.");
  }

  const novaQuantidade = Math.max(quantidadeAtual - 1, 0);
  const alimentoConsumido = novaQuantidade === 0;

  const { error: erroAtualizacao } = await supabase
    .from("alimentos")
    .update({
      quantidade_atual: novaQuantidade,
      status: alimentoConsumido ? "CONSUMIDO" : "EM_ESTOQUE",
      data_encerramento: alimentoConsumido ? new Date().toISOString() : null,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", alimentoId)
    .eq("usuario_id", user.id);

  if (erroAtualizacao) {
    console.error("Erro ao consumir alimento:", erroAtualizacao.message);
    throw erroAtualizacao;
  }

  
  const xpGanhado = alimentoConsumido ? 25 : 10; 
  const resultadoExp = await adicionarExp(xpGanhado);

  return {
    quantidadeAtual: novaQuantidade,
    consumido: alimentoConsumido,
    xpGanhado,
    resultadoExp 
  };
}