import PainelValidade from "@/src/components/PainelValidade";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Home() {
  // O estado fica na Home para que o botão consiga alterá-lo
  const [painel, setPainel] = useState({
    noPrazo: 12,
    atencao: 3,
    vencidos: 2,
  });

  const handleCadastrarAlimento = () => {
    // Incrementa +1 no card "NO PRAZO"
    setPainel((prev) => ({
      ...prev,
      noPrazo: prev.noPrazo + 1,
    }));
  };

  return (
    <View style={styles.container}>
      <PainelValidade painel={painel} />

      <Pressable style={styles.botaoCadastrar} onPress={handleCadastrarAlimento}>
        <Text style={styles.textoBotao}>+ Cadastrar novo alimento</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },

  botaoCadastrar: {
    marginTop: 25,
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  textoBotao: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});