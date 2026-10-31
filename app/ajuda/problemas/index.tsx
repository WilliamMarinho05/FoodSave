import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, } from "react-native";

const problemas = [
  {
    titulo: "O aplicativo não carrega",
    descricao:
      "Verifique sua conexão com a internet e tente abrir o aplicativo novamente.",
    icone: "refresh-outline" as const,
  },
  {
    titulo: "Não consigo fazer login",
    descricao:
      "Confira seu e-mail e senha. Caso tenha esquecido sua senha, utilize a opção de recuperação de senha.",
    icone: "lock-closed-outline" as const,
  },
  {
    titulo: "Meus alimentos não aparecem",
    descricao:
      "Verifique se você está conectado à sua conta correta e tente atualizar a tela.",
    icone: "restaurant-outline" as const,
  },
  {
    titulo: "Encontrei um erro",
    descricao:
      "Se o problema continuar, entre em contato com a equipe de suporte informando o que aconteceu.",
    icone: "warning-outline" as const,
  },
];

export default function Problemas() {
  const router = useRouter();
  const { cores } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cores.fundo }]}
      contentContainerStyle={styles.content}
    >
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
        Problemas no aplicativo
      </Text>

      <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
        Confira algumas orientações para resolver problemas comuns.
      </Text>

      <View style={styles.lista}>
        {problemas.map((problema) => (
          <View key={problema.titulo} style={[styles.card, { backgroundColor: cores.card }]}>
            <View style={[styles.iconeContainer, { backgroundColor: cores.primariaSuave }]}>
              <Ionicons
                name={problema.icone}
                size={25}
                color={cores.primariaTexto}
              />
            </View>

            <View style={styles.textos}>
              <Text style={[styles.cardTitulo, { color: cores.texto }]}>
                {problema.titulo}
              </Text>

              <Text style={[styles.cardDescricao, { color: cores.textoSecundario }]}>
                {problema.descricao}
              </Text>
            </View>
          </View>
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
    lineHeight: 21,
    marginBottom: 25,
  },

  lista: {
    gap: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
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
    marginBottom: 5,
  },

  cardDescricao: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});