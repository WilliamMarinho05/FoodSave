import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { consumirAlimento } from '../../src/services/alimentos';
import { atualizarProgressoMissao } from '../../src/services/missoes';

export default function DetalhesAlimento() {
  const router = useRouter();
  const { cores } = useTheme();
  const alimento = useLocalSearchParams();
  const [quantidadeAtual, setQuantidadeAtual] = useState(
    Number(alimento.quantidade ?? 0)
  );
  const [consumindo, setConsumindo] = useState(false);
  const [confirmacaoVisivel, setConfirmacaoVisivel] = useState(false);
  const consumindoRef = useRef(false);

  useEffect(() => {
    async function registrarVerificacao() {
      await atualizarProgressoMissao("verificar_validade");
    }

    registrarVerificacao();
  }, []);

  // Confirmar antes de executar: consumir baixa a quantidade e dá XP
  // (ação destrutiva), então o usuário escolhe antes de confirmar.
  const handleConsumir = () => {
    if (Platform.OS === "web") {
      // No web o Alert não é suportado; usa um modal próprio de confirmação
      setConfirmacaoVisivel(true);
      return;
    }

    Alert.alert(
      "Consumir alimento",
      `Consumir 1 ${alimento.unidade || "unidade"} de ${String(
        alimento.nome || "alimento"
      )}? Esta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Consumir", onPress: consumirAgora },
      ]
    );
  };

  const consumirAgora = async () => {
    // Evita duplo toque: ignora novos toques enquanto a operação está em andamento
    if (consumindoRef.current) return;

    consumindoRef.current = true;
    setConsumindo(true);

    try {
      const resultado = await consumirAlimento(
        String(alimento.id)
      );

      setQuantidadeAtual(resultado.quantidadeAtual);

      let mensagem = resultado.consumido 
        ? "Alimento consumido completamente!" 
        : `Alimento consumido! Restam ${resultado.quantidadeAtual}.`;

      if (resultado.xpGanhado) {
        mensagem += `\n+${resultado.xpGanhado} XP 🌟`;
      }

      if (resultado.resultadoExp?.upouDeNivel) {
        mensagem += `\n\n🎉 PARABÉNS! Você alcançou o Nível ${resultado.resultadoExp.nivel}!`;
      }

      if (resultado.consumido) {
        if (Platform.OS === "web") {
          // No web o Alert não executa o botão; navega em seguida
          Alert.alert("Alimento consumido", mensagem);
          router.back();
        } else {
          Alert.alert("Alimento consumido", mensagem, [
            { text: "OK", onPress: () => router.back() },
          ]);
        }
      } else {
        Alert.alert("Alimento consumido", mensagem);
      }
      
    } catch (erro) {
      console.error("Erro ao consumir alimento:", erro);
      Alert.alert(
        "Erro ao consumir",
        "Não foi possível consumir o alimento. Verifique sua conexão e tente novamente."
      );
    } finally {
      consumindoRef.current = false;
      setConsumindo(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: String(alimento.nome || "Detalhes"),
          headerShown: false,
          presentation: "transparentModal",
          animation: "fade",
        }}
      />

      <View style={[styles.overlayFundo, { backgroundColor: cores.overlay || 'rgba(0, 0, 0, 0.45)' }]}>
        {/* Área clicável ao redor para fechar a janela flutuante */}
        <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />

        {/* Janela Flutuante */}
        <View
          style={[
            styles.janelaFlutuante,
            { backgroundColor: cores.card, borderColor: cores.borda },
          ]}
        >
          {/* Topo da Janela */}
          <View style={styles.topoJanela}>
            <View style={styles.indicadorTopo} />
            <Pressable
              style={({ pressed }) => [
                styles.botaoFechar,
                { backgroundColor: cores.fundo, borderColor: cores.bordaSuave },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.back()}
              accessibilityLabel="Fechar detalhes"
            >
              <Ionicons name="close" size={18} color={cores.textoSecundario} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.conteudoScroll}
          >
            {/* Cabeçalho do Alimento */}
            <View style={styles.cabecalhoAlimento}>
              
              <Text style={[styles.nomeAlimento, { color: cores.primariaTexto }]}>
                {alimento.nome}
              </Text>

              {!!alimento.categoria && (
                <View style={[styles.badgeCategoria, { backgroundColor: cores.fundo, borderColor: cores.borda }]}>
                  <Text style={[styles.textoBadgeCategoria, { color: cores.primariaTexto }]}>
                    {alimento.categoria}
                  </Text>
                </View>
              )}
            </View>

            {/* Bloco de Informações */}
            <View
              style={[
                styles.blocoDetalhes,
                { backgroundColor: cores.fundo, borderColor: cores.bordaSuave },
              ]}
            >
              <View style={[styles.linhaDetalhe, { borderBottomColor: cores.bordaSuave }]}>
                <View style={styles.labelComIcone}>
                  <Ionicons name="layers-outline" size={16} color={cores.textoSecundario} />
                  <Text style={[styles.label, { color: cores.textoSecundario }]}>Quantidade</Text>
                </View>
                <Text style={[styles.valor, { color: cores.texto }]}>
                  {quantidadeAtual} {alimento.unidade}
                </Text>
              </View>

              <View style={[styles.linhaDetalhe, { borderBottomColor: cores.bordaSuave }]}>
                <View style={styles.labelComIcone}>
                  <Ionicons name="cart-outline" size={16} color={cores.textoSecundario} />
                  <Text style={[styles.label, { color: cores.textoSecundario }]}>Data de Compra</Text>
                </View>
                <Text style={[styles.valor, { color: cores.texto }]}>{alimento.dataCompra}</Text>
              </View>

              <View style={[styles.linhaDetalhe, styles.ultimaLinha]}>
                <View style={styles.labelComIcone}>
                  <Ionicons name="calendar-outline" size={16} color={cores.textoSecundario} />
                  <Text style={[styles.label, { color: cores.textoSecundario }]}>Validade</Text>
                </View>
                <Text style={[styles.valor, { color: cores.texto }]}>{alimento.validade}</Text>
              </View>
            </View>

            {/* Botão Principal */}
            <Pressable
              style={({ pressed }) => [
                styles.botaoConsumir,
                { backgroundColor: cores.primaria },
                (pressed || consumindo) && styles.botaoConsumirPressionado,
              ]}
              onPress={handleConsumir}
              disabled={consumindo}
              accessibilityRole="button"
              accessibilityState={{ disabled: consumindo, busy: consumindo }}
            >
              {consumindo ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="restaurant-outline"
                  size={20}
                  color="#FFFFFF"
                />
              )}

              <Text style={styles.textoBotaoConsumir}>
                {consumindo ? "Consumindo..." : "Consumir alimento"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>

      {/* CONFIRMAÇÃO (modal para o web, onde o Alert não é suportado) */}
      <Modal
        visible={confirmacaoVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmacaoVisivel(false)}
      >
        <View style={[styles.confirmarOverlay, { backgroundColor: cores.overlay }]}>
          <View
            style={[
              styles.confirmarCard,
              { backgroundColor: cores.card, borderColor: cores.borda },
            ]}
          >
            <Text style={[styles.confirmarTitulo, { color: cores.texto }]}>
              Consumir alimento
            </Text>

            <Text
              style={[styles.confirmarMensagem, { color: cores.textoSecundario }]}
            >
              Confirmar o consumo de 1 {alimento.unidade || "unidade"} de{" "}
              {String(alimento.nome || "alimento")}? Esta ação não pode ser
              desfeita.
            </Text>

            <View style={styles.confirmarBotoes}>
              <Pressable
                style={[
                  styles.confirmarBotao,
                  styles.confirmarBotaoSecundario,
                  { borderColor: cores.borda },
                ]}
                onPress={() => setConfirmacaoVisivel(false)}
              >
                <Text
                  style={[
                    styles.confirmarBotaoTextoSecundario,
                    { color: cores.textoSecundario },
                  ]}
                >
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.confirmarBotao,
                  { backgroundColor: cores.primaria },
                ]}
                onPress={() => {
                  setConfirmacaoVisivel(false);
                  consumirAgora();
                }}
              >
                <Text style={styles.confirmarBotaoTexto}>Consumir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlayFundo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  janelaFlutuante: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EAF2EC',
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  topoJanela: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
    minHeight: 32,
  },
  indicadorTopo: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6DFDA',
  },
  botaoFechar: {
    position: 'absolute',
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteudoScroll: {
    paddingBottom: 4,
  },
  cabecalhoAlimento: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconeDestaque: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nomeAlimento: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#43855F',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeCategoria: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  textoBadgeCategoria: {
    fontSize: 12,
    fontWeight: '600',
  },
  blocoDetalhes: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
  },
  linhaDetalhe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  ultimaLinha: {
    borderBottomWidth: 0,
  },
  labelComIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#8C9AA0',
    fontWeight: '500',
  },
  valor: {
    fontSize: 14,
    color: '#26332D',
    fontWeight: 'bold',
  },
  botaoConsumir: {
    height: 48,
    backgroundColor: '#43855F',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#43855F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  botaoConsumirPressionado: {
    opacity: 0.75,
  },
  textoBotaoConsumir: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  confirmarOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmarCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  confirmarTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmarMensagem: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  confirmarBotoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  confirmarBotao: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmarBotaoSecundario: {
    borderWidth: 1,
  },
  confirmarBotaoTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmarBotaoTextoSecundario: {
    fontSize: 14,
    fontWeight: '600',
  },
});