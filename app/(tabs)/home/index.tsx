import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/src/lib/supabase";

import BarraExp from "@/src/components/BarraExp";
import PainelValidade from "@/src/components/PainelValidade";
import { useTheme } from "@/src/context/ThemeContext";

import {
  AlimentoBanco,
  buscarAlimentosEmEstoque,
} from "@/src/services/alimentos";

import { getResumoValidades } from "@/src/services/painelAlimentos";

import { useFocusEffect, useRouter } from "expo-router";

import React, { useCallback, useEffect, useState } from "react";

import {
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Onboarding: mostra apenas na primeira abertura do app
const CHAVE_ONBOARDING = "@foodsave_onboarding_visto";

const PASSOS_ONBOARDING = [
  {
    icone: "add-circle-outline" as const,
    titulo: "Cadastre seus alimentos",
    descricao:
      "Toque em “Cadastrar novo alimento” e informe nome, quantidade e datas.",
  },
  {
    icone: "notifications-outline" as const,
    titulo: "Fique de olho nos alertas",
    descricao:
      "A aba Alertas mostra o que venceu ou está perto do vencimento.",
  },
  {
    icone: "help-circle-outline" as const,
    titulo: "Ajuda sempre disponível",
    descricao:
      "Use o card Ajuda e Suporte ou o Assistente para dúv idas e dicas.",
  },
];


export default function Home() {
  const router = useRouter();
  const { cores } = useTheme();

  const [nomeUsuario, setNomeUsuario] = useState<string>("");
  const [painel, setPainel] = useState({
    noPrazo: 0,
    atencao: 0,
    vencidos: 0,
  });

  const [alimentos, setAlimentos] = useState<AlimentoBanco[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizandoLista, setAtualizandoLista] = useState(false);
  const [onboardingVisivel, setOnboardingVisivel] = useState(false);

  // Heurística 10: onboarding na primeira abertura do app
  useEffect(() => {
    async function verificarPrimeiroUso() {
      try {
        const visto = await AsyncStorage.getItem(CHAVE_ONBOARDING);

        if (visto === null) {
          setOnboardingVisivel(true);
        }
      } catch (erro) {
        console.error("Erro ao verificar onboarding:", erro);
      }
    }

    verificarPrimeiroUso();
  }, []);

  const fecharOnboarding = async () => {
    setOnboardingVisivel(false);

    try {
      await AsyncStorage.setItem(CHAVE_ONBOARDING, "true");
    } catch (erro) {
      console.error("Erro ao salvar onboarding:", erro);
    }
  };

  const verPassoAPasso = async () => {
    await fecharOnboarding();
    router.push("/ajuda/como_usar");
  };

  // Carrega painel, alimentos e nome do usuário. Quando vem de um
  // pull-to-refresh, mantém o conteúdo na tela e usa o spinner da lista.
  const carregarDados = useCallback(async (puxadoParaAtualizar = false) => {
    if (puxadoParaAtualizar) {
      setAtualizandoLista(true);
    } else {
      setCarregando(true);
    }

    try {
      // Busca painel
      const resumo = await getResumoValidades();

      if (resumo) {
        setPainel(resumo);
      }

      // Busca alimentos reais do Supabase
      const alimentosBanco = await buscarAlimentosEmEstoque();
      setAlimentos(alimentosBanco);

      // Busca o nome do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase
          .from("perfis")
          .select("nome")
          .eq("id", user.id)
          .single();

        if (perfil?.nome) {
          setNomeUsuario(perfil.nome);
        }
      }
    } catch (erro) {
      console.error(
        "Erro ao carregar Home:",
        erro
      );
    } finally {
      setAtualizandoLista(false);
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
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

  const handleAjuda = () => {
    router.push("/ajuda");
  };

  const renderCardAlimento = ({
    item,
  }: {
    item: AlimentoBanco;
  }) => {
    return (
      <Pressable
  style={[styles.cardAlimento,{backgroundColor: cores.card,borderColor: cores.borda,},]}
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
          <Text style={[styles.nomeAlimento, { color: cores.primariaTexto }]}>
            {item.nome}
          </Text>

          <Text style={[styles.infoAlimento, { color: cores.textoSecundario }]}>
            Validade: {item.validade}
          </Text>

          <Text style={[styles.infoAlimento, { color: cores.textoSecundario }]}>
            Qtd: {item.quantidade} {item.unidade}
          </Text>
        </View>

        <View style={styles.setaContainer}>
          <Text style={[styles.seta, { color: cores.primariaTexto }]}>
            &gt;
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
  <View style={[styles.container,{ backgroundColor: cores.fundo },]}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.conteudoScroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={atualizandoLista}
          onRefresh={() => carregarDados(true)}
          tintColor={cores.primaria}
          colors={[cores.primaria]}
        />
      }
    >
      {/* PAINEL */}
      <PainelValidade painel={painel} nomeUsuario={nomeUsuario} />

      {/* BARRA DE EXPERIÊNCIA */}
      <View style={styles.containerBarraExp}>
        <BarraExp />
      </View>

      {/* CADASTRAR ALIMENTO */}
      <Pressable
        style={[styles.cardCadastrar,{backgroundColor: cores.card,borderColor: cores.borda,},]}
        onPress={handleCadastrarAlimento}
      >
        <View style={[styles.iconeContainer, { backgroundColor: cores.primaria }]}>
          <Text style={styles.icone}>+</Text>
        </View>

        <View style={styles.conteudoCard}>
          <Text style={[styles.tituloCard,{ color: cores.texto },]}>
            Cadastrar novo alimento
          </Text>

          <Text style={[styles.descricaoCard, { color: cores.textoSecundario }]}>
            Adicione um novo alimento à sua lista
          </Text>
        </View>
      </Pressable>

      {/* MISSÕES */}
      <Pressable
        style={[styles.cardMissoes,{backgroundColor: cores.card,borderColor: cores.borda,},]}
        onPress={handleMissoes}
      >
        <View style={[styles.iconeMissoes, { backgroundColor: cores.primariaSuave }]}>
          <Text style={styles.iconeMissao}>
            🎯
          </Text>
        </View>

        <View style={styles.conteudoCard}>
          <Text style={[styles.tituloCard,{ color: cores.texto },]}>
            Missões Diárias
          </Text>

          <Text style={[styles.descricaoCard,{ color: cores.textoSecundario },]}>
            Complete suas missões e ganhe pontos
          </Text>
        </View>

        <Text style={[styles.setaMissao, { color: cores.primariaTexto }]}>
          &gt;
        </Text>
      </Pressable>

      {/* AJUDA E SUPORTE */}
      <Pressable
        style={[styles.cardMissoes,{backgroundColor: cores.card,borderColor: cores.borda,},]}
        onPress={handleAjuda}
      >
        <View style={[styles.iconeMissoes, { backgroundColor: cores.primariaSuave }]}>
          <Ionicons name="help-circle-outline" size={18} color={cores.primariaTexto} />
        </View>

        <View style={styles.conteudoCard}>
          <Text style={[styles.tituloCard,{ color: cores.texto },]}>
            Ajuda e Suporte
          </Text>

          <Text style={[styles.descricaoCard,{ color: cores.textoSecundario },]}>
            FAQ, passo a passo e contato com a equipe
          </Text>
        </View>

        <Text style={[styles.setaMissao, { color: cores.primariaTexto }]}>
          &gt;
        </Text>
      </Pressable>

      {/* ALIMENTOS */}
      <View style={styles.listaContainer}>
        <View style={styles.tituloListaLinha}>
          <Text style={[styles.tituloLista,{ color: cores.texto },]}>
            Adicionados Recentemente
          </Text>

          {/* No web o pull-to-refresh não é suportado; botão manual */}
          {Platform.OS === "web" && (
            <Pressable
              onPress={() => carregarDados(true)}
              disabled={atualizandoLista}
              hitSlop={8}
              accessibilityLabel="Atualizar lista de alimentos"
            >
              <Ionicons
                name="refresh"
                size={20}
                color={atualizandoLista ? cores.textoFraco : cores.primariaTexto}
              />
            </Pressable>
          )}
        </View>

        {carregando ? (
          <Text style={[styles.mensagem, { color: cores.textoSecundario }]}>
            Carregando alimentos...
          </Text>
        ) : alimentos.length === 0 ? (
          <Text style={[styles.mensagem, { color: cores.textoSecundario }]}>
            Nenhum alimento cadastrado.
          </Text>
        ) : (
          alimentos.map((item) => (
            <React.Fragment key={item.id}>
              {renderCardAlimento({ item })}
            </React.Fragment>
          ))
        )}
      </View>
    </ScrollView>

      {/* HISTÓRICO */}
      <Pressable
        style={[styles.botaoHistorico, { backgroundColor: cores.primaria, shadowColor: cores.sombra }]}
        onPress={handleHistorico}
      >
        <Text style={styles.iconeHistorico}>
          ↻
        </Text>

        <Text style={styles.textoHistorico}>
          Histórico
        </Text>
      </Pressable>
      {/* ONBOARDING PRIMEIRO USO */}
      <Modal
        visible={onboardingVisivel}
        transparent
        animationType="fade"
        onRequestClose={fecharOnboarding}
      >
        <View style={[styles.onboardingOverlay, { backgroundColor: cores.overlay }]}>
          <View
            style={[
              styles.onboardingCard,
              { backgroundColor: cores.card, borderColor: cores.borda },
            ]}
          >
            <Text style={[styles.onboardingTitulo, { color: cores.texto }]}>
              Bem-vindo ao FoodSave!
            </Text>

            <Text
              style={[
                styles.onboardingSubtitulo,
                { color: cores.textoSecundario },
              ]}
            >
              Em 1 minuto você já sabe usar o app:
            </Text>

            {PASSOS_ONBOARDING.map((passo) => (
              <View key={passo.titulo} style={styles.onboardingPasso}>
                <View
                  style={[
                    styles.onboardingIcone,
                    { backgroundColor: cores.primariaSuave },
                  ]}
                >
                  <Ionicons
                    name={passo.icone}
                    size={20}
                    color={cores.primariaTexto}
                  />
                </View>

                <View style={styles.onboardingTextos}>
                  <Text style={[styles.onboardingPassoTitulo, { color: cores.texto }]}>
                    {passo.titulo}
                  </Text>

                  <Text
                    style={[
                      styles.onboardingPassoDescricao,
                      { color: cores.textoSecundario },
                    ]}
                  >
                    {passo.descricao}
                  </Text>
                </View>
              </View>
            ))}

            <Pressable
              style={[styles.onboardingBotao, { backgroundColor: cores.primaria }]}
              onPress={fecharOnboarding}
            >
              <Text style={styles.onboardingBotaoTexto}>Começar</Text>
            </Pressable>

            <Pressable onPress={verPassoAPasso} hitSlop={8}>
              <Text
                style={[
                  styles.onboardingLink,
                  { color: cores.primariaTexto },
                ]}
              >
                Ver passo a passo completo
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  conteudoScroll: {
    alignItems: "center",
    paddingTop: 10,
    // Espaço para o botão flutuante "Histórico" não cobrir o último item
    paddingBottom: 110,
  },

  onboardingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  onboardingCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },

  onboardingTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },

  onboardingSubtitulo: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },

  onboardingPasso: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  onboardingIcone: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  onboardingTextos: {
    flex: 1,
  },

  onboardingPassoTitulo: {
    fontSize: 14,
    fontWeight: "bold",
  },

  onboardingPassoDescricao: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  onboardingBotao: {
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  onboardingBotaoTexto: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  onboardingLink: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
    textDecorationLine: "underline",
  },
  
  containerBarraExp: {
    width: "90%",
    marginTop: 15,
  },

  cardCadastrar: {
  width: "90%",
  padding: 12,
  marginTop: 15,
  borderWidth: 1,
  borderRadius: 10,
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
    marginTop: 15,
  },

  tituloListaLinha: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  padding: 12,
  borderRadius: 10,
  marginBottom: 8,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  borderWidth: 1,
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
  borderRadius: 10,
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