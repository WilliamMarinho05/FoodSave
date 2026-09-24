import PainelValidade from "@/src/components/PainelValidade";

import {
  AlimentoBanco,
  buscarAlimentosEmEstoque,
} from "@/src/services/alimentos";

import { getResumoValidades } from "@/src/services/painelAlimentos";

import { useFocusEffect, useRouter } from "expo-router";

import React, { useCallback, useState } from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Home() {
  const router = useRouter();

  const [painel, setPainel] = useState({
    noPrazo: 0,
    atencao: 0,
    vencidos: 0,
  });

  const [alimentos, setAlimentos] = useState<AlimentoBanco[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarDados() {
        try {
          setCarregando(true);

          // Busca painel
          const resumo = await getResumoValidades();

          if (resumo && ativo) {
            setPainel(resumo);
          }

          // Busca alimentos reais do Supabase
          const alimentosBanco =
            await buscarAlimentosEmEstoque();

          if (ativo) {
            setAlimentos(alimentosBanco);
          }
        } catch (erro) {
          console.error(
            "Erro ao carregar Home:",
            erro
          );
        } finally {
          if (ativo) {
            setCarregando(false);
          }
        }
      }

      carregarDados();

      return () => {
        ativo = false;
      };
    }, [])
  );

  const handleCadastrarAlimento = () => {
    router.push("/cadastrar_alimento");
  };

  const handleMissoes = () => {
    router.push("/missoes");
  };

  const handleHistorico = () => {
    router.push("/historico");
  };

  const renderCardAlimento = ({
    item,
  }: {
    item: AlimentoBanco;
  }) => {
    return (
      <Pressable
        style={styles.cardAlimento}
        onPress={() => {
          router.push({
            pathname: "../../alimento/[id]",
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
        }}
      >
        <View style={styles.conteudoCardAlimento}>
          <Text style={styles.nomeAlimento}>
            {item.nome}
          </Text>

          <Text style={styles.infoAlimento}>
            Validade: {item.validade}
          </Text>

          <Text style={styles.infoAlimento}>
            Qtd: {item.quantidade} {item.unidade}
          </Text>
        </View>

        <View style={styles.setaContainer}>
          <Text style={styles.seta}>
            &gt;
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* PAINEL */}
      <PainelValidade painel={painel} />

      {/* CADASTRAR ALIMENTO */}
      <Pressable
        style={styles.cardCadastrar}
        onPress={handleCadastrarAlimento}
      >
        <View style={styles.iconeContainer}>
          <Text style={styles.icone}>+</Text>
        </View>

        <View style={styles.conteudoCard}>
          <Text style={styles.tituloCard}>
            Cadastrar novo alimento
          </Text>

          <Text style={styles.descricaoCard}>
            Adicione um novo alimento à sua lista
          </Text>
        </View>
      </Pressable>

      {/* MISSÕES */}
      <Pressable
        style={styles.cardMissoes}
        onPress={handleMissoes}
      >
        <View style={styles.iconeMissoes}>
          <Text style={styles.iconeMissao}>
            🎯
          </Text>
        </View>

        <View style={styles.conteudoCard}>
          <Text style={styles.tituloCard}>
            Missões Diárias
          </Text>

          <Text style={styles.descricaoCard}>
            Complete suas missões e ganhe pontos
          </Text>
        </View>

        <Text style={styles.setaMissao}>
          &gt;
        </Text>
      </Pressable>

      {/* ALIMENTOS */}
      <View style={styles.listaContainer}>
        <Text style={styles.tituloLista}>
          Adicionados Recentemente
        </Text>

        {carregando ? (
          <Text style={styles.mensagem}>
            Carregando alimentos...
          </Text>
        ) : (
          <FlatList
            data={alimentos}
            keyExtractor={(item) => item.id}
            renderItem={renderCardAlimento}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 100,
            }}
            ListEmptyComponent={
              <Text style={styles.mensagem}>
                Nenhum alimento cadastrado.
              </Text>
            }
          />
        )}
      </View>

      {/* HISTÓRICO */}
      <Pressable
        style={styles.botaoHistorico}
        onPress={handleHistorico}
      >
        <Text style={styles.iconeHistorico}>
          ↻
        </Text>

        <Text style={styles.textoHistorico}>
          Histórico
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    backgroundColor: "#F8F7F1",
  },

  cardCadastrar: {
    width: "90%",
    padding: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#D5D5D5",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  iconeContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  icone: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  conteudoCard: {
    flex: 1,
  },

  tituloCard: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
  },

  descricaoCard: {
    marginTop: 2,
    fontSize: 12,
    color: "#777777",
  },

  listaContainer: {
    width: "90%",
    flex: 1,
    marginTop: 15,
  },

  tituloLista: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#26332D",
    marginBottom: 10,
  },

  mensagem: {
    fontSize: 13,
    color: "#8C9AA0",
    textAlign: "center",
    marginTop: 20,
  },

  cardAlimento: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAF2EC",
  },

  conteudoCardAlimento: {
    flex: 1,
  },

  nomeAlimento: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#43855F",
    marginBottom: 2,
  },

  infoAlimento: {
    fontSize: 12,
    color: "#8C9AA0",
    marginTop: 1,
  },

  setaContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  seta: {
    fontSize: 16,
    color: "#43855F",
    fontWeight: "bold",
  },

  botaoHistorico: {
    position: "absolute",
    right: 22,
    bottom: 25,
    height: 55,
    paddingHorizontal: 18,
    backgroundColor: "#43855F",
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },

  iconeHistorico: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginRight: 7,
  },

  textoHistorico: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  cardMissoes: {
    width: "90%",
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#D5D5D5",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  iconeMissoes: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF2EC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  iconeMissao: {
    fontSize: 18,
  },

  setaMissao: {
    fontSize: 18,
    color: "#43855F",
    fontWeight: "bold",
  },
});