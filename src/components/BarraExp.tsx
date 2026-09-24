import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { buscarProgressoNivel, calcularExpNecessario } from "../services/nivelamento";

export default function BarraExp() {
  const [nivel, setNivel] = useState(1);
  const [exp, setExp] = useState(0);

  // Recarrega os dados do Supabase sempre que a barra aparecer na tela
  useFocusEffect(
    useCallback(() => {
      async function carregarDados() {
        const dados = await buscarProgressoNivel();
        setNivel(dados.nivel);
        setExp(dados.exp);
      }
      carregarDados();
    }, [])
  );

  const expNecessario = calcularExpNecessario(nivel);
  const porcentagem = Math.min((exp / expNecessario) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.textoNivel}>Nível {nivel}</Text>
        <Text style={styles.textoExp}>{exp} / {expNecessario} XP</Text>
      </View>

      <View style={styles.barraFundo}>
        <View style={[styles.barraPreenchida, { width: `${porcentagem}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8E4",
    // Sombra leve para destacar
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  textoNivel: {
    color: "#374151",
    fontWeight: "800",
    fontSize: 16,
  },
  textoExp: {
    color: "#7B8491",
    fontSize: 14,
    fontWeight: "600",
  },
  barraFundo: {
    height: 12,
    backgroundColor: "#E2E8E4",
    borderRadius: 6,
    overflow: "hidden",
  },
  barraPreenchida: {
    height: "100%",
    backgroundColor: "#65B32E",
    borderRadius: 6,
  },
});