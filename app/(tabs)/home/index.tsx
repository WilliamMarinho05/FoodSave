import PainelValidade from "@/src/components/PainelValidade";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {useRouter} from "expo-router";

export default function Home() {
  const router = useRouter()
  const [painel, setPainel] = useState({
    noPrazo: 12,
    atencao: 3,
    vencidos: 2,
  });

  const handleCadastrarAlimento = () => {
    router.push("/cadastrar_alimento")
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 20,
  },

  cardCadastrar: {
    width: "90%",
    minHeight: 100,

    marginTop: 25,
    padding: 20,

    borderWidth: 1,
    borderColor: "#D5D5D5",
    borderRadius: 12,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",
  },

  iconeContainer: {
    width: 50,
    height: 50,

    borderRadius: 25,

    backgroundColor: "#4CAF50",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 15,
  },

  icone: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
  },

  conteudoCard: {
    flex: 1,
  },

  tituloCard: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333333",
  },

  descricaoCard: {
    marginTop: 5,
    fontSize: 14,
    color: "#777777",
  },
});