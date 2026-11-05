import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import ListaTrofeus from "../../src/components/ListaTrofeus";

export default function Trofeus() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#26332D"
          />
        </TouchableOpacity>

        <View style={styles.cabecalhoTexto}>
          <Text style={styles.titulo}>🏆 Troféus</Text>

          <Text style={styles.subtitulo}>
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
    backgroundColor: "#F7FAF7",
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },

  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  cabecalhoTexto: {
    flex: 1,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#26332D",
  },

  subtitulo: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: "#8C9AA0",
  },

  scroll: {
    flex: 1,
  },

  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },
});