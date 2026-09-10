import PainelValidade from "@/src/components/PainelValidade";
import { Alimento } from "@/src/types/alimento";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  
  const [painel, setPainel] = useState({
    noPrazo: 12,
    atencao: 3,
    vencidos: 2,
  });

  const [alimentos, setAlimentos] = useState<Alimento[]>([
    {
      id: "1",
      nome: "Macarrão Espaguete",
      categoria: "Massa",
      quantidade: "2",
      unidade: "Pacotes",
      peso: "500g",
      dataCompra: "15/10/2026",
      validade: "20/12/2026"
    },
    {
      id: "2",
      nome: "Leite Integral",
      categoria: "Laticínio",
      quantidade: "1",
      unidade: "Litro",
      peso: "1L",
      dataCompra: "01/09/2026",
      validade: "15/09/2026"
    }
  ]);

  const handleCadastrarAlimento = () => {
    router.push("/cadastrar_alimento");
  };

  const renderCardAlimento = ({ item }: { item: Alimento }) => {
    return (
      <Pressable
        style={styles.cardAlimento}
        onPress={() => {
          router.push({
            pathname: "../../alimento/[id]",
            params: {
              id: item.id,
              nome: item.nome,
              categoria: item.categoria,
              quantidade: item.quantidade,
              unidade: item.unidade,
              peso: item.peso,
              dataCompra: item.dataCompra,
              validade: item.validade,
            },
          });
        }}
      >
        <View style={styles.conteudoCardAlimento}>
          <Text style={styles.nomeAlimento}>{item.nome}</Text>
          <Text style={styles.infoAlimento}>Validade: {item.validade}</Text>
          <Text style={styles.infoAlimento}>Qtd: {item.quantidade} {item.unidade}</Text>
        </View>
        <View style={styles.setaContainer}>
          <Text style={styles.seta}>&gt;</Text>
        </View>
      </Pressable>
    );
  };

  return (
    
    <View style={styles.container}>
      <PainelValidade painel={painel} />

      <Pressable
        style={styles.cardCadastrar}
        onPress={handleCadastrarAlimento}
      >
        <View style={styles.iconeContainer}>
          <Text style={styles.icone}>+</Text>
        </View>

        <View style={styles.conteudoCard}>
          <Text style={styles.tituloCard}>
            Cadastrar novo alimento
          </Text>
          <Text style={styles.descricaoCard}>
            Adicione um novo alimento à sua lista
          </Text>
        </View>
      </Pressable>

      <View style={styles.listaContainer}>
        <Text style={styles.tituloLista}>Meus Alimentos</Text>
        <FlatList
          data={alimentos}
          keyExtractor={(item) => item.id!}
          renderItem={renderCardAlimento}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10, 
    backgroundColor: "#F8F7F1",
  },
  cardCadastrar: {
    width: "90%",
    padding: 12,
    marginTop: 15, 
    borderWidth: 1,
    borderColor: "#D5D5D5",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  iconeContainer: {
    width: 36,
    height: 36, 
    borderRadius: 18,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icone: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  conteudoCard: {
    flex: 1,
  },
  tituloCard: {
    fontSize: 15, 
    fontWeight: "bold",
    color: "#333333",
  },
  descricaoCard: {
    marginTop: 2,
    fontSize: 12, 
    color: "#777777",
  },
  
  
  listaContainer: {
    width: "90%",
    flex: 1,
    marginTop: 15,
  },
  tituloLista: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#26332D",
    marginBottom: 10,
  },
  cardAlimento: {
    backgroundColor: "#FFFFFF",
    padding: 12, 
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAF2EC",
  },
  conteudoCardAlimento: {
    flex: 1,
  },
  nomeAlimento: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#43855F",
    marginBottom: 2,
  },
  infoAlimento: {
    fontSize: 12,
    color: "#8C9AA0",
    marginTop: 1,
  },
  setaContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  seta: {
    fontSize: 16,
    color: "#43855F",
    fontWeight: "bold",
  },
});