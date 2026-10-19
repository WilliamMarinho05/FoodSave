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

const etapas = [
  {
    titulo: "Cadastre seus alimentos",
    descricao:
      "Adicione os alimentos que você possui, informando os dados necessários para acompanhar sua validade.",
    icone: "add-circle-outline" as const,
  },
  {
    titulo: "Acompanhe as validades",
    descricao:
      "Consulte seus alimentos e fique atento aos itens que estão próximos do vencimento.",
    icone: "calendar-outline" as const,
  },
  {
    titulo: "Evite desperdícios",
    descricao:
      "Priorize o consumo dos alimentos que estão próximos do vencimento para reduzir o desperdício.",
    icone: "leaf-outline" as const,
  },
  {
    titulo: "Complete missões",
    descricao:
      "Realize as missões disponíveis para acompanhar seu progresso e ganhar pontos.",
    icone: "flag-outline" as const,
  },
  {
    titulo: "Conquiste troféus",
    descricao:
      "Alcance objetivos dentro do FoodSave para desbloquear troféus e acompanhar suas conquistas.",
    icone: "trophy-outline" as const,
  },
];

export default function ComoUsar() {
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

      <Text style={styles.titulo}>Como usar o FoodSave</Text>

      <Text style={styles.subtitulo}>
        Confira algumas das principais funcionalidades do aplicativo.
      </Text>

      <View style={styles.lista}>
        {etapas.map((etapa, index) => (
          <View key={etapa.titulo} style={styles.card}>
            <View style={styles.numero}>
              <Text style={styles.numeroTexto}>{index + 1}</Text>
            </View>

            <View style={styles.iconeContainer}>
              <Ionicons
                name={etapa.icone}
                size={24}
                color="#43855F"
              />
            </View>

            <View style={styles.textos}>
              <Text style={styles.cardTitulo}>
                {etapa.titulo}
              </Text>

              <Text style={styles.cardDescricao}>
                {etapa.descricao}
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

  numero: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#43855F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  numeroTexto: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },

  iconeContainer: {
    backgroundColor: "#EAF2EC",
    padding: 9,
    borderRadius: 10,
    marginRight: 12,
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