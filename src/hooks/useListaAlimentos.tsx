import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import {
  AlimentoBanco,
  buscarAlimentosEmEstoque,
} from "../services/alimentos";
import {
  diasAteValidade,
  normalizarTexto,
  StatusValidade,
  statusDaValidade,
} from "../utils/validade";

export type FiltroSituacao =
  | "todos"
  | "vencidos"
  | "hoje"
  | "proximos"
  | "longe";

export type Ordem = "vencimento_asc" | "vencimento_desc";

export type AlimentoComStatus = AlimentoBanco & {
  dias: number | null;
  status: StatusValidade;
};

export function useListaAlimentos() {
  const [alimentos, setAlimentos] = useState<AlimentoBanco[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(false);

  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState<FiltroSituacao>("todos");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<Ordem>("vencimento_asc");

  const carregar = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }
    setErro(false);

    try {
      setAlimentos(await buscarAlimentosEmEstoque());
    } catch (e) {
      console.error("Erro ao carregar alimentos:", e);
      setErro(true);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  // Calcula dias/status uma vez por item
  const comStatus = useMemo<AlimentoComStatus[]>(
    () =>
      alimentos.map((a) => {
        const dias = diasAteValidade(a.validade);
        return { ...a, dias, status: statusDaValidade(dias) };
      }),
    [alimentos]
  );

  // Categorias únicas (ignora maiúsculas/acentos), mantendo o 1º nome encontrado
  const categorias = useMemo(() => {
    const mapa = new Map<string, string>();
    comStatus.forEach((a) => {
      const chave = normalizarTexto(a.categoria);
      if (chave && !mapa.has(chave)) mapa.set(chave, a.categoria.trim());
    });
    return Array.from(mapa.values()).sort((a, b) => a.localeCompare(b));
  }, [comStatus]);

  const contagens = useMemo(
    () => ({
      todos: comStatus.length,
      vencidos: comStatus.filter((a) => a.dias !== null && a.dias < 0).length,
      hoje: comStatus.filter((a) => a.dias === 0).length,
      proximos: comStatus.filter(
        (a) => a.status === "atencao"
      ).length,
      longe: comStatus.filter((a) => a.status === "noPrazo").length,
    }),
    [comStatus]
  );

  const filtrados = useMemo(() => {
    const termo = normalizarTexto(busca);
    const catNorm = categoria ? normalizarTexto(categoria) : null;

    const lista = comStatus.filter((a) => {
      if (
        termo &&
        !normalizarTexto(a.nome).includes(termo) &&
        !normalizarTexto(a.categoria).includes(termo)
      ) {
        return false;
      }

      if (catNorm && normalizarTexto(a.categoria) !== catNorm) return false;

      switch (situacao) {
        case "vencidos":
          return a.status === "vencido";
        case "hoje":
          return a.dias === 0;
        case "proximos":
          return a.status === "atencao";
        case "longe":
          return a.status === "noPrazo";
        default:
          return true;
      }
    });

    // Mais vencido -> menos vencido (padrão). Itens sem data vão sempre ao fim.
    const sinal = ordem === "vencimento_asc" ? 1 : -1;
    return lista.sort((a, b) => {
      if (a.dias === null && b.dias === null) return a.nome.localeCompare(b.nome);
      if (a.dias === null) return 1;
      if (b.dias === null) return -1;
      if (a.dias !== b.dias) return (a.dias - b.dias) * sinal;
      return a.nome.localeCompare(b.nome);
    });
  }, [comStatus, busca, situacao, categoria, ordem]);

  const filtrosAtivos =
    (situacao !== "todos" ? 1 : 0) +
    (categoria ? 1 : 0) +
    (ordem !== "vencimento_asc" ? 1 : 0);

  const limparFiltros = useCallback(() => {
    setSituacao("todos");
    setCategoria(null);
    setOrdem("vencimento_asc");
  }, []);

  return {
    // dados
    filtrados,
    total: comStatus.length,
    categorias,
    contagens,
    // estado
    carregando,
    atualizando,
    erro,
    // filtros
    busca,
    setBusca,
    situacao,
    setSituacao,
    categoria,
    setCategoria,
    ordem,
    setOrdem,
    filtrosAtivos,
    limparFiltros,
    recarregar: carregar,
  };
}
