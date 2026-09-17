import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type StatusHistorico = "Consumido" | "Descartado" | "Vencido";

type ItemHistorico = {
  id: string;
  nome: string;
  categoria: string;
  quantidade: string;
  unidade: string;
  data: string;
  status: StatusHistorico;
};

export default function Historico() {

  const router = useRouter();

  const [busca, setBusca] = useState("");

  const [filtro, setFiltro] = useState<
    "Todos" | StatusHistorico
  >("Todos");

  // ------------------------------------------------
  // DADOS TEMPORÁRIOS DO HISTÓRICO
  // Depois podemos substituir pelos dados reais
  // ------------------------------------------------

  const [historico] = useState<ItemHistorico[]>([
    {
      id: "1",
      nome: "Leite Integral",
      categoria: "Laticínio",
      quantidade: "1",
      unidade: "Litro",
      data: "10/09/2026",
      status: "Consumido",
    },
    {
      id: "2",
      nome: "Arroz Branco",
      categoria: "Grãos",
      quantidade: "1",
      unidade: "Pacote",
      data: "08/09/2026",
      status: "Consumido",
    },
    {
      id: "3",
      nome: "Iogurte Natural",
      categoria: "Laticínio",
      quantidade: "2",
      unidade: "Unidades",
      data: "05/09/2026",
      status: "Vencido",
    },
    {
      id: "4",
      nome: "Tomate",
      categoria: "Hortifruti",
      quantidade: "3",
      unidade: "Unidades",
      data: "02/09/2026",
      status: "Descartado",
    },
    {
      id: "5",
      nome: "Macarrão",
      categoria: "Massa",
      quantidade: "1",
      unidade: "Pacote",
      data: "30/08/2026",
      status: "Consumido",
    },
  ]);

  // ------------------------------------------------
  // FILTRO
  // ------------------------------------------------

  const historicoFiltrado = historico.filter((item) => {

    const correspondeBusca = item.nome
      .toLowerCase()
      .includes(busca.toLowerCase());

    const correspondeFiltro =
      filtro === "Todos" || item.status === filtro;

    return correspondeBusca && correspondeFiltro;

  });

  // ------------------------------------------------
  // DEFINE COR DE ACORDO COM STATUS
  // ------------------------------------------------

  const getStatusStyle = (status: StatusHistorico) => {

    if (status === "Consumido") {
      return styles.statusConsumido;
    }

    if (status === "Descartado") {
      return styles.statusDescartado;
    }

    return styles.statusVencido;

  };

  const getStatusTextStyle = (status: StatusHistorico) => {

    if (status === "Consumido") {
      return styles.textoConsumido;
    }

    if (status === "Descartado") {
      return styles.textoDescartado;
    }

    return styles.textoVencido;

  };

  // ------------------------------------------------
  // CARD DO HISTÓRICO
  // ------------------------------------------------

  const renderItem = ({ item }: { item: ItemHistorico }) => {

    return (

      <View style={styles.card}>

        <View style={styles.cardTopo}>

          <View style={styles.conteudoCard}>

            <Text style={styles.nomeAlimento}>
              {item.nome}
            </Text>

            <Text style={styles.categoria}>
              {item.categoria}
            </Text>

          </View>

          <View
            style={[
              styles.status,
              getStatusStyle(item.status),
            ]}
          >
            <Text
              style={[
                styles.textoStatus,
                getStatusTextStyle(item.status),
              ]}
            >
              {item.status}
            </Text>
          </View>

        </View>

        <View style={styles.divisor} />

        <View style={styles.cardRodape}>

          <View>
            <Text style={styles.label}>
              Quantidade
            </Text>

            <Text style={styles.valor}>
              {item.quantidade} {item.unidade}
            </Text>
          </View>

          <View style={styles.dataContainer}>

            <Text style={styles.label}>
              Data
            </Text>

            <Text style={styles.valor}>
              {item.data}
            </Text>

          </View>

        </View>

      </View>

    );

  };

  return (

    <View style={styles.container}>

      {/* CABEÇALHO */}

      <View style={styles.header}>

        <Pressable
          style={styles.botaoVoltar}
          onPress={() => router.back()}
        >
          <Text style={styles.setaVoltar}>
            ‹
          </Text>
        </Pressable>

        <View style={styles.headerTexto}>

          <Text style={styles.titulo}>
            Histórico
          </Text>

          <Text style={styles.subtitulo}>
            Acompanhe seus alimentos anteriores
          </Text>

        </View>

      </View>


      {/* BUSCA */}

      <View style={styles.buscaContainer}>

        <Text style={styles.iconeBusca}>
          ⌕
        </Text>

        <TextInput
          style={styles.inputBusca}
          placeholder="Buscar alimento..."
          placeholderTextColor="#9AA5A0"
          value={busca}
          onChangeText={setBusca}
        />

      </View>


      {/* FILTROS */}

      <View style={styles.filtros}>

        <Pressable
          style={[
            styles.botaoFiltro,
            filtro === "Todos" &&
              styles.botaoFiltroSelecionado,
          ]}
          onPress={() => setFiltro("Todos")}
        >
          <Text
            style={[
              styles.textoFiltro,
              filtro === "Todos" &&
                styles.textoFiltroSelecionado,
            ]}
          >
            Todos
          </Text>
        </Pressable>


        <Pressable
          style={[
            styles.botaoFiltro,
            filtro === "Consumido" &&
              styles.botaoFiltroSelecionado,
          ]}
          onPress={() => setFiltro("Consumido")}
        >
          <Text
            style={[
              styles.textoFiltro,
              filtro === "Consumido" &&
                styles.textoFiltroSelecionado,
            ]}
          >
            Consumidos
          </Text>
        </Pressable>


        <Pressable
          style={[
            styles.botaoFiltro,
            filtro === "Descartado" &&
              styles.botaoFiltroSelecionado,
          ]}
          onPress={() => setFiltro("Descartado")}
        >
          <Text
            style={[
              styles.textoFiltro,
              filtro === "Descartado" &&
                styles.textoFiltroSelecionado,
            ]}
          >
            Descartados
          </Text>
        </Pressable>


        <Pressable
          style={[
            styles.botaoFiltro,
            filtro === "Vencido" &&
              styles.botaoFiltroSelecionado,
          ]}
          onPress={() => setFiltro("Vencido")}
        >
          <Text
            style={[
              styles.textoFiltro,
              filtro === "Vencido" &&
                styles.textoFiltroSelecionado,
            ]}
          >
            Vencidos
          </Text>
        </Pressable>

      </View>


      {/* TÍTULO DA LISTA */}

      <View style={styles.tituloListaContainer}>

        <Text style={styles.tituloLista}>
          Histórico de alimentos
        </Text>

        <Text style={styles.quantidadeResultados}>
          {historicoFiltrado.length} itens
        </Text>

      </View>


      {/* LISTA */}

      <FlatList
        style={styles.lista}
        data={historicoFiltrado}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudoLista}
        ListEmptyComponent={

          <View style={styles.listaVazia}>

            <Text style={styles.iconeVazio}>
              ⌕
            </Text>

            <Text style={styles.textoVazio}>
              Nenhum alimento encontrado
            </Text>

            <Text style={styles.subtextoVazio}>
              Tente buscar outro alimento ou alterar o filtro.
            </Text>

          </View>

        }
      />

    </View>

  );

}


