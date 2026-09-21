import { usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase';
import {
    aoVerificarConquistas,
    getTrofeusPendentes,
    getTrofeusUsuario,
    marcarTrofeuVisualizado,
    obterSessao,
} from '../services/trofeus';
import { TrofeuUsuario } from '../types/trofeu';

// Lista completa de troféus (conquistados e bloqueados), para a tela de perfil
export function useTrofeus() {
  const pathname = usePathname();
  const [trofeus, setTrofeus] = useState<TrofeuUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = useCallback(async () => {
    try {
      setTrofeus(await getTrofeusUsuario());
    } catch (error) {
      console.error('Erro ao carregar troféus:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarrega ao montar e a cada navegação (o estoque pode ter mudado)
  useEffect(() => {
    carregarDados();
  }, [carregarDados, pathname]);

  // ...e quando um alimento é consumido
  useEffect(() => aoVerificarConquistas(carregarDados), [carregarDados]);

  const totalConquistados = trofeus.filter((t) => t.conquistado).length;

  return { trofeus, loading, refetch: carregarDados, totalConquistados };
}

// Fila de conquistas novas para exibir a tela "Conquista Desbloqueada"
export function useConquistasPendentes() {
  const pathname = usePathname();
  const [fila, setFila] = useState<TrofeuUsuario[]>([]);
  // Evita reexibir um troféu enquanto o "visualizado" ainda está sendo gravado
  const dispensados = useRef<Set<string>>(new Set());

  const verificar = useCallback(async () => {
    const sessao = await obterSessao();
    if (!sessao) {
      setFila([]);
      return;
    }

    const pendentes = await getTrofeusPendentes();
    setFila((atual) => {
      const ids = new Set(atual.map((t) => t.trofeu_id));
      const novos = pendentes.filter(
        (t) => !ids.has(t.trofeu_id) && !dispensados.current.has(t.trofeu_id)
      );
      return novos.length > 0 ? [...atual, ...novos] : atual;
    });
  }, []);

  // Confere ao abrir o app e a cada navegação (pega troféus concedidos por qualquer tela)
  useEffect(() => {
    verificar();
  }, [verificar, pathname]);

  useEffect(() => {
    const { data: auth } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'SIGNED_OUT') {
        dispensados.current.clear();
        setFila([]);
        return;
      }
      if (evento === 'SIGNED_IN') {
        // Não chamar o Supabase direto dentro do callback (pode travar o auth)
        setTimeout(verificar, 0);
      }
    });

    const appState = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') verificar();
    });

    const desinscrever = aoVerificarConquistas(verificar);

    return () => {
      auth.subscription.unsubscribe();
      appState.remove();
      desinscrever();
    };
  }, [verificar]);

  const atual = fila[0] ?? null;

  const dispensarAtual = useCallback(async () => {
    if (!atual) return;
    dispensados.current.add(atual.trofeu_id);
    setFila((f) => f.filter((t) => t.trofeu_id !== atual.trofeu_id));
    await marcarTrofeuVisualizado(atual.trofeu_id);
  }, [atual]);

  return { atual, restantes: Math.max(fila.length - 1, 0), dispensarAtual };
}
