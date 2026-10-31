import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  const consumindoRef = useRef(false);

  useEffect(() => {
  async function registrarVerificacao() {
    await atualizarProgressoMissao("verificar_validade");
  }

  registrarVerificacao();
}, []);

  const handleConsumir = async () => {
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
     
    <ScrollView style={[styles.container, { backgroundColor: cores.fundo }]}>
    <Stack.Screen options={{ title: String(alimento.nome || "Detalhes") }} />
      <View style={styles.cabecalho}>
        <Pressable
          style={[styles.botaoVoltar, { backgroundColor: cores.card }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={cores.primariaTexto} />
        </Pressable>
        <Text style={[styles.titulo, { color: cores.texto }]}>
          Detalhes do Alimento
        </Text>
      </View>

      <View
        style={[
          styles.cardInfo,
          { backgroundColor: cores.card, borderColor: cores.borda },
        ]}
      >
        <Text style={[styles.nomeAlimento, { color: cores.primariaTexto }]}>
          {alimento.nome}
        </Text>
        
        <View style={[styles.linhaDetalhe, { borderBottomColor: cores.bordaSuave }]}>
          <Text style={[styles.label, { color: cores.textoSecundario }]}>Categoria:</Text>
          <Text style={[styles.valor, { color: cores.texto }]}>{alimento.categoria}</Text>
        </View>

        <View style={[styles.linhaDetalhe, { borderBottomColor: cores.bordaSuave }]}>
          <Text style={[styles.label, { color: cores.textoSecundario }]}>Quantidade:</Text>
          <Text style={[styles.valor, { color: cores.texto }]}> {quantidadeAtual} {alimento.unidade}</Text>
        </View>

        <View style={[styles.linhaDetalhe, { borderBottomColor: cores.bordaSuave }]}>
          <Text style={[styles.label, { color: cores.textoSecundario }]}>Peso:</Text>
          <Text style={[styles.valor, { color: cores.texto }]}>{alimento.peso}</Text>
        </View>

        <View style={[styles.linhaDetalhe, { borderBottomColor: cores.bordaSuave }]}>
          <Text style={[styles.label, { color: cores.textoSecundario }]}>Data de Compra:</Text>
          <Text style={[styles.valor, { color: cores.texto }]}>{alimento.dataCompra}</Text>
        </View>

        <View style={[styles.linhaDetalhe, { borderBottomColor: cores.bordaSuave }]}>
          <Text style={[styles.label, { color: cores.textoSecundario }]}>Validade:</Text>
          <Text style={[styles.valor, { color: cores.texto }]}>{alimento.validade}</Text>
        </View>
      </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F1',
    paddingHorizontal: 16,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  botaoVoltar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#26332D',
  },
  cardInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAF2EC',
  },
  nomeAlimento: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#43855F',
    marginBottom: 20,
    textAlign: 'center',
  },
  linhaDetalhe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  height: 45,
  backgroundColor: "#43855F",
  borderRadius: 22,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
  marginTop: 15,
},

botaoConsumirPressionado: {
  opacity: 0.7,
},

textoBotaoConsumir: {
  color: "#FFFFFF",
  fontSize: 13,
  fontWeight: "bold",
  marginLeft: 8,
},
});