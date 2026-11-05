import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  buscarMissoesComProgresso,
  MissaoComProgresso,
} from "../../src/services/missoes";

export default function Missoes() {
  const [missoes, setMissoes] = useState<
    MissaoComProgresso[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      async function carregarMissoes() {
        const dados =
          await buscarMissoesComProgresso();

        setMissoes(dados);
      }

      carregarMissoes();
    }, [])
  );

  const missoesDiarias = missoes.filter(
    (missao) => missao.periodicidade === "diaria"
  );

  const missoesSemanais = missoes.filter(
    (missao) => missao.periodicidade === "semanal"
  );

  function obterIcone(codigo: string) {
    if (codigo === "cadastrar_alimentos") {
      return "🥕";
    }

    if (codigo === "verificar_validade") {
      return "⚠️";
    }

    if (codigo === "cadastrar_alimentos_semanal") {
      return "🏆";
    }

    return "🎯";
  }

  function renderizarMissao(
    missao: MissaoComProgresso
  ) {
    const porcentagem =
      missao.meta > 0
        ? Math.min(
            (missao.progresso / missao.meta) * 100,
            100
          )
        : 0;

    return (
      <View style={styles.card} key={missao.id}>
        <Text style={styles.missaoTitulo}>
          {obterIcone(missao.codigo)} {missao.titulo}
        </Text>

        <Text style={styles.descricao}>
          {missao.descricao}
        </Text>

        <Text style={styles.progresso}>
          {missao.progresso}/{missao.meta}
        </Text>

        <View style={styles.barraFundo}>
          <View
            style={[
              styles.barraProgresso,
              {
                width: `${porcentagem}%`,
              },
            ]}
          />
        </View>

        {missao.concluida && (
          <Text style={styles.concluida}>
            ✓{" "}
            {missao.periodicidade === "semanal"
              ? "Missão semanal concluída!"
              : "Missão concluída!"}
          </Text>
        )}

        <Text style={styles.recompensa}>
          ⭐ +{missao.recompensa_pontos} pontos
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
    >
      <Text style={styles.titulo}>
        🎯 Missões Diárias
      </Text>

      <Text style={styles.subtitulo}>
        Complete suas missões de hoje!
      </Text>

      {missoesDiarias.map(renderizarMissao)}

      <Text style={styles.tituloSecao}>
        📅 Missões Semanais
      </Text>

      <Text style={styles.subtitulo}>
        Complete objetivos ao longo da semana!
      </Text>

      {missoesSemanais.map(renderizarMissao)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  conteudo: {
    padding: 20,
    paddingBottom: 35,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  tituloSecao: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
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