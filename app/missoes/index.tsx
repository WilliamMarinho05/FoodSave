import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

import { buscarProgressoMissoes } from "../../src/services/missoes";

export default function Missoes() {
  const [progressoCadastro, setProgressoCadastro] =
    useState(0);

  const [progressoValidade, setProgressoValidade] =
    useState(0);

  useFocusEffect(
    useCallback(() => {
      async function carregarProgresso() {
        const progresso =
          await buscarProgressoMissoes();

        setProgressoCadastro(
          progresso.cadastrarAlimentos
        );

        setProgressoValidade(
          progresso.verificarValidade
        );
      }

      carregarProgresso();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        🎯 Missões Diárias
      </Text>

      <Text style={styles.subtitulo}>
        Complete suas missões de hoje!
      </Text>

      {/* Missão 1 */}
      <View style={styles.card}>
        <Text style={styles.missaoTitulo}>
          🥕 Cadastrar alimentos
        </Text>

        <Text style={styles.descricao}>
          Cadastre 2 alimentos hoje.
        </Text>

        <Text style={styles.progresso}>
          {progressoCadastro}/2
        </Text>

        <View style={styles.barraFundo}>
          <View
            style={[
              styles.barraProgresso,
              {
                width: `${Math.min(
                  (progressoCadastro / 2) * 100,
                  100
                )}%`,
              },
            ]}
          />
        </View>

        {progressoCadastro >= 2 && (
          <Text style={styles.concluida}>
            ✓ Missão concluída!
          </Text>
        )}

        <Text style={styles.recompensa}>
          ⭐ +20 pontos
        </Text>
      </View>

      {/* Missão 2 */}
      <View style={styles.card}>
        <Text style={styles.missaoTitulo}>
          ⚠️ Verificar validade
        </Text>

        <Text style={styles.descricao}>
          Confira seus alimentos próximos do
          vencimento.
        </Text>

        <Text style={styles.progresso}>
          {progressoValidade}/1
        </Text>

        <View style={styles.barraFundo}>
          <View
            style={[
              styles.barraProgresso,
              {
                width: `${Math.min(
                  progressoValidade * 100,
                  100
                )}%`,
              },
            ]}
          />
        </View>

        {progressoValidade >= 1 && (
          <Text style={styles.concluida}>
            ✓ Missão concluída!
          </Text>
        )}

        <Text style={styles.recompensa}>
          ⭐ +30 pontos
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  missaoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  descricao: {
    fontSize: 15,
    color: "#555",
    marginBottom: 15,
  },

  progresso: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },

  barraFundo: {
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 12,
  },

  barraProgresso: {
    height: "100%",
    backgroundColor: "#65B32E",
  },

  recompensa: {
    fontSize: 14,
    fontWeight: "bold",
  },

  concluida: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#43855F",
    marginBottom: 8,
  },
});