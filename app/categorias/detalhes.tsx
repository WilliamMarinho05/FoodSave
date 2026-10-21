import { buscarAlimentosEmEstoque } from "@/src/services/alimentos";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const categorias = {
  frutas: {
    nome: "Frutas",
    icone: "nutrition-outline" as const,
  },
  verduras: {
    nome: "Verduras e Legumes",
    icone: "leaf-outline" as const,
  },
  carnes: {
    nome: "Carnes",
    icone: "restaurant-outline" as const,
  },
  laticinios: {
    nome: "Laticínios",
    icone: "water-outline" as const,
  },
  graos: {
    nome: "Grãos e Cereais",
    icone: "basket-outline" as const,
  },
  bebidas: {
    nome: "Bebidas",
    icone: "cafe-outline" as const,
  },
  outros: {
    nome: "Outros",
    icone: "ellipsis-horizontal-outline" as const,
  },
};

export default function DetalhesCategoria() {
  const router = useRouter();
  const { categoria } = useLocalSearchParams();
  const [alimentos, setAlimentos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
  async function carregarAlimentos() {
    try {
      const dados = await buscarAlimentosEmEstoque();

      const nomesCategorias: Record<string, string> = {
        frutas: "fruuta",
        verduras: "verdura",
        carnes: "carne",
        laticinios: "laticinio",
        graos: "cereal",
        bebidas: "bebida",
        outros: "Outros",
        };

      const categoriaSelecionada =
        nomesCategorias[String(categoria)];
        
      const filtrados = dados.filter(
        (alimento) =>
            alimento.categoria?.toLowerCase() ===
            categoriaSelecionada?.toLowerCase()
);

      setAlimentos(filtrados);
    } catch (erro) {
      console.error("Erro ao carregar alimentos:", erro);
    } finally {
      setCarregando(false);
    }
  }

  carregarAlimentos();
}, [categoria]);

  const categoriaAtual =
    categorias[categoria as keyof typeof categorias];

  if (!categoriaAtual) {
    return (
      <View style={styles.erro}>
        <Text style={styles.erroTexto}>
          Categoria não encontrada.
        </Text>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.voltarLink}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

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

      <View style={styles.cabecalho}>
        <View style={styles.iconeContainer}>
          <Ionicons
            name={categoriaAtual.icone}
            size={30}
            color="#43855F"
          />
        </View>

        <Text style={styles.titulo}>
          {categoriaAtual.nome}
        </Text>
      </View>

      <Text style={styles.subtitulo}>
        Alimentos cadastrados nesta categoria.
      </Text>

      {carregando ? (
  <View style={styles.vazio}>
    <Text style={styles.vazioTitulo}>
      Carregando alimentos...
    </Text>
  </View>
) : alimentos.length === 0 ? (
  <View style={styles.vazio}>
    <Ionicons
      name="fast-food-outline"
      size={45}
      color="#B8C8BC"
    />

    <Text style={styles.vazioTitulo}>
      Nenhum alimento encontrado
    </Text>

    <Text style={styles.vazioTexto}>
      Os alimentos cadastrados nesta categoria aparecerão
      aqui.
    </Text>
  </View>
) : (
  <View style={styles.lista}>
    {alimentos.map((alimento) => (
      <View key={alimento.id} style={styles.alimentoCard}>
        <View style={styles.alimentoIcone}>
          <Ionicons
            name="fast-food-outline"
            size={24}
            color="#43855F"
          />
        </View>

        <View style={styles.alimentoInfo}>
          <Text style={styles.alimentoNome}>
            {alimento.nome}
          </Text>

          {alimento.quantidade && (
            <Text style={styles.alimentoDetalhe}>
              Quantidade: {alimento.quantidade}
            </Text>
          )}
        </View>
      </View>
    ))}
  </View>
)}
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

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  iconeContainer: {
    backgroundColor: "#EAF2EC",
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },

  titulo: {
    flex: 1,
    fontSize: 24,
    fontWeight: "900",
    color: "#43855F",
  },

  subtitulo: {
    fontSize: 15,
    color: "#666",
    marginBottom: 25,
  },

  vazio: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    elevation: 1,
  },

  vazioTitulo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#444",
    marginTop: 12,
    marginBottom: 6,
  },

  vazioTexto: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
  },

  erro: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  erroTexto: {
    fontSize: 18,
    color: "#555",
    marginBottom: 15,
  },

  voltarLink: {
    color: "#43855F",
    fontSize: 16,
    fontWeight: "700",
  },
  lista: {
  gap: 12,
},

alimentoCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FFF",
  padding: 16,
  borderRadius: 12,
  elevation: 1,
},

alimentoIcone: {
  backgroundColor: "#EAF2EC",
  padding: 10,
  borderRadius: 10,
  marginRight: 14,
},

alimentoInfo: {
  flex: 1,
},

alimentoNome: {
  fontSize: 16,
  fontWeight: "700",
  color: "#333",
},

alimentoDetalhe: {
  fontSize: 13,
  color: "#777",
  marginTop: 4,
},
});