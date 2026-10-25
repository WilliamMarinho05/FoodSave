import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import CardAlimento from "@/src/components/CardAlimento";
import FiltrosAlimentos from "@/src/components/FiltrosAlimentos";
import { useTheme } from "@/src/context/ThemeContext";
import { AlimentoComStatus, useListaAlimentos, } from "@/src/hooks/UseListaAlimentos";

const ROTULO_SITUACAO = {
  todos: "Todos",
  vencidos: "Vencidos",
  hoje: "Vencem hoje",
  proximos: "Próximos a vencer",
  longe: "Longe do prazo",
} as const;

export default function Alimentos() {
  const { modoEscuro } = useTheme();

  const cores = {
  fundo: modoEscuro ? "#121212" : "#F8F7F1",
  card: modoEscuro ? "#1E1E1E" : "#FFFFFF",
  texto: modoEscuro ? "#FFFFFF" : "#26332D",
  textoSecundario: modoEscuro ? "#C4C4C4" : "#8C9AA0",
  borda: modoEscuro ? "#2A2A2A" : "#D8D8D8",
  chip: modoEscuro ? "#263B30" : "#EAF2EC",
};
  const router = useRouter();
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const {
    filtrados,
    total,
    categorias,
    contagens,
    carregando,
    atualizando,
    erro,
    busca,
    setBusca,
    situacao,
    setSituacao,
    categoria,
    setCategoria,
    ordem,
    setOrdem,
    filtrosAtivos,
    limparFiltros,
    recarregar,
  } = useListaAlimentos();

  const abrirDetalhe = (item: AlimentoComStatus) => {
    router.push({
      pathname: "/alimento/[id]",
      params: {
        id: item.id,
        nome: item.nome,
        categoria: item.categoria,
        quantidade: item.quantidade,
        unidade: item.unidade,
        peso: item.peso,
        dataCompra: item.dataCompra,
        validade: item.validade,
      },
    });
  };

  const temFiltroOuBusca = filtrosAtivos > 0 || busca.trim().length > 0;

  if (carregando) {
    return (
      <View style={[styles.centralizado,{ backgroundColor: cores.fundo },]}>
        <ActivityIndicator size="large" color="#43855F" />
        <Text style={styles.mensagem}>Carregando alimentos...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container,{ backgroundColor: cores.fundo },]}>
      {/* BUSCA + BOTÃO DE FILTROS */}
      <View style={styles.linhaBusca}>
        <View style={[styles.campoBusca,{backgroundColor: cores.card,borderColor: cores.borda,},]}>
          <Ionicons name="search-outline" size={18} color="#8C9AA0" />
          <TextInput
            style={[styles.input,{ color: cores.texto },]}
            placeholder="Buscar alimento"
            placeholderTextColor="#8C9AA0"
            value={busca}
            onChangeText={setBusca}
            autoCorrect={false}
            returnKeyType="search"
          />
          {busca.length > 0 && (
            <Pressable onPress={() => setBusca("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#B5BFC3" />
            </Pressable>
          )}
        </View>

        <Pressable
          style={[styles.botaoFiltro,{backgroundColor:filtrosAtivos > 0 ? "#43855F" : cores.card,borderColor: "#43855F",},]}
          onPress={() => setFiltrosAbertos(true)}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={filtrosAtivos > 0 ? "#FFFFFF" : "#43855F"}
          />
          {filtrosAtivos > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{filtrosAtivos}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* FILTROS ATIVOS (toque para remover) */}
      {(situacao !== "todos" || categoria) && (
        <View style={styles.ativos}>
          {situacao !== "todos" && (
            <ChipAtivo
              rotulo={ROTULO_SITUACAO[situacao]}
              onRemover={() => setSituacao("todos")}
            />
          )}
          {categoria && (
            <ChipAtivo rotulo={categoria} onRemover={() => setCategoria(null)} />
          )}
        </View>
      )}

      <Text style={[styles.contador,{ color: cores.textoSecundario },]}>
        {filtrados.length} de {total}{" "}
        {total === 1 ? "alimento" : "alimentos"}
      </Text>

      {/* LISTA */}
      <FlatList
        data={filtrados}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CardAlimento alimento={item} onPress={() => abrirDetalhe(item)} />
        )}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshing={atualizando}
        onRefresh={() => recarregar(true)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={[styles.vazioTitulo,{ color: cores.texto },]}>
              {erro
                ? "Não foi possível carregar"
                : temFiltroOuBusca
                ? "Nenhum resultado"
                : "Nenhum alimento cadastrado"}
            </Text>
            <Text
        style={[styles.mensagem,{ color: cores.textoSecundario },]}>
              {erro
                ? "Puxe a lista para baixo para tentar novamente."
                : temFiltroOuBusca
                ? "Tente ajustar a busca ou os filtros."
                : "Cadastre seu primeiro alimento para começar."}
            </Text>
          </View>
        }
      />

      {/* CADASTRAR */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push("/cadastrar_alimento")}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>

      <FiltrosAlimentos
        visivel={filtrosAbertos}
        onFechar={() => setFiltrosAbertos(false)}
        onLimpar={limparFiltros}
        situacao={situacao}
        onSituacao={setSituacao}
        contagens={contagens}
        categorias={categorias}
        categoria={categoria}
        onCategoria={setCategoria}
        ordem={ordem}
        onOrdem={setOrdem}
      />
    </View>
  );
}

function ChipAtivo({
  rotulo,
  onRemover,
}: {
  rotulo: string;
  onRemover: () => void;
}) {
  return (
    <Pressable style={styles.chipAtivo} onPress={onRemover}>
      <Text style={styles.chipAtivoTexto}>{rotulo}</Text>
      <Ionicons name="close" size={13} color="#43855F" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7F1",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8F7F1",
  },

  linhaBusca: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  campoBusca: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: "#26332D",
    paddingVertical: 0,
  },
  botaoFiltro: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#43855F",
    justifyContent: "center",
    alignItems: "center",
  },
  botaoFiltroAtivo: {
    backgroundColor: "#43855F",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF9800",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeTexto: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },

  ativos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  chipAtivo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#EAF2EC",
  },
  chipAtivoTexto: {
    fontSize: 11,
    fontWeight: "600",
    color: "#43855F",
  },

  contador: {
    fontSize: 12,
    color: "#8C9AA0",
    marginTop: 12,
    marginBottom: 8,
  },
  lista: {
    paddingBottom: 100,
  },

  vazio: {
    alignItems: "center",
    padding: 20,
    marginTop: 20,
  },
  vazioTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#26332D",
    marginBottom: 4,
  },
  mensagem: {
    fontSize: 13,
    color: "#8C9AA0",
    textAlign: "center",
    marginTop: 8,
  },

  fab: {
    position: "absolute",
    right: 22,
    bottom: 25,
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#43855F",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
});
