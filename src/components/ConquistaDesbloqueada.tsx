import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react'; 
import{ 
    Modal,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

import Animated, {
    FadeInDown,
    FadeInUp,
    ZoomIn,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConquistasPendentes } from '../hooks/useTrofeus';

import { ROTULO_HABITO, TrofeuUsuario } from '../types/trofeu';
import { TrofeuMedalha } from './ListaTrofeus'; 

/* =====================================================================
 * Tela "Conquista Desbloqueada"
 * ===================================================================== */
interface ConquistaDesbloqueadaProps {
  trofeu: TrofeuUsuario | null;
  /** Quantas conquistas ainda aguardam depois desta */
  restantes?: number;
  onContinuar: () => void;
}

function Brilho({
  style,
  tamanho,
  atraso,
}: {
  style: StyleProp<ViewStyle>;
  tamanho: number;
  atraso: number;
}) {
  const brilho = useSharedValue(0.15);

  useEffect(() => {
    brilho.value = withDelay(
      atraso,
      withRepeat(
        withSequence(withTiming(1, { duration: 1000 }), withTiming(0.15, { duration: 1000 })),
        -1,
        false
      )
    );
  }, [atraso, brilho]);

  const animado = useAnimatedStyle(() => ({
    opacity: brilho.value,
    transform: [{ scale: 0.6 + brilho.value * 0.5 }],
  }));

  return (
    <Animated.View style={[styles.brilho, style, animado]}>
      <Ionicons name="sparkles" size={tamanho} color="#F2B632" />
    </Animated.View>
  );
}

function Conteudo({
  trofeu,
  restantes,
  onContinuar,
}: {
  trofeu: TrofeuUsuario;
  restantes: number;
  onContinuar: () => void;
}) {
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  return (
    <View style={styles.conteudo}>
      <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.topo}>
        <Text style={styles.eyebrow}>CONQUISTA DESBLOQUEADA</Text>
        {restantes > 0 && (
          <Text style={styles.contador}>
            + {restantes} {restantes === 1 ? 'conquista' : 'conquistas'} para ver
          </Text>
        )}
      </Animated.View>

      <View style={styles.centro}>
        <Animated.View entering={ZoomIn.delay(250).springify().damping(11)} style={styles.palco}>
          <TrofeuMedalha icone={trofeu.icone} tamanho={150} comHalo animado />
          <Brilho style={{ top: 6, left: 14 }} tamanho={22} atraso={0} />
          <Brilho style={{ top: 30, right: 4 }} tamanho={16} atraso={500} />
          <Brilho style={{ bottom: 22, left: 0 }} tamanho={16} atraso={900} />
          <Brilho style={{ bottom: 6, right: 22 }} tamanho={22} atraso={1300} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.textos}>
          <Text style={styles.nome}>{trofeu.nome}</Text>
          <View style={styles.chip}>
            <Text style={styles.chipTexto}>Hábito · {ROTULO_HABITO[trofeu.habito]}</Text>
          </View>
          <Text style={styles.descricao}>{trofeu.descricao}</Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(900).duration(600)} style={styles.base}>
        <View style={styles.cartaoMensagem}>
          <Ionicons name="leaf" size={18} color="#43855F" />
          <Text style={styles.mensagem}>{trofeu.mensagem_motivacional}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={restantes > 0 ? 'Ver próxima conquista' : 'Continuar'}
          onPress={onContinuar}
          style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado]}
        >
          <Text style={styles.botaoTexto}>{restantes > 0 ? 'Próxima conquista' : 'Continuar'}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function ConquistaDesbloqueada({
  trofeu,
  restantes = 0,
  onContinuar,
}: ConquistaDesbloqueadaProps) {
  const insets = useSafeAreaInsets();
  // Mantém o último troféu durante a animação de fechamento do Modal
  const ultimo = useRef<TrofeuUsuario | null>(null);
  if (trofeu) ultimo.current = trofeu;
  const exibido = trofeu ?? ultimo.current;

  return (
    <Modal
      visible={!!trofeu}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onContinuar}
    >
      <View
        style={[
          styles.tela,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.decoracaoTopo} />
        <View style={styles.decoracaoBase} />

        {exibido && (
          <Conteudo
            key={exibido.trofeu_id}
            trofeu={exibido}
            restantes={restantes}
            onContinuar={onContinuar}
          />
        )}
      </View>
    </Modal>
  );
}

/* =====================================================================
 * Watcher: monte UMA vez no app/_layout.tsx. Mostra a tela por cima de
 * qualquer página e, ao clicar em Continuar, o usuário volta de onde estava.
 * ===================================================================== */
export function ConquistaWatcher() {
  const { atual, restantes, dispensarAtual } = useConquistasPendentes();

  return (
    <>
      <ConquistaDesbloqueada trofeu={atual} restantes={restantes} onContinuar={dispensarAtual} />
    </>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#F4F8F2',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  decoracaoTopo: {
    position: 'absolute',
    top: -120,
    right: -110,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#E2F0E5',
  },
  decoracaoBase: {
    position: 'absolute',
    bottom: -140,
    left: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#EAF4E7',
  },
  conteudo: { flex: 1 },
  topo: { alignItems: 'center', gap: 6 },
  eyebrow: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: '#43855F',
  },
  contador: { fontSize: 12, color: '#8C9AA0' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  palco: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brilho: { position: 'absolute' },
  textos: { alignItems: 'center', marginTop: 8, paddingHorizontal: 8 },
  nome: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1F3B2C',
    textAlign: 'center',
  },
  chip: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#DDEEDF',
  },
  chipTexto: { fontSize: 12, fontWeight: '600', color: '#2E6B49' },
  descricao: {
    marginTop: 14,
    fontSize: 14.5,
    lineHeight: 21,
    color: '#5F6F66',
    textAlign: 'center',
  },
  base: { gap: 18 },
  cartaoMensagem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E3EEE5',
    shadowColor: '#2E6B49',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  mensagem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#465A4E',
    textAlign: 'center',
  },
  botao: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#43855F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#43855F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  botaoPressionado: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  botaoTexto: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