// ==================================================
// ESTILOS
// ==================================================

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: "#F8F7F1",

    paddingHorizontal: 20,

    paddingTop: 25,

  },


  // ------------------------------------------------
  // CABEÇALHO
  // ------------------------------------------------

  header: {

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 25,

  },


  botaoVoltar: {

    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 13,

    borderWidth: 1,

    borderColor: "#E6EBE7",

  },


  setaVoltar: {

    fontSize: 32,

    color: "#43855F",

    lineHeight: 34,

  },


  headerTexto: {

    flex: 1,

  },


  titulo: {

    fontSize: 24,

    fontWeight: "bold",

    color: "#26332D",

  },


  subtitulo: {

    fontSize: 12,

    color: "#8C9AA0",

    marginTop: 3,

  },


  // ------------------------------------------------
  // BUSCA
  // ------------------------------------------------

  buscaContainer: {

    width: "100%",

    height: 50,

    backgroundColor: "#FFFFFF",

    borderRadius: 12,

    borderWidth: 1,

    borderColor: "#E3E9E5",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 14,

  },


  iconeBusca: {

    fontSize: 21,

    color: "#43855F",

    marginRight: 9,

  },


  inputBusca: {

    flex: 1,

    height: "100%",

    fontSize: 14,

    color: "#333333",

  },


  // ------------------------------------------------
  // FILTROS
  // ------------------------------------------------

  filtros: {

    flexDirection: "row",

    marginTop: 15,

    marginBottom: 23,

    gap: 7,

  },


  botaoFiltro: {

    flex: 1,

    height: 36,

    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E2E8E4",

    justifyContent: "center",

    alignItems: "center",

  },


  botaoFiltroSelecionado: {

    backgroundColor: "#43855F",

    borderColor: "#43855F",

  },


  textoFiltro: {

    fontSize: 11,

    color: "#738078",

    fontWeight: "600",

  },


  textoFiltroSelecionado: {

    color: "#FFFFFF",

  },


  // ------------------------------------------------
  // TÍTULO LISTA
  // ------------------------------------------------

  tituloListaContainer: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 12,

  },


  tituloLista: {

    fontSize: 16,

    fontWeight: "bold",

    color: "#26332D",

  },


  quantidadeResultados: {

    fontSize: 12,

    color: "#8C9AA0",

  },


  // ------------------------------------------------
  // LISTA
  // ------------------------------------------------

  lista: {

    flex: 1,

  },


  conteudoLista: {

    paddingBottom: 30,

  },


  // ------------------------------------------------
  // CARD
  // ------------------------------------------------

  card: {

    width: "100%",

    backgroundColor: "#FFFFFF",

    borderRadius: 12,

    padding: 14,

    marginBottom: 10,

    borderWidth: 1,

    borderColor: "#EAF2EC",

  },


  cardTopo: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",

  },


  conteudoCard: {

    flex: 1,

  },


  nomeAlimento: {

    fontSize: 15,

    fontWeight: "bold",

    color: "#43855F",

  },


  categoria: {

    fontSize: 12,

    color: "#8C9AA0",

    marginTop: 3,

  },


  // ------------------------------------------------
  // STATUS
  // ------------------------------------------------

  status: {

    paddingHorizontal: 10,

    paddingVertical: 5,

    borderRadius: 15,

  },


  statusConsumido: {

    backgroundColor: "#E8F5E9",

  },


  statusDescartado: {

    backgroundColor: "#FFF3E0",

  },


  statusVencido: {

    backgroundColor: "#FDECEC",

  },


  textoStatus: {

    fontSize: 10,

    fontWeight: "bold",

  },


  textoConsumido: {

    color: "#388E3C",

  },


  textoDescartado: {

    color: "#E58A21",

  },


  textoVencido: {

    color: "#D9534F",

  },


  // ------------------------------------------------
  // DIVISOR
  // ------------------------------------------------

  divisor: {

    height: 1,

    backgroundColor: "#EEF1EF",

    marginVertical: 12,

  },


  // ------------------------------------------------
  // RODAPÉ DO CARD
  // ------------------------------------------------

  cardRodape: {

    flexDirection: "row",

    justifyContent: "space-between",

  },


  dataContainer: {

    alignItems: "flex-end",

  },


  label: {

    fontSize: 10,

    color: "#9AA5A0",

    marginBottom: 2,

  },


  valor: {

    fontSize: 12,

    color: "#4C5953",

    fontWeight: "600",

  },


  // ------------------------------------------------
  // LISTA VAZIA
  // ------------------------------------------------

  listaVazia: {

    alignItems: "center",

    justifyContent: "center",

    paddingTop: 70,

  },


  iconeVazio: {

    fontSize: 40,

    color: "#AAB5AF",

    marginBottom: 10,

  },


  textoVazio: {

    fontSize: 15,

    fontWeight: "bold",

    color: "#56635D",

  },


  subtextoVazio: {

    fontSize: 12,

    color: "#9AA5A0",

    textAlign: "center",

    marginTop: 5,

    maxWidth: 250,

  },

});