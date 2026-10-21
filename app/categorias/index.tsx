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

const categorias = [
  {
    nome: "Frutas",
    icone: "nutrition-outline" as const,
  },
  {
    nome: "Verduras e Legumes",
    icone: "leaf-outline" as const,
  },
  {
    nome: "Carnes",
    icone: "restaurant-outline" as const,
  },
  {
    nome: "Laticínios",
    icone: "water-outline" as const,
  },
  {
    nome: "Grãos e Cereais",
    icone: "basket-outline" as const,
  },
  {
    nome: "Bebidas",
    icone: "cafe-outline" as const,
  },
  {
    nome: "Outros",
    icone: "ellipsis-horizontal-outline" as const,
  },
];

export default function Categorias() {
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
        <Ionicons
          name="arrow-back"
          size={24}
          color="#43855F"
        />
        <Text style={styles.voltarTexto}>Voltar</Text>
      </Pressable>

      <Text style={styles.titulo}>
        Categorias de Alimentos
      </Text>

      <Text style={styles.subtitulo}>
        Organize seus alimentos por categoria.
      </Text>

      <View style={styles.lista}>
        {categorias.map((categoria) => (
          <Pressable
           key={categoria.nome}
            style={styles.card}
            onPress={() => {
            const rotas: Record<string, string> = {
            Frutas: "frutas",
            "Verduras e Legumes": "verduras",
            Carnes: "carnes",
            Laticínios: "laticinios",
            "Grãos e Cereais": "graos",
            Bebidas: "bebidas",
            Outros: "outros",
          };

            router.push({
              pathname: "/categorias/detalhes",
              params: {
                categoria: rotas[categoria.nome],
              },
            });
          }}
          >
            <View style={styles.iconeContainer}>
              <Ionicons
                name={categoria.icone}
                size={25}
                color="#43855F"
              />
            </View>

            <Text style={styles.nomeCategoria}>
              {categoria.nome}
            </Text>

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

  nomeCategoria: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});