import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { getResumoValidades } from '../services/painelAlimentos';

export function usePainelValidade() {
  const [painel, setPainel] = useState({ noPrazo: 0, atencao: 0, vencidos: 0 });
  const [loading, setLoading] = useState(true);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const dados = await getResumoValidades();
      setPainel(dados);
    } catch (error) {
      console.error('Erro ao carregar painel:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  return { painel, loading, refetch: carregarDados };
}