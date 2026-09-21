import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react'; // useState: usado só na GAMBIARRA DEV
import {
    Modal,
    Pressable,
    ScrollView, // GAMBIARRA DEV
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
import { supabase } from '../lib/supabase'; // GAMBIARRA DEV
import {
    emitirVerificarConquistas, // GAMBIARRA DEV
    marcarAlimentoComoConsumido, // GAMBIARRA DEV
    obterSessao, // GAMBIARRA DEV
} from '../services/trofeus';
import { ROTULO_HABITO, TrofeuUsuario } from '../types/trofeu';
import ListaTrofeus, { TrofeuMedalha } from './ListaTrofeus'; // GAMBIARRA DEV: ao remover, deixe só { TrofeuMedalha }

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
      {__DEV__ && <PainelDevTrofeus />}
      {/* ↑ GAMBIARRA DEV (apagar esta linha) */}
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

// ===== GAMBIARRA DEV: início (apagar até o "fim" quando o login funcionar) =====
// Painel de testes: botão flutuante "🏆 Testes" que abre um painel por cima do app.
const PREFIXO_TESTE = '[TESTE] ';

const TROFEU_SIMULADO: TrofeuUsuario = {
  trofeu_id: 'simulado',
  codigo: 'mestre_da_validade',
  nome: 'Mestre da Validade',
  descricao: 'Salve 15 alimentos que estavam próximos do vencimento.',
  mensagem_motivacional:
    'Sua atitude faz a diferença na cozinha e no seu bolso. Continue transformando hábitos em conquistas!',
  icone: 'trophy',
  habito: 'VALIDADE',
  meta_quantidade: 15,
  ordem: 20,
  conquistado: true,
  conquistado_em: new Date().toISOString(),
  visualizado: false,
  progresso_atual: 15,
};

// Data local (AAAA-MM-DD) daqui a N dias
function dataDaquiADias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function PainelDevTrofeus() {
  const insets = useSafeAreaInsets();
  const [aberto, setAberto] = useState(false);
  const [simulando, setSimulando] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [log, setLog] = useState('');

  useEffect(() => {
    if (!aberto) return;
    obterSessao().then((sessao) => setEmail(sessao?.user.email ?? null));
  }, [aberto]);

  async function criarEConsumir(quantidade: number) {
    setOcupado(true);
    try {
      const sessao = await obterSessao();
      if (!sessao) {
        setLog('Sem sessão. Defina EXPO_PUBLIC_DEV_EMAIL e EXPO_PUBLIC_DEV_SENHA no .env.');
        return;
      }

      const validade = dataDaquiADias(2);
      let consumidos = 0;

      for (let i = 1; i <= quantidade; i++) {
        setLog(`Criando e consumindo ${i}/${quantidade}...`);

        const { data, error } = await supabase
          .from('alimentos')
          .insert({
            usuario_id: sessao.user.id,
            nome: `${PREFIXO_TESTE}${i}`,
            categoria: 'Teste',
            quantidade_inicial: 1,
            quantidade_atual: 1,
            unidade_medida: 'unidade',
            data_validade: validade,
          })
          .select('id')
          .single();

        if (error || !data) {
          setLog(`Erro ao criar alimento: ${error?.message}`);
          return;
        }

        if (await marcarAlimentoComoConsumido(data.id)) consumidos++;
      }

      setLog(`Pronto: ${consumidos}/${quantidade} alimentos consumidos (vencendo em 2 dias).`);
    } finally {
      setOcupado(false);
    }
  }

  async function apagarAlimentosTeste() {
    setOcupado(true);
    try {
      const { data, error } = await supabase
        .from('alimentos')
        .delete()
        .like('nome', `${PREFIXO_TESTE}%`)
        .select('id');

      setLog(
        error
          ? `Erro ao apagar: ${error.message}`
          : `${data?.length ?? 0} alimentos de teste apagados. Troféus já conquistados continuam.`
      );
    } finally {
      setOcupado(false);
    }
  }

  if (!aberto) {
    return (
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <Pressable onPress={() => setAberto(true)} style={estilosDev.botaoFlutuante}>
          <Text style={estilosDev.botaoFlutuanteTexto}>🏆 Testes</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, estilosDev.tela, { paddingTop: insets.top + 8 }]}>
      <View style={estilosDev.cabecalho}>
        <Text style={estilosDev.titulo}>Testes de troféus</Text>
        <Pressable onPress={() => setAberto(false)} hitSlop={12}>
          <Text style={estilosDev.fechar}>Fechar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={estilosDev.conteudo}>
        <View style={estilosDev.cartao}>
          <Text style={estilosDev.rotulo}>Usuário ativo</Text>
          <Text style={estilosDev.valor}>{email ?? 'Sem sessão (o banco não responderá)'}</Text>
        </View>

        <Text style={estilosDev.secao}>Sem banco</Text>
        <BotaoDev titulo="Ver tela de conquista (simulação)" onPress={() => setSimulando(true)} />

        <Text style={estilosDev.secao}>Com banco (usa o usuário ativo)</Text>
        <BotaoDev
          titulo="Criar e consumir 1 alimento"
          onPress={() => criarEConsumir(1)}
          desabilitado={ocupado}
        />
        <BotaoDev
          titulo="Criar e consumir 15 alimentos"
          onPress={() => criarEConsumir(15)}
          desabilitado={ocupado}
        />
        <BotaoDev
          titulo="Verificar troféus pendentes agora"
          onPress={() => emitirVerificarConquistas()}
          desabilitado={ocupado}
        />
        <BotaoDev
          titulo="Apagar alimentos de teste"
          onPress={apagarAlimentosTeste}
          desabilitado={ocupado}
          secundario
        />

        {log !== '' && <Text style={estilosDev.log}>{log}</Text>}

        <Text style={estilosDev.secao}>Como fica a lista de troféus</Text>
        <ListaTrofeus />
      </ScrollView>

      <ConquistaDesbloqueada
        trofeu={simulando ? TROFEU_SIMULADO : null}
        onContinuar={() => setSimulando(false)}
      />
    </View>
  );
}

function BotaoDev({
  titulo,
  onPress,
  desabilitado,
  secundario,
}: {
  titulo: string;
  onPress: () => void;
  desabilitado?: boolean;
  secundario?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      style={[
        estilosDev.botao,
        secundario && estilosDev.botaoSecundario,
        desabilitado && estilosDev.botaoDesabilitado,
      ]}
    >
      <Text style={[estilosDev.botaoTexto, secundario && estilosDev.botaoTextoSecundario]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

const estilosDev = StyleSheet.create({
  botaoFlutuante: {
    position: 'absolute',
    right: 12,
    bottom: 96,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(31,59,44,0.88)',
  },
  botaoFlutuanteTexto: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  tela: { backgroundColor: '#F8F7F1' },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#26332D' },
  fechar: { fontSize: 15, fontWeight: '600', color: '#43855F' },
  conteudo: { padding: 16, paddingBottom: 40 },
  cartao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAF2EC',
  },
  rotulo: { fontSize: 12, color: '#8C9AA0', fontWeight: '500' },
  valor: { fontSize: 15, color: '#26332D', fontWeight: 'bold', marginTop: 2 },
  secao: { marginTop: 22, marginBottom: 8, fontSize: 13, fontWeight: 'bold', color: '#43855F' },
  botao: {
    backgroundColor: '#43855F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoSecundario: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#43855F' },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  botaoTextoSecundario: { color: '#43855F' },
  log: { marginTop: 8, fontSize: 13, color: '#5F6F66', lineHeight: 19 },
});
// ===== GAMBIARRA DEV: fim =====
