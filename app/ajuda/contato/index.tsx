import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function Contato() {
  const router = useRouter();

  const abrirEmail = () => {
    Linking.openURL("mailto:suporte@foodsave.com");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable
        style={styles.voltar}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#43855F" />
        <Text style={styles.voltarTexto}>Voltar</Text>
      </Pressable>

      <Text style={styles.titulo}>Entrar em contato</Text>

      <Text style={styles.subtitulo}>
        Precisa de ajuda? Nossa equipe está disponível para receber
        dúvidas, sugestões e relatos de problemas.
      </Text>

      <View style={styles.card}>
        <View style={styles.iconeContainer}>
          <Ionicons
            name="mail-outline"
            size={30}
            color="#43855F"
          />
        </View>

        <Text style={styles.cardTitulo}>E-mail</Text>

        <Text style={styles.email}>
          suporte@foodsave.com
        </Text>

        <Text style={styles.descricao}>
          Clique no botão abaixo para abrir seu aplicativo de
          e-mail e entrar em contato conosco.
        </Text>

        <Pressable
          style={styles.botao}
          onPress={abrirEmail}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color="#FFF"
          />

          <Text style={styles.botaoTexto}>
            Enviar e-mail
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  voltar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  voltarTexto: {
    fontSize: 16,
    color: "#43855F",
    fontWeight: "600",
    marginLeft: 6,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "900",
    color: "#43855F",
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 15,
    color: "#666",
    lineHeight: 21,
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 22,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },

  iconeContainer: {
    backgroundColor: "#EAF2EC",
    padding: 15,
    borderRadius: 50,
    marginBottom: 15,
  },

  cardTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },

  email: {
    fontSize: 16,
    color: "#43855F",
    fontWeight: "600",
    marginBottom: 15,
  },

  descricao: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },

  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#43855F",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },

  botaoTexto: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
});