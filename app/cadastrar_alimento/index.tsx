import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import CalendarioModal from "../../src/components/CalendarioModal";
import CampoSelecao from "../../src/components/CampoSelecao";
import CampoSugestoes from "../../src/components/CampoSugestoes";
import {
  buscarOpcoesCadastro,
  cadastrarAlimento,
} from "../../src/services/alimentos";
import { atualizarProgressoMissao } from "../../src/services/missoes";
import { formatarBR, hojeISO } from "../../src/utils/datas";
import {
  capitalizar,
  limparEspacos,
  normalizar,
  paraNumero,
  somenteDecimal,
  somenteInteiros,
  somenteLetras,
  unicos,
} from "../../src/utils/formulario";

// Opções padrão (as mesmas categorias da tela de categorias)
const CATEGORIAS_PADRAO = [
  "Frutas",
  "Verduras e Legumes",
  "Carnes",
  "Laticínios",
  "Grãos e Cereais",
  "Bebidas",
  "Outros",
];

// Somente unidades oficiais do Sistema Internacional de Unidades (adotado no Brasil
// pelo INMETRO). "valor" é o que vai para o banco; "rotulo" é o que aparece na lista.
const UNIDADES_OFICIAIS = [
  { valor: "Miligrama", rotulo: "Miligrama (mg)" },
  { valor: "Grama", rotulo: "Grama (g)" },
  { valor: "Quilograma", rotulo: "Quilograma (kg)" },
  { valor: "Mililitro", rotulo: "Mililitro (mL)" },
  { valor: "Litro", rotulo: "Litro (L)" },
];

const MSG_VALIDADE_ANTES_COMPRA =
  "Não é possível a data de validade ser antes da data de compra.";
const MSG_COMPRA_FUTURA =
  "Não é possível escolher uma data de compra futura.";

type Erros = Partial<
  Record<
    | "nome"
    | "categoria"
    | "quantidade"
    | "unidade"
    | "peso"
    | "dataCompra"
    | "validade",
    string
  >
>;

