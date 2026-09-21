import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { useTrofeus } from '../hooks/useTrofeus';
import { TrofeuUsuario } from '../types/trofeu';

/* ---------- Medalha (usada aqui e na tela de conquista) ---------- */
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// A coluna "icone" do banco guarda um nome de Ionicons; só aceitamos os desta lista
const ICONES_PERMITIDOS: Record<string, IoniconName> = {
  trophy: 'trophy',
  medal: 'medal',
  ribbon: 'ribbon',
  leaf: 'leaf',
  flame: 'flame',
  'shield-checkmark': 'shield-checkmark',
  restaurant: 'restaurant',
  star: 'star',
  earth: 'earth',
};

function resolverIcone(icone?: string | null): IoniconName {
  return (icone && ICONES_PERMITIDOS[icone]) || 'trophy';
}

interface TrofeuMedalhaProps {
  icone?: string | null;
  tamanho?: number;
  bloqueado?: boolean;
  /** Halos dourados em volta da medalha (tela de conquista) */
  comHalo?: boolean;
  /** Pulsação suave do halo */
  animado?: boolean;
}

export function TrofeuMedalha({
  icone,
  tamanho = 120,
  bloqueado = false,
  comHalo = false,
  animado = false,
}: TrofeuMedalhaProps) {
  const pulso = useSharedValue(1);

  useEffect(() => {
    if (!animado) return;
    pulso.value = withRepeat(
      withTiming(1.09, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [animado, pulso]);

  const estiloHalo = useAnimatedStyle(() => ({ transform: [{ scale: pulso.value }] }));

  const haloExterno = tamanho * 1.5;
  const haloInterno = tamanho * 1.24;
  const area = comHalo && !bloqueado ? haloExterno : tamanho;
  const interno = tamanho * 0.82;

  return (
    <View style={{ width: area, height: area, alignItems: 'center', justifyContent: 'center' }}>
      {comHalo && !bloqueado && (
        <>
          <Animated.View
            style={[
              styles.circulo,
              {
                width: haloExterno,
                height: haloExterno,
                borderRadius: haloExterno / 2,
                backgroundColor: '#FFD86B',
                opacity: 0.18,
              },
              estiloHalo,
            ]}
          />
          <View
            style={[
              styles.circulo,
              {
                width: haloInterno,
                height: haloInterno,
                borderRadius: haloInterno / 2,
                backgroundColor: '#FFD86B',
                opacity: 0.3,
              },
            ]}
          />
        </>
      )}

      <View
        style={[
          styles.medalha,
          {
            width: tamanho,
            height: tamanho,
            borderRadius: tamanho / 2,
            backgroundColor: bloqueado ? '#E3E8E2' : '#F3B93A',
          },
          !bloqueado && styles.sombraDourada,
        ]}
      >
        <View
          style={{
            width: interno,
            height: interno,
            borderRadius: interno / 2,
            backgroundColor: bloqueado ? '#F2F5F1' : '#FFD86B',
            borderWidth: Math.max(1.5, tamanho * 0.02),
            borderColor: bloqueado ? '#DDE3DC' : 'rgba(255,255,255,0.65)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={resolverIcone(icone)}
            size={tamanho * 0.4}
            color={bloqueado ? '#B3BDB5' : '#2F6B4A'}
          />
        </View>
      </View>

      {bloqueado && (
        <View
          style={[
            styles.cadeado,
            {
              width: tamanho * 0.32,
              height: tamanho * 0.32,
              borderRadius: tamanho * 0.16,
              right: (area - tamanho) / 2,
              bottom: (area - tamanho) / 2,
            },
          ]}
        >
          <Ionicons name="lock-closed" size={tamanho * 0.17} color="#8C9AA0" />
        </View>
      )}
    </View>
  );
}

/* ---------- Cartão de um troféu ---------- */
function CartaoTrofeu({ trofeu }: { trofeu: TrofeuUsuario }) {
  const percentual = Math.min(trofeu.progresso_atual / trofeu.meta_quantidade, 1) * 100;

  return (
    <View style={[styles.cartao, !trofeu.conquistado && styles.cartaoBloqueado]}>
      <TrofeuMedalha icone={trofeu.icone} tamanho={68} bloqueado={!trofeu.conquistado} />

      <Text style={[styles.nome, !trofeu.conquistado && styles.nomeBloqueado]} numberOfLines={2}>
        {trofeu.nome}
      </Text>
      <Text style={styles.descricao} numberOfLines={3}>
        {trofeu.descricao}
      </Text>

      {trofeu.conquistado ? (
        <Text style={styles.conquistadoEm}>
          Conquistado
          {trofeu.conquistado_em
            ? ` em ${new Date(trofeu.conquistado_em).toLocaleDateString('pt-BR')}`
            : ''}
        </Text>
      ) : (
        <View style={styles.progressoArea}>
          <View style={styles.barraFundo}>
            <View style={[styles.barraPreenchida, { width: `${percentual}%` }]} />
          </View>
          <Text style={styles.progressoTexto}>
            {trofeu.progresso_atual}/{trofeu.meta_quantidade}
          </Text>
        </View>
      )}
    </View>
  );
}

/* ---------- Lista: resumo + grade de troféus ---------- */
// Sem ScrollView próprio: coloque dentro de uma tela que já role.
export default function ListaTrofeus() {
  const { trofeus, loading, totalConquistados } = useTrofeus();
  const percentual = trofeus.length > 0 ? (totalConquistados / trofeus.length) * 100 : 0;

  return (
    <View>
      <View style={styles.resumo}>
        <Text style={styles.resumoTitulo}>Minhas conquistas</Text>
        <Text style={styles.resumoSubtitulo}>
          {totalConquistados} de {trofeus.length} troféus desbloqueados
        </Text>
        <View style={styles.barraFundo}>
          <View style={[styles.barraPreenchida, { width: `${percentual}%` }]} />
        </View>
      </View>

      {loading && trofeus.length === 0 ? (
        <ActivityIndicator color="#43855F" style={styles.carregando} />
      ) : trofeus.length === 0 ? (
        <Text style={styles.vazio}>Nenhum troféu disponível no momento.</Text>
      ) : (
        <View style={styles.grade}>
          {trofeus.map((trofeu) => (
            <CartaoTrofeu key={trofeu.trofeu_id} trofeu={trofeu} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circulo: { position: 'absolute' },
  medalha: { alignItems: 'center', justifyContent: 'center' },
  sombraDourada: {
    shadowColor: '#C98A00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  cadeado: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E3E8E2',
  },
  cartao: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAF2EC',
  },
  cartaoBloqueado: { backgroundColor: '#FBFBF8' },
  nome: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#26332D',
    textAlign: 'center',
  },
  nomeBloqueado: { color: '#8C9AA0' },
  descricao: {
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 16,
    color: '#8C9AA0',
    textAlign: 'center',
  },
  conquistadoEm: {
    marginTop: 10,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#43855F',
  },
  progressoArea: {
    width: '100%',
    marginTop: 10,
    alignItems: 'center',
    gap: 4,
  },
  barraFundo: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EAF2EC',
    overflow: 'hidden',
  },
  barraPreenchida: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#43855F',
  },
  progressoTexto: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#5F6F66',
  },
  resumo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EAF2EC',
  },
  resumoTitulo: { fontSize: 20, fontWeight: 'bold', color: '#26332D' },
  resumoSubtitulo: {
    marginTop: 2,
    marginBottom: 12,
    fontSize: 13.5,
    color: '#8C9AA0',
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  carregando: { marginTop: 32 },
  vazio: { textAlign: 'center', color: '#8C9AA0', marginTop: 32 },
});
