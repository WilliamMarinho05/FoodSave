import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const duvidas = [
  {
    pergunta: "Como cadastrar um alimento?",
    resposta:
      "Acesse a tela de cadastro de alimentos e preencha as informações solicitadas, como nome, quantidade e validade. Depois, confirme o cadastro.",
  },
  {
    pergunta: "Como acompanhar a validade dos alimentos?",
    resposta:
      "Na tela inicial, você pode acompanhar o painel de validade e verificar quais alimentos estão próximos do vencimento ou já estão vencidos.",
  },
  {
    pergunta: "Como funcionam as missões?",
    resposta:
      "As missões propõem objetivos para você realizar dentro do FoodSave. Ao cumprir uma missão, seu progresso é atualizado e você pode receber pontos.",
  },
  {
    pergunta: "Como funcionam os troféus?",
    resposta:
      "Os troféus são conquistas obtidas ao atingir determinados objetivos dentro do aplicativo, como cadastrar ou consumir uma quantidade específica de alimentos.",
  },
];

export default function Duvidas() {
  const router = useRouter();
  const [aberta, setAberta] = useState<number | null>(null);

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

      <Text style={styles.titulo}>Dúvidas Frequentes</Text>

      <Text style={styles.subtitulo}>
        Confira as respostas para algumas das dúvidas mais comuns sobre o
        FoodSave.
      </Text>

      <View style={styles.lista}>
        {duvidas.map((duvida, index) => {
          const estaAberta = aberta === index;

          return (
            <View key={duvida.pergunta} style={styles.card}>
              <Pressable
                style={styles.pergunta}
                onPress={() =>
                  setAberta(estaAberta ? null : index)
                }
              >
                <Text style={styles.perguntaTexto}>
                  {duvida.pergunta}
                </Text>

                <Ionicons
                  name={
                    estaAberta
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color="#43855F"
                />
              </Pressable>

              {estaAberta && (
                <Text style={styles.resposta}>
                  {duvida.resposta}
                </Text>
              )}
            </View>
          );
        })}
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
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },

  pergunta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  perguntaTexto: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginRight: 10,
  },

  resposta: {
    fontSize: 14,
    color: "#666",
    lineHeight: 21,
    marginTop: 14,
  },
});