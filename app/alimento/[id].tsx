import { Ionicons } from '@expo/vector-icons';
import { atualizarProgressoMissao } from '../../src/services/missoes';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React , { useEffect,useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { consumirAlimento } from '../../src/services/alimentos';

export default function DetalhesAlimento() {
  const router = useRouter();
  const alimento = useLocalSearchParams();
  const [quantidadeAtual, setQuantidadeAtual] = useState(
  Number(alimento.quantidade ?? 0)
);

  useEffect(() => {
  async function registrarVerificacao() {
    await atualizarProgressoMissao("verificar_validade");
  }

  registrarVerificacao();
}, []);

  const handleConsumir = async () => {
  try {
    const resultado = await consumirAlimento(
      String(alimento.id)
    );

    setQuantidadeAtual(resultado.quantidadeAtual);

    if (resultado.consumido) {
      alert("Alimento consumido completamente!");
      router.back();
      return;
    }

    alert(
      `Alimento consumido! Restam ${resultado.quantidadeAtual}.`
    );
  } catch (erro) {
    console.error("Erro ao consumir alimento:", erro);
    alert("Não foi possível consumir o alimento.");
  }
};


  return (
    
    <ScrollView style={styles.container}>
    <Stack.Screen options={{ title: String(alimento.nome || "Detalhes") }} />
      <View style={styles.cabecalho}>
        <Pressable style={styles.botaoVoltar} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#43855F" />
        </Pressable>
        <Text style={styles.titulo}>Detalhes do Alimento</Text>
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.nomeAlimento}>{alimento.nome}</Text>
        
        <View style={styles.linhaDetalhe}>
          <Text style={styles.label}>Categoria:</Text>
          <Text style={styles.valor}>{alimento.categoria}</Text>
        </View>

        <View style={styles.linhaDetalhe}>
          <Text style={styles.label}>Quantidade:</Text>
          <Text style={styles.valor}> {quantidadeAtual} {alimento.unidade}</Text>
        </View>

        <View style={styles.linhaDetalhe}>
          <Text style={styles.label}>Peso:</Text>
          <Text style={styles.valor}>{alimento.peso}</Text>
        </View>

        <View style={styles.linhaDetalhe}>
          <Text style={styles.label}>Data de Compra:</Text>
          <Text style={styles.valor}>{alimento.dataCompra}</Text>
        </View>

        <View style={styles.linhaDetalhe}>
          <Text style={styles.label}>Validade:</Text>
          <Text style={styles.valor}>{alimento.validade}</Text>
        </View>
      </View>
      <Pressable
      style={styles.botaoConsumir}
      onPress={handleConsumir}
    >
      <Ionicons
        name="restaurant-outline"
        size={20}
        color="#FFFFFF"
      />

      <Text style={styles.textoBotaoConsumir}>
        Consumir alimento
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

textoBotaoConsumir: {
  color: "#FFFFFF",
  fontSize: 13,
  fontWeight: "bold",
  marginLeft: 8,
},
});