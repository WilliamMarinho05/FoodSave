import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function Frutas() {
  const router = useRouter();
  const { cores } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Pressable
        style={styles.voltar}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={cores.primariaTexto} />
        <Text style={[styles.voltarTexto, { color: cores.primariaTexto }]}>
          Voltar
        </Text>
      </Pressable>

      <Text style={[styles.titulo, { color: cores.primariaTexto }]}>
        Frutas
      </Text>

      <Text style={[styles.texto, { color: cores.textoSecundario }]}>
        Esta é a tela da categoria de frutas.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    padding: 20,
  },

  voltar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  voltarTexto: {
    color: "#43855F",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#43855F",
    marginBottom: 10,
  },

  texto: {
    fontSize: 16,
    color: "#666",
  },
});