export default function CadastrarAlimento() {
  const router = useRouter();
  const { cores } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("");
  const [peso, setPeso] = useState("");
  const [dataCompra, setDataCompra] = useState(""); // AAAA-MM-DD
  const [validade, setValidade] = useState(""); // AAAA-MM-DD

  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  const [calendarioAberto, setCalendarioAberto] = useState<
    "compra" | "validade" | null
  >(null);

  // Opções já cadastradas pelo usuário
  const [nomesCadastrados, setNomesCadastrados] = useState<string[]>([]);
  const [categoriasCadastradas, setCategoriasCadastradas] = useState<string[]>(
    []
  );

  const carregarOpcoes = useCallback(async () => {
    const opcoes = await buscarOpcoesCadastro();

    setNomesCadastrados(opcoes.nomes);
    setCategoriasCadastradas(opcoes.categorias);
  }, []);

  useEffect(() => {
    carregarOpcoes();
  }, [carregarOpcoes]);

  // Categorias já cadastradas primeiro, depois as padrão
  const categorias = useMemo(
    () => unicos([...categoriasCadastradas, ...CATEGORIAS_PADRAO]),
    [categoriasCadastradas]
  );

  const limparErro = (campo: keyof Erros) =>
    setErros((atual) => ({ ...atual, [campo]: undefined }));

  const limparFormulario = () => {
    setNome("");
    setCategoria("");
    setQuantidade("");
    setUnidade("");
    setPeso("");
    setDataCompra("");
    setValidade("");
    setErros({});
  };

  // ---------- Datas ----------

  const selecionarDataCompra = (iso: string) => {
    setDataCompra(iso);
    setCalendarioAberto(null);

    // Se a validade já escolhida ficou antes da nova data de compra, limpa e avisa
    if (validade && validade < iso) {
      setValidade("");
      setErros((atual) => ({
        ...atual,
        dataCompra: undefined,
        validade: MSG_VALIDADE_ANTES_COMPRA,
      }));
      return;
    }

    limparErro("dataCompra");
  };

  const selecionarValidade = (iso: string) => {
    setValidade(iso);
    setCalendarioAberto(null);
    limparErro("validade");
  };

  const abrirCalendarioValidade = () => {
    if (!dataCompra) {
      setErros((atual) => ({
        ...atual,
        validade: "Escolha primeiro a data de compra.",
      }));
      return;
    }

    setCalendarioAberto("validade");
  };

  // ---------- Validação e salvamento ----------

  const validar = () => {
    const novos: Erros = {};

    if (!limparEspacos(nome)) novos.nome = "Informe o nome do alimento.";
    if (!limparEspacos(categoria)) novos.categoria = "Informe a categoria.";

    if (!quantidade || Number(quantidade) <= 0) {
      novos.quantidade = "Informe um número inteiro maior que zero.";
    }

    if (!unidade) novos.unidade = "Escolha uma unidade.";

    if (peso && (Number.isNaN(paraNumero(peso)) || paraNumero(peso) <= 0)) {
      novos.peso = "Informe um peso maior que zero.";
    }

    if (!dataCompra) {
      novos.dataCompra = "Escolha a data de compra.";
    } else if (dataCompra > hojeISO()) {
      novos.dataCompra = MSG_COMPRA_FUTURA;
    }

    if (!validade) {
      novos.validade = "Escolha a data de validade.";
    } else if (dataCompra && validade < dataCompra) {
      novos.validade = MSG_VALIDADE_ANTES_COMPRA;
    }

    setErros(novos);

    return Object.keys(novos).length === 0;
  };

  const handleSalvar = async () => {
    if (salvando) return;

    if (!validar()) return;

    try {
      setSalvando(true);

      // Reaproveita a grafia de categoria já cadastrada (evita "laticinios" x "Laticínios")
      const nomeLimpo = limparEspacos(categoria);
      const categoriaFinal =
        categorias.find((c) => normalizar(c) === normalizar(nomeLimpo)) ??
        capitalizar(nomeLimpo);

      const alimentoSalvo = await cadastrarAlimento({
        nome: capitalizar(limparEspacos(nome)),
        categoria: categoriaFinal,
        quantidade: Number(quantidade),
        unidade,
        peso: peso ? paraNumero(peso) : null,
        dataCompra,
        validade,
      });

      console.log("Alimento cadastrado com sucesso:", alimentoSalvo);

      // Atualiza missão somente depois do cadastro
      await atualizarProgressoMissao("cadastrar_alimentos");

      limparFormulario();
      carregarOpcoes(); // o novo alimento já entra nas sugestões
      scrollRef.current?.scrollTo({ y: 0, animated: true });

      Alert.alert("Sucesso", "Alimento cadastrado com sucesso!");
    } catch (erro: any) {
      console.error("Erro ao cadastrar alimento:", erro);

      Alert.alert(
        "Erro",
        erro?.message || "Não foi possível cadastrar o alimento."
      );
    } finally {
      setSalvando(false);
    }
  };

  // Volta para a tela anterior; se não houver histórico, vai para a home
  const handleVoltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  // TODO: integrar a leitura da nota fiscal (QR Code / foto) quando estiver pronta
  const handleCadastrarPorNotaFiscal = () => {
    Alert.alert(
      "Em breve",
      "O cadastro por nota fiscal estará disponível em breve."
    );
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { backgroundColor: cores.fundo }]}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* BOTÃO VOLTAR */}
      <Pressable style={styles.voltar} onPress={handleVoltar}>
        <Ionicons name="arrow-back" size={24} color={cores.primariaTexto} />
        <Text style={[styles.voltarTexto, { color: cores.primariaTexto }]}>
          Voltar
        </Text>
      </Pressable>

      {/* CABEÇALHO */}
      <View style={styles.cabecalho}>
        <Text style={[styles.titulo, { color: cores.texto }]}>
          Cadastrar Alimento
        </Text>
        <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
          Preencha os dados do alimento
        </Text>
      </View>

      {/* FOTO */}
      <View style={styles.areaFoto}>
        <View
          style={[
            styles.circuloCamera,
            { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
          ]}
        >
          <Ionicons name="camera-outline" size={28} color={cores.primariaTexto} />
        </View>

        <Text style={[styles.textoFoto, { color: cores.primariaTexto }]}>
          Tirar Foto do Alimento
        </Text>
      </View>

      {/* SOBRE O ALIMENTO */}
      <View
        style={[styles.secao, { backgroundColor: cores.card, shadowColor: cores.sombra }]}
      >
        <Text style={[styles.tituloSecao, { color: cores.primariaTexto }]}>
          Sobre o alimento
        </Text>

        <CampoSugestoes
          label="Nome do Alimento"
          icone="restaurant-outline"
          placeholder="Ex: Macarrão Espaguete"
          valor={nome}
          aoMudar={(texto) => {
            setNome(somenteLetras(texto));
            limparErro("nome");
          }}
          opcoes={nomesCadastrados}
          erro={erros.nome}
        />

        <CampoSugestoes
          label="Categoria"
          icone="pricetag-outline"
          placeholder="Ex: Laticínios"
          valor={categoria}
          aoMudar={(texto) => {
            setCategoria(somenteLetras(texto));
            limparErro("categoria");
          }}
          opcoes={categorias}
          limite={8}
          permitirNova
          rotuloNova="categoria"
          erro={erros.categoria}
        />
      </View>

      {/* QUANTIDADE E MEDIDA */}
      <View
        style={[styles.secao, { backgroundColor: cores.card, shadowColor: cores.sombra }]}
      >
        <Text style={[styles.tituloSecao, { color: cores.primariaTexto }]}>
          Quantidade e medida
        </Text>

        <View style={styles.linha}>
          <View style={styles.campoMetade}>
            <View style={styles.campo}>
              <Text style={[styles.label, { color: cores.textoSecundario }]}>
                Quantidade
              </Text>

              <View
                style={[
                  styles.inputBox,
                  { backgroundColor: cores.input, borderColor: cores.borda },
                  !!erros.quantidade && [styles.inputErro, { borderColor: cores.perigo }],
                ]}
              >
                <Ionicons name="layers-outline" size={18} color={cores.primariaTexto} />

                <TextInput
                  style={[styles.input, { color: cores.texto }]}
                  placeholder="Ex: 2"
                  placeholderTextColor={cores.textoFraco}
                  keyboardType="number-pad"
                  value={quantidade}
                  onChangeText={(texto) => {
                    setQuantidade(somenteInteiros(texto));
                    limparErro("quantidade");
                  }}
                  maxLength={5}
                />
              </View>

              {!!erros.quantidade && (
                <Text style={[styles.erro, { color: cores.perigo }]}>
                  {erros.quantidade}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.campoMetade}>
            <CampoSelecao
              label="Unidade"
              titulo="Escolha a unidade"
              icone="scale-outline"
              placeholder="Selecione"
              valor={unidade}
              opcoes={UNIDADES_OFICIAIS}
              aoSelecionar={(valor) => {
                setUnidade(valor);
                limparErro("unidade");
              }}
              erro={erros.unidade}
            />
          </View>
        </View>

        <View style={styles.campo}>
          <Text style={[styles.label, { color: cores.textoSecundario }]}>
            Peso (kg) · opcional
          </Text>

          <View
            style={[
              styles.inputBox,
              { backgroundColor: cores.input, borderColor: cores.borda },
              !!erros.peso && [styles.inputErro, { borderColor: cores.perigo }],
            ]}
          >
            <Ionicons name="barbell-outline" size={18} color={cores.primariaTexto} />

            <TextInput
              style={[styles.input, { color: cores.texto }]}
              placeholder="Ex: 1,5"
              placeholderTextColor={cores.textoFraco}
              keyboardType="decimal-pad"
              value={peso}
              onChangeText={(texto) => {
                setPeso(somenteDecimal(texto));
                limparErro("peso");
              }}
              maxLength={9}
            />
          </View>

          {!!erros.peso && (
            <Text style={[styles.erro, { color: cores.perigo }]}>{erros.peso}</Text>
          )}
        </View>
      </View>

      {/* DATAS */}
      <View
        style={[styles.secao, { backgroundColor: cores.card, shadowColor: cores.sombra }]}
      >
        <Text style={[styles.tituloSecao, { color: cores.primariaTexto }]}>Datas</Text>

        <View style={styles.linha}>
          <View style={styles.campoMetade}>
            <Text style={[styles.label, { color: cores.textoSecundario }]}>
              Data de Compra
            </Text>

            <Pressable
              style={[
                styles.inputBox,
                { backgroundColor: cores.input, borderColor: cores.borda },
                !!erros.dataCompra && [styles.inputErro, { borderColor: cores.perigo }],
              ]}
              onPress={() => setCalendarioAberto("compra")}
            >
              <Ionicons name="calendar-outline" size={18} color={cores.primariaTexto} />

              <Text
                style={[
                  styles.valorData,
                  { color: cores.texto },
                  !dataCompra && { color: cores.textoFraco },
                ]}
                numberOfLines={1}
              >
                {dataCompra ? formatarBR(dataCompra) : "Selecione"}
              </Text>
            </Pressable>

            {!!erros.dataCompra && (
              <Text style={[styles.erro, { color: cores.perigo }]}>
                {erros.dataCompra}
              </Text>
            )}
          </View>

          <View style={styles.campoMetade}>
            <Text style={[styles.label, { color: cores.textoSecundario }]}>
              Validade
            </Text>

            <Pressable
              style={[
                styles.inputBox,
                { backgroundColor: cores.input, borderColor: cores.borda },
                !!erros.validade && [styles.inputErro, { borderColor: cores.perigo }],
              ]}
              onPress={abrirCalendarioValidade}
            >
              <Ionicons name="hourglass-outline" size={18} color={cores.primariaTexto} />

              <Text
                style={[
                  styles.valorData,
                  { color: cores.texto },
                  !validade && { color: cores.textoFraco },
                ]}
                numberOfLines={1}
              >
                {validade ? formatarBR(validade) : "Selecione"}
              </Text>
            </Pressable>

            {!!erros.validade && (
              <Text style={[styles.erro, { color: cores.perigo }]}>
                {erros.validade}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* BOTÃO SALVAR */}
      <Pressable
        style={[
          styles.botaoSalvar,
          { backgroundColor: cores.primaria },
          salvando && styles.botaoDesabilitado,
        ]}
        onPress={handleSalvar}
        disabled={salvando}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.textoBotaoSalvar}>
          {salvando ? "Salvando..." : "Salvar Alimento"}
        </Text>
      </Pressable>

      {/* BOTÃO CADASTRAR POR NOTA FISCAL */}
      <Pressable
        style={[
          styles.botaoNota,
          { backgroundColor: cores.card, borderColor: cores.primaria },
          salvando && styles.botaoDesabilitado,
        ]}
        onPress={handleCadastrarPorNotaFiscal}
        disabled={salvando}
      >
        <Ionicons name="receipt-outline" size={20} color={cores.primariaTexto} />
        <Text style={[styles.textoBotaoNota, { color: cores.primariaTexto }]}>
          Cadastrar por Nota Fiscal
        </Text>
      </Pressable>

      {/* CALENDÁRIOS */}
      <CalendarioModal
        visivel={calendarioAberto === "compra"}
        titulo="Data de compra"
        valor={dataCompra}
        maxData={hojeISO()}
        mensagemMaxima={MSG_COMPRA_FUTURA}
        aoSelecionar={selecionarDataCompra}
        aoFechar={() => setCalendarioAberto(null)}
      />

      <CalendarioModal
        visivel={calendarioAberto === "validade"}
        titulo="Data de validade"
        valor={validade}
        minData={dataCompra || undefined}
        mensagemMinima={MSG_VALIDADE_ANTES_COMPRA}
        aoSelecionar={selecionarValidade}
        aoFechar={() => setCalendarioAberto(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7F1",
  },

  conteudo: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  voltar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 25,
  },

  voltarTexto: {
    fontSize: 16,
    color: "#43855F",
    fontWeight: "600",
    marginLeft: 6,
  },

  cabecalho: {
    marginBottom: 20,
  },

  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#26332D",
  },

  subtitulo: {
    fontSize: 12,
    color: "#6B7A72",
    marginTop: 2,
  },

  areaFoto: {
    alignItems: "center",
    marginBottom: 20,
  },

  circuloCamera: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#43855F",
    backgroundColor: "#EAF2EC",
    justifyContent: "center",
    alignItems: "center",
  },

  textoFoto: {
    marginTop: 8,
    fontSize: 12,
    color: "#43855F",
    fontWeight: "600",
  },

  secao: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  tituloSecao: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#43855F",
    marginBottom: 14,
  },

  campo: {
    marginBottom: 14,
  },

  linha: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },

  campoMetade: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#46534D",
    marginBottom: 6,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 12,
    paddingHorizontal: 12,
  },

  inputErro: {
    borderColor: "#C0392B",
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#26332D",
    height: "100%",
  },

  valorData: {
    flex: 1,
    fontSize: 14,
    color: "#26332D",
  },

  placeholder: {
    color: "#8C9AA0",
  },

  erro: {
    marginTop: 5,
    fontSize: 11,
    color: "#C0392B",
  },

  botaoSalvar: {
    height: 50,
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#43855F",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },

  textoBotaoSalvar: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  botaoNota: {
    height: 50,
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#43855F",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  textoBotaoNota: {
    color: "#43855F",
    fontSize: 14,
    fontWeight: "bold",
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },
});
