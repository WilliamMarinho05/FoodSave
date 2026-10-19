import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const opcoes = [
  {
    titulo: "Dúvidas frequentes",
    descricao: "Encontre respostas para as dúvidas mais comuns.",
    icone: "help-circle-outline" as const,
  },
  {
    titulo: "Como usar o FoodSave",
    descricao: "Aprenda a utilizar os principais recursos do aplicativo.",
    icone: "book-outline" as const,
  },
  {
    titulo: "Problemas no aplicativo",
    descricao: "Confira orientações para resolver possíveis problemas.",
    icone: "bug-outline" as const,
  },
  {
    titulo: "Entrar em contato",
    descricao: "Precisa de ajuda? Entre em contato com nossa equipe.",
    icone: "mail-outline" as const,
  },
];

export default function Ajuda() {
  const router = useRouter();

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

      <Text style={styles.titulo}>Ajuda e Suporte</Text>

      <Text style={styles.subtitulo}>
        Encontre informações e ajuda para utilizar o FoodSave.
      </Text>

      <View style={styles.lista}>
        {opcoes.map((opcao) => (
          <Pressable key={opcao.titulo} style={styles.card} onPress={() => {
        if (opcao.titulo === "Dúvidas frequentes") {
        router.push("/ajuda/duvidas");
            }
        if (opcao.titulo === "Como usar o FoodSave") {
         router.push("/ajuda/como_usar");
        }
         if (opcao.titulo === "Problemas no aplicativo") {
        router.push("/ajuda/problemas");
        }

        if (opcao.titulo === "Entrar em contato") {
        router.push("/ajuda/contato");
        }
            }}
            >
            <View style={styles.iconeContainer}>
              <Ionicons
                name={opcao.icone}
                size={25}
                color="#43855F"
              />
            </View>

            <View style={styles.textos}>
              <Text style={styles.cardTitulo}>
                {opcao.titulo}
              </Text>

              <Text style={styles.cardDescricao}>
                {opcao.descricao}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#888"
            />
          </Pressable>
        ))}
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
    marginBottom: 25,
    lineHeight: 21,
  },

  lista: {
    gap: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },

  iconeContainer: {
    backgroundColor: "#EAF2EC",
    padding: 10,
    borderRadius: 10,
    marginRight: 14,
  },

  textos: {
    flex: 1,
  },

  cardTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },

  cardDescricao: {
    fontSize: 13,
    color: "#777",
    lineHeight: 18,
  },
});