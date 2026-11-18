import BotaoVoltar from "@/src/components/BotaoVoltar";
import { useTheme } from "@/src/context/ThemeContext";
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
  const { cores } = useTheme();

  const [missoes, setMissoes] = useState<
    MissaoComProgresso[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      async function carregarMissoes() {
        const dados = await buscarMissoesComProgresso();
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

  function renderizarMissao(missao: MissaoComProgresso) {
    const porcentagem =
      missao.meta > 0
        ? Math.min(
            (missao.progresso / missao.meta) * 100,
            100
          )
        : 0;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: cores.card,
            borderColor: cores.borda,
          },
        ]}
        key={missao.id}
      >
        <Text
          style={[
            styles.missaoTitulo,
            { color: cores.texto },
          ]}
        >
          {obterIcone(missao.codigo)} {missao.titulo}
        </Text>

        <Text
          style={[
            styles.descricao,
            { color: cores.textoSecundario },
          ]}
        >
          {missao.descricao}
        </Text>

        <Text
          style={[
            styles.progresso,
            { color: cores.texto },
          ]}
        >
          {missao.progresso}/{missao.meta}
        </Text>

        <View
          style={[
            styles.barraFundo,
            { backgroundColor: cores.borda },
          ]}
        >
          <View
            style={[
              styles.barraProgresso,
              {
                width: `${porcentagem}%`,
                backgroundColor: cores.primaria,
              },
            ]}
          />
        </View>

        {missao.concluida && (
          <Text
            style={[
              styles.concluida,
              { color: cores.primariaTexto },
            ]}
          >
            ✓{" "}
            {missao.periodicidade === "semanal"
              ? "Missão semanal concluída!"
              : "Missão concluída!"}
          </Text>
        )}

        <Text
          style={[
            styles.recompensa,
            { color: cores.texto },
          ]}
        >
          ⭐ +{missao.recompensa_pontos} pontos
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: cores.fundo },
      ]}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.areaVoltar}>
        <BotaoVoltar />
      </View>

      <Text
        style={[
          styles.titulo,
          { color: cores.texto },
        ]}
      >
        🎯 Missões Diárias
      </Text>

      <Text
        style={[
          styles.subtitulo,
          { color: cores.textoSecundario },
        ]}
      >
        Complete suas missões de hoje!
      </Text>

      {missoesDiarias.map(renderizarMissao)}

      <Text
        style={[
          styles.tituloSecao,
          { color: cores.texto },
        ]}
      >
        📅 Missões Semanais
      </Text>

      <Text
        style={[
          styles.subtitulo,
          { color: cores.textoSecundario },
        ]}
      >
        Complete objetivos ao longo da semana!
      </Text>

      {missoesSemanais.map(renderizarMissao)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  conteudo: {
    padding: 20,
    paddingBottom: 35,
  },

  areaVoltar: {
    marginBottom: 20,
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
    marginBottom: 25,
  },

  card: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
  },

  missaoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  descricao: {
    fontSize: 15,
    marginBottom: 15,
  },

  progresso: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },

  barraFundo: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 12,
  },

  barraProgresso: {
    height: "100%",
  },

  recompensa: {
    fontSize: 14,
    fontWeight: "bold",
  },

  concluida: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
});