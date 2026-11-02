import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@/src/context/ThemeContext";
import { Mensagem } from "@/src/types/conversa";
import {
  carregarConversa,
  enviarMensagemParaIA,
  limparConversa,
  salvarConversa,
} from "@/src/services/ia";

import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const SUGESTOES = [
  "Como organizar meus alimentos na geladeira?",
  "O que posso fazer com alimentos perto do vencimento?",
  "Dê uma receita rápida com ovos e tomate",
];

const RESPOSTA_ERRO =
  "Ops! Não consegui responder agora. Verifique sua conexão e tente novamente.";

type ItemConversa =
  | { tipo: "digitando"; id: string }
  | { tipo: "mensagem"; id: string; mensagem: Mensagem; dia: string | null };

function gerarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatarHora(criadoEm: string) {
  const data = new Date(criadoEm);
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");

  return `${hora}:${minuto}`;
}

function comecarDoDia(criadoEm: string) {
  const data = new Date(criadoEm);
  return new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime();
}

function rotuloDia(criadoEm: string) {
  const inicioHoje = comecarDoDia(new Date().toISOString());
  const dias = Math.round((comecarDoDia(criadoEm) - inicioHoje) / 86400000);

  if (dias === 0) {
    return "Hoje";
  }

  if (dias === -1) {
    return "Ontem";
  }

  return new Date(criadoEm).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
}

function AvatarAssistente({ tamanho }: { tamanho: number }) {
  const { cores } = useTheme();

  return (
    <View
      style={[
        estilos.avatarBase,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 2,
          backgroundColor: cores.primaria,
        },
      ]}
    >
      <Ionicons name="sparkles" size={tamanho * 0.5} color="#FFFFFF" />
    </View>
  );
}

function IndicadorDigitando() {
  const { cores } = useTheme();
  const opacidade = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacidade, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    animacao.start();

    return () => animacao.stop();
  }, [opacidade]);

  return (
    <View style={[estilos.linhaMensagem, estilos.alinhamentoIA]}>
      <AvatarAssistente tamanho={30} />

      <Animated.View
        style={[
          estilos.balao,
          estilos.balaoIA,
          {
            opacity: opacidade,
            backgroundColor: cores.card,
            borderColor: cores.borda,
          },
        ]}
      >
        <View style={estilos.digitando}>
          <View style={[estilos.ponto, { backgroundColor: cores.textoSecundario }]} />
          <View style={[estilos.ponto, { backgroundColor: cores.textoSecundario }]} />
          <View style={[estilos.ponto, { backgroundColor: cores.textoSecundario }]} />
        </View>
      </Animated.View>
    </View>
  );
}

export default function Assistente() {
  const alturaHeader = useHeaderHeight();
  const { cores } = useTheme();

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aguardando, setAguardando] = useState(false);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const lista = await carregarConversa();

      if (ativo) {
        setMensagens(lista);
        setCarregando(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  const enviavel = texto.trim().length > 0 && !aguardando;

  async function enviarTexto(entrada: string) {
    const textoLimpo = entrada.trim();

    if (!textoLimpo || aguardando) {
      return;
    }

    const mensagemUsuario: Mensagem = {
      id: gerarId(),
      papel: "usuario",
      texto: textoLimpo,
      criadoEm: new Date().toISOString(),
    };

    const novoHistorico = [...mensagens, mensagemUsuario];

    setMensagens(novoHistorico);
    setTexto("");
    setAguardando(true);

    await salvarConversa(novoHistorico);

    let resposta = RESPOSTA_ERRO;

    try {
      resposta = await enviarMensagemParaIA(textoLimpo);
    } catch (error) {
      console.error("Erro ao falar com a IA:", error);
    }

    const mensagemIA: Mensagem = {
      id: gerarId(),
      papel: "ia",
      texto: resposta,
      criadoEm: new Date().toISOString(),
    };

    const historicoFinal = [...novoHistorico, mensagemIA];

    setMensagens(historicoFinal);
    await salvarConversa(historicoFinal);
    setAguardando(false);
  }

  const confirmarLimpeza = () => {
    Alert.alert(
      "Apagar conversa",
      "Tem certeza que deseja apagar toda a conversa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            await limparConversa();
            setMensagens([]);
          },
        },
      ]
    );
  };

  const construirItens = (lista: Mensagem[]): ItemConversa[] => {
    // Lista invertida: a mensagem mais recente fica embaixo, perto do campo de texto.
    const invertida = [...lista].reverse();

    return invertida.map((mensagem, indice) => {
      const anterior = invertida[indice + 1];
      const mudouDia =
        !anterior || comecarDoDia(anterior.criadoEm) !== comecarDoDia(mensagem.criadoEm);

      return {
        tipo: "mensagem" as const,
        id: mensagem.id,
        mensagem,
        dia: mudouDia ? rotuloDia(mensagem.criadoEm) : null,
      };
    });
  };

  const itens: ItemConversa[] = aguardando
    ? [{ tipo: "digitando", id: "digitando" }, ...construirItens(mensagens)]
    : construirItens(mensagens);

  const renderItem = ({ item }: { item: ItemConversa }) => {
    if (item.tipo === "digitando") {
      return <IndicadorDigitando />;
    }

    const { mensagem, dia } = item;
    const ehUsuario = mensagem.papel === "usuario";

    return (
      <View style={estilos.grupoMensagem}>
        {dia && (
          <View style={estilos.linhaDia}>
            <Text
              style={[
                estilos.textoDia,
                { color: cores.textoSecundario, backgroundColor: cores.primariaSuave },
              ]}
            >
              {dia}
            </Text>
          </View>
        )}

        <View
          style={[
            estilos.linhaMensagem,
            ehUsuario ? estilos.alinhamentoUsuario : estilos.alinhamentoIA,
          ]}
        >
          {!ehUsuario && <AvatarAssistente tamanho={30} />}

          <View
            style={[
              estilos.balao,
              ehUsuario
                ? [estilos.balaoUsuario, { backgroundColor: cores.primaria }]
                : [
                    estilos.balaoIA,
                    { backgroundColor: cores.card, borderColor: cores.borda },
                  ],
            ]}
          >
            <Text
              style={[
                ehUsuario ? estilos.textoUsuario : estilos.textoIA,
                !ehUsuario && { color: cores.texto },
              ]}
            >
              {mensagem.texto}
            </Text>

            <Text
              style={[
                ehUsuario ? estilos.horaUsuario : estilos.horaIA,
                !ehUsuario && { color: cores.textoSecundario },
              ]}
            >
              {formatarHora(mensagem.criadoEm)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (carregando) {
    return (
      <View style={[estilos.centralizado, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.primariaTexto} />
        <Text style={[estilos.mensagemCarregando, { color: cores.textoSecundario }]}>
          Carregando conversa...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[estilos.container, { backgroundColor: cores.fundo }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={alturaHeader}
    >
      {/* TOPO DO CHAT */}
      <View
        style={[
          estilos.topo,
          { backgroundColor: cores.fundo, borderBottomColor: cores.borda },
        ]}
      >
        <AvatarAssistente tamanho={34} />

        <View style={estilos.infoTopo}>
          <Text style={[estilos.topoNome, { color: cores.texto }]}>
            Assistente FoodSave
          </Text>
          <Text style={[estilos.topoStatus, { color: cores.primariaTexto }]}>
            ● online
          </Text>
        </View>

        <Pressable
          style={estilos.botaoLimpar}
          onPress={confirmarLimpeza}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={20} color={cores.textoSecundario} />
        </Pressable>
      </View>

      {/* CONVERSA OU TELA INICIAL */}
      {mensagens.length === 0 ? (
        <View style={estilos.bemVindo}>
          <AvatarAssistente tamanho={72} />

          <Text style={[estilos.bemVindoTitulo, { color: cores.texto }]}>
            Olá! 👋
          </Text>
          <Text style={[estilos.bemVindoTexto, { color: cores.textoSecundario }]}>
            Sou o assistente do FoodSave. Posso dar dicas de armazenamento,
            receitas para usar o que está perto do vencimento e ajudar a
            organizar seus alimentos.
          </Text>

          <Text
            style={[
              estilos.bemVindoDica,
              {
                color: cores.textoSecundario,
                backgroundColor: cores.sucessoSuave,
              },
            ]}
          >
            ✨ Enquanto a IA real não é conectada, as respostas aqui são apenas
            exemplos de demonstração.
          </Text>

          <Text style={[estilos.tituloSugestoes, { color: cores.texto }]}>
            Que tal começar com:
          </Text>
          <View style={estilos.listaSugestoes}>
            {SUGESTOES.map((sugestao) => (
              <Pressable
                key={sugestao}
                style={[
                  estilos.sugestao,
                  { backgroundColor: cores.card, borderColor: cores.borda },
                ]}
                onPress={() => enviarTexto(sugestao)}
              >
                <Text
                  style={[estilos.textoSugestao, { color: cores.primariaTexto }]}
                >
                  {sugestao}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted
          style={estilos.lista}
          contentContainerStyle={estilos.conteudoLista}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* CAMPO DE MENSAGEM */}
      <View
        style={[
          estilos.barraEntrada,
          { backgroundColor: cores.fundo, borderTopColor: cores.borda },
        ]}
      >
        <View
          style={[
            estilos.caixaEntrada,
            { backgroundColor: cores.input, borderColor: cores.borda },
          ]}
        >
          <TextInput
            style={[estilos.entrada, { color: cores.texto }]}
            placeholder="Escreva sua mensagem..."
            placeholderTextColor={cores.textoFraco}
            value={texto}
            onChangeText={setTexto}
            multiline
          />
        </View>

        <Pressable
          style={[
            estilos.botaoEnviar,
            { backgroundColor: cores.primaria },
            enviavel ? null : { backgroundColor: cores.borda },
          ]}
          onPress={() => enviarTexto(texto)}
          disabled={!enviavel}
        >
          <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7F1",
  },

  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8F7F1",
  },

  mensagemCarregando: {
    fontSize: 14,
    color: "#65736B",
    marginTop: 10,
  },

  topo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAF2EC",
    backgroundColor: "#F8F7F1",
  },

  infoTopo: {
    flex: 1,
    marginLeft: 10,
  },

  topoNome: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#26332D",
  },

  topoStatus: {
    fontSize: 12,
    color: "#43855F",
    marginTop: 2,
  },

  botaoLimpar: {
    padding: 8,
    borderRadius: 20,
  },

  lista: {
    flex: 1,
  },

  conteudoLista: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },

  grupoMensagem: {
    marginBottom: 10,
  },

  linhaDia: {
    alignItems: "center",
    marginVertical: 12,
  },

  textoDia: {
    fontSize: 11,
    color: "#65736B",
    backgroundColor: "#EAF2EC",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: "hidden",
  },

  linhaMensagem: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },

  alinhamentoIA: {
    justifyContent: "flex-start",
  },

  alinhamentoUsuario: {
    justifyContent: "flex-end",
  },

  balao: {
    maxWidth: "82%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  balaoIA: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAF2EC",
    borderBottomLeftRadius: 4,
  },

  balaoUsuario: {
    backgroundColor: "#43855F",
    borderBottomRightRadius: 4,
  },

  textoIA: {
    fontSize: 15,
    lineHeight: 20,
    color: "#26332D",
  },

  textoUsuario: {
    fontSize: 15,
    lineHeight: 20,
    color: "#FFFFFF",
  },

  horaIA: {
    fontSize: 10,
    color: "#9AA79F",
    marginTop: 4,
    alignSelf: "flex-end",
  },

  horaUsuario: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
    alignSelf: "flex-end",
  },

  digitando: {
    flexDirection: "row",
    paddingVertical: 2,
  },

  ponto: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#9AA79F",
    marginHorizontal: 2,
  },

  avatarBase: {
    backgroundColor: "#43855F",
    justifyContent: "center",
    alignItems: "center",
  },

  bemVindo: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
  },

  bemVindoTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#26332D",
    marginTop: 16,
  },

  bemVindoTexto: {
    fontSize: 14,
    lineHeight: 20,
    color: "#65736B",
    textAlign: "center",
    marginTop: 8,
  },

  bemVindoDica: {
    fontSize: 12,
    color: "#65736B",
    textAlign: "center",
    marginTop: 12,
    backgroundColor: "#EAF4E9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: "hidden",
  },

  tituloSugestoes: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#26332D",
    marginTop: 22,
    marginBottom: 10,
  },

  listaSugestoes: {
    alignSelf: "stretch",
  },

  sugestao: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAF2EC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },

  textoSugestao: {
    fontSize: 14,
    color: "#43855F",
    fontWeight: "bold",
  },

  barraEntrada: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#EAF2EC",
    backgroundColor: "#F8F7F1",
  },

  caixaEntrada: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAF2EC",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  entrada: {
    fontSize: 15,
    color: "#26332D",
    maxHeight: 110,
  },

  botaoEnviar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#43855F",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  botaoEnviarDesativado: {
    backgroundColor: "#C7D8CD",
  },
});
