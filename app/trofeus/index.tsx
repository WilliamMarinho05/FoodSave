import BotaoVoltar from "@/src/components/BotaoVoltar";
import ListaTrofeus from "@/src/components/ListaTrofeus";
import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Trofeus() {
  const { cores } = useTheme();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: cores.fundo },
      ]}
    >
      <View
        style={[
          styles.cabecalho,
          { backgroundColor: cores.card },
        ]}
      >
        <BotaoVoltar />

        <View style={styles.cabecalhoTexto}>
          <Text
            style={[
              styles.titulo,
              { color: cores.texto },
            ]}
          >
            🏆 Troféus
          </Text>

          <Text
            style={[
              styles.subtitulo,
              { color: cores.textoSecundario },
            ]}
          >
            Acompanhe suas conquistas e seu progresso.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <ListaTrofeus />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  cabecalho: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },

  cabecalhoTexto: {
    marginTop: 10,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitulo: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },

  scroll: {
    flex: 1,
  },

  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },
});