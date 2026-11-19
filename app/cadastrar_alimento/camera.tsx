import CalendarioModal from "@/src/components/CalendarioModal";
import { useTheme } from "@/src/context/ThemeContext";
import { cadastrarAlimentosEmLote } from "@/src/services/alimentos";
import { atualizarProgressoMissao } from "@/src/services/missoes";
import {
  analisarNotaFiscal,
  itensParaCadastro,
} from "@/src/services/notaFiscal";
import { AnaliseNotaFiscal, ItemNotaFiscal } from "@/src/types/notaFiscal";
import { formatarBR, hojeISO } from "@/src/utils/datas";
import { mostrarAlerta } from "@/src/utils/mensagens";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ROTULO_UNIDADE: Record<string, string> = {
  Miligrama: "mg",
  Grama: "g",
  Quilograma: "kg",
  Mililitro: "mL",
  Litro: "L",
};

function formatarReais(valor: number | null | undefined) {
  if (valor == null) return null;
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

const MSG_VALIDADE_ANTES_COMPRA =
  "A validade não pode ser antes da data de compra.";

/**
 * Verifica se o item identificado pela IA possui informações
 * suficientes para ser cadastrado automaticamente.
 *
 * A validação final continua sendo feita pelo serviço alimentos.ts.
 * Esta função serve apenas para impedir que um item incompleto seja
 * cadastrado automaticamente sem revisão do usuário.
 */
function obterPendenciasItem(item: ItemNotaFiscal): string[] {
  const pendencias: string[] = [];

  if (!item.nome?.trim()) {
    pendencias.push("nome");
  }

  if (
    !Number.isFinite(item.quantidade) ||
    !Number.isInteger(item.quantidade) ||
    item.quantidade <= 0
  ) {
    pendencias.push("quantidade");
  }

  if (!item.unidade?.trim()) {
    pendencias.push("unidade");
  }

  if (!item.categoria?.trim() || item.categoria === "Outros") {
    pendencias.push("categoria");
  }

  return pendencias;
}

function itemPrecisaRevisao(item: ItemNotaFiscal) {
  return obterPendenciasItem(item).length > 0;
}

function textoPendencias(item: ItemNotaFiscal) {
  const pendencias = obterPendenciasItem(item);

  if (pendencias.length === 0) {
    return "";
  }

  return pendencias.join(", ");
}

export default function CameraNotaFiscal() {
  const router = useRouter();
  const { cores } = useTheme();

  const cameraRef = React.useRef<CameraView>(null);
  const [permissao, solicitarPermissao] = useCameraPermissions();

  const [foto, setFoto] = useState<string | null>(null);
  const [capturando, setCapturando] = useState(false);

  const [analisando, setAnalisando] = useState(false);
  const [analise, setAnalise] = useState<AnaliseNotaFiscal | null>(null);
  const [erroAnalise, setErroAnalise] = useState<string | null>(null);

  const [modalValidadeAberta, setModalValidadeAberta] = useState(false);
  const [cadastrandoTodos, setCadastrandoTodos] = useState(false);

  // Tirar foto
  const tirarFoto = async () => {
    if (!cameraRef.current || capturando) return;

    try {
      setCapturando(true);

      const imagem = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (imagem?.uri) {
        setFoto(imagem.uri);
      }
    } catch (erro) {
      console.error("Erro ao tirar foto:", erro);
      setErroAnalise("Não foi possível tirar a foto.");
    } finally {
      setCapturando(false);
    }
  };

  // Refazer foto
  const refazerFoto = () => {
    setFoto(null);
    setAnalise(null);
    setErroAnalise(null);
  };

  // Envia a foto para a IA e mostra os itens encontrados
  const analisarFoto = async () => {
    if (!foto || analisando) return;

    try {
      setAnalisando(true);
      setErroAnalise(null);

      const resultado = await analisarNotaFiscal(foto);

      setAnalise(resultado);
    } catch (erro) {
      console.error("Erro ao analisar nota fiscal:", erro);

      setErroAnalise(
        erro instanceof Error
          ? erro.message
          : "Não foi possível analisar a nota."
      );
    } finally {
      setAnalisando(false);
    }
  };

  // Abre o cadastro já preenchido com os dados do item escolhido.
  // Essa tela permite que o usuário revise e edite manualmente
  // as informações identificadas pela IA.
  const cadastrarItem = (item: ItemNotaFiscal) => {
    if (!foto) return;

    router.navigate({
      pathname: "/cadastrar_alimento",
      params: {
        fotoNota: foto,
        nome: item.nome,
        categoria: item.categoria,
        quantidade: String(item.quantidade),
        unidade: item.unidade ?? "",
        dataCompra: analise?.dataCompra ?? hojeISO(),
        preco: item.precoTotal != null ? item.precoTotal.toFixed(2) : "",
      },
    });
  };

  // Cadastro manual, mantendo a foto anexada
  const cadastrarManualmente = () => {
    router.navigate({
      pathname: "/cadastrar_alimento",
      params: {
        fotoNota: foto ?? "",
        nome: "",
        categoria: "",
        quantidade: "",
        unidade: "",
        dataCompra: "",
        preco: "",
      },
    });
  };

  // Data da nota (quando válida) usada como compra e como limite mínimo da validade
  const dataCompraNota = useMemo(() => {
    const data = analise?.dataCompra;

    return data && /^\d{4}-\d{2}-\d{2}$/.test(data) && data <= hojeISO()
      ? data
      : hojeISO();
  }, [analise?.dataCompra]);

  /**
   * Quantidade de itens que precisam ser conferidos manualmente.
   */
  const quantidadeItensParaRevisar = useMemo(() => {
    if (!analise) return 0;

    return analise.itens.filter(itemPrecisaRevisao).length;
  }, [analise]);

  /**
   * Só permite o cadastro automático quando todos os alimentos
   * possuem as informações necessárias.
   */
  const podeCadastrarTodos =
    !!analise?.itens.length && quantidadeItensParaRevisar === 0;

  const abrirCadastroEmLote = () => {
    if (!analise?.itens.length || cadastrandoTodos) return;

    if (!podeCadastrarTodos) {
      mostrarAlerta(
        "Revisão necessária",
        `${quantidadeItensParaRevisar} ${
          quantidadeItensParaRevisar === 1
            ? "alimento precisa"
            : "alimentos precisam"
        } ser revisado${
          quantidadeItensParaRevisar === 1 ? "" : "s"
        } antes do cadastro automático. Toque no item marcado para conferir e editar as informações.`
      );

      return;
    }

    setModalValidadeAberta(true);
  };

  // Cadastra todos os itens da nota de uma vez. A validade é escolhida uma
  // única vez no calendário e compartilhada por todos os alimentos.
  const cadastrarTodosOsItens = async (validade: string) => {
    setModalValidadeAberta(false);

    if (!analise?.itens.length || cadastrandoTodos) return;

    // Segunda proteção para evitar cadastro de informações incompletas.
    const itensPendentes = analise.itens.filter(itemPrecisaRevisao);

    if (itensPendentes.length > 0) {
      mostrarAlerta(
        "Revisão necessária",
        "Existem alimentos com informações incompletas. Revise os itens antes de realizar o cadastro em lote."
      );

      return;
    }

    setCadastrandoTodos(true);

    try {
      const itens = itensParaCadastro(analise, validade);
      const cadastrados = await cadastrarAlimentosEmLote(itens);

      // Cada alimento cadastrado conta para as missões diária/semanal
      await atualizarProgressoMissao("cadastrar_alimentos", cadastrados);

      mostrarAlerta(
        "Cadastro concluído!",
        `${cadastrados} ${
          cadastrados === 1
            ? "alimento cadastrado"
            : "alimentos cadastrados"
        } e sincronizado${cadastrados === 1 ? "" : "s"} com sua lista.`
      );

      // A lista recarrega ao ganhar foco (useFocusEffect) e já traz os novos itens
      router.replace("/alimentos");
    } catch (erro) {
      console.error("Erro ao cadastrar itens da nota:", erro);

      mostrarAlerta(
        "Erro ao cadastrar",
        erro instanceof Error
          ? erro.message
          : "Não foi possível cadastrar os itens. Tente novamente."
      );
    } finally {
      setCadastrandoTodos(false);
    }
  };

  const totalItens = useMemo(
    () =>
      analise?.total ??
      analise?.itens.reduce(
        (soma, item) => soma + (item.precoTotal ?? 0),
        0
      ) ??
      0,
    [analise]
  );

  // Carregando informações da permissão
  if (!permissao) {
    return (
      <View style={[styles.centralizado, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.primaria} />

        <Text style={{ color: cores.texto }}>
          Verificando permissão da câmera...
        </Text>
      </View>
    );
  }

  // Permissão negada
  if (!permissao.granted) {
    return (
      <View style={[styles.centralizado, { backgroundColor: cores.fundo }]}>
        <Ionicons
          name="camera-outline"
          size={60}
          color={cores.primariaTexto}
        />

        <Text style={[styles.titulo, { color: cores.texto }]}>
          Acesso à câmera
        </Text>

        <Text style={[styles.descricao, { color: cores.textoSecundario }]}>
          Precisamos acessar sua câmera para fotografar a nota fiscal.
        </Text>

        <Pressable
          style={[styles.botaoPrincipal, { backgroundColor: cores.primaria }]}
          onPress={solicitarPermissao}
        >
          <Text style={styles.textoBotao}>
            Permitir acesso à câmera
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={[styles.textoVoltar, { color: cores.primariaTexto }]}>
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  // ---------- RESULTADO DA LEITURA DA NOTA ----------
  if (foto && analise) {
    const temItens = analise.itens.length > 0;

    return (
      <View style={[styles.resultado, { backgroundColor: cores.fundo }]}>
        <View style={styles.cabecalhoResultado}>
          <Pressable
            style={[
              styles.botaoVoltarResultado,
              {
                backgroundColor: cores.card,
                borderColor: cores.borda,
              },
            ]}
            onPress={() => setAnalise(null)}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={cores.texto}
            />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={[styles.tituloResultado, { color: cores.texto }]}>
              Nota lida com a IA
            </Text>

            <Text
              style={[
                styles.subtituloResultado,
                { color: cores.textoSecundario },
              ]}
            >
              Confira os alimentos antes de cadastrar
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.conteudoResultado}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.cartaoResumo,
              {
                backgroundColor: cores.card,
                borderColor: cores.borda,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.rotuloResumo,
                  { color: cores.textoSecundario },
                ]}
              >
                {analise.estabelecimento ?? "Nota fiscal"}
              </Text>

              {!!analise.dataCompra && (
                <Text
                  style={[
                    styles.dataResumo,
                    { color: cores.textoSecundario },
                  ]}
                >
                  Compra em {formatarBR(analise.dataCompra)}
                </Text>
              )}
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={[
                  styles.rotuloResumo,
                  { color: cores.textoSecundario },
                ]}
              >
                {analise.itens.length} item(ns)
              </Text>

              {totalItens > 0 && (
                <Text
                  style={[
                    styles.totalResumo,
                    { color: cores.primariaTexto },
                  ]}
                >
                  {formatarReais(totalItens)}
                </Text>
              )}
            </View>
          </View>

          {/* AVISO DE REVISÃO */}
          {quantidadeItensParaRevisar > 0 && (
            <View style={styles.avisoRevisao}>
              <Ionicons
                name="warning-outline"
                size={22}
                color="#9A6700"
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.tituloAvisoRevisao}>
                  Revisão necessária
                </Text>

                <Text style={styles.textoAvisoRevisao}>
                  {quantidadeItensParaRevisar}{" "}
                  {quantidadeItensParaRevisar === 1
                    ? "alimento possui"
                    : "alimentos possuem"}{" "}
                  informações que precisam ser conferidas. Toque nos itens
                  marcados para revisar e editar.
                </Text>
              </View>
            </View>
          )}

          {/* CADASTRO AUTOMÁTICO DE TODOS OS ITENS */}
          {temItens && (
            <>
              <Pressable
                style={[
                  styles.botaoPrincipal,
                  styles.botaoLargo,
                  (!podeCadastrarTodos || cadastrandoTodos) &&
                    styles.botaoDesabilitado,
                ]}
                onPress={abrirCadastroEmLote}
                disabled={cadastrandoTodos}
              >
                {cadastrandoTodos ? (
                  <>
                    <ActivityIndicator
                      color="#FFFFFF"
                      size="small"
                    />

                    <Text style={styles.textoBotao}>
                      Cadastrando alimentos...
                    </Text>
                  </>
                ) : quantidadeItensParaRevisar > 0 ? (
                  <>
                    <Ionicons
                      name="warning-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text style={styles.textoBotao}>
                      Revisar antes de cadastrar
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-done-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text style={styles.textoBotao}>
                      Cadastrar todos ({analise.itens.length})
                    </Text>
                  </>
                )}
              </Pressable>

              <Text
                style={[
                  styles.textoAjudaLote,
                  { color: cores.textoSecundario },
                ]}
              >
                {quantidadeItensParaRevisar > 0
                  ? "Os itens marcados precisam ser conferidos antes do cadastro em lote."
                  : "Todos os itens estão prontos. Escolha uma validade para concluir o cadastro."}
              </Text>
            </>
          )}

          {temItens ? (
            analise.itens.map((item, indice) => {
              const preco = formatarReais(item.precoTotal);

              const unidade =
                ROTULO_UNIDADE[item.unidade ?? ""] ??
                item.unidadeNota ??
                "não identificada";

              const precisaRevisao = itemPrecisaRevisao(item);
              const pendencias = textoPendencias(item);

              return (
                <Pressable
                  key={`${item.nome}-${indice}`}
                  onPress={() => cadastrarItem(item)}
                  disabled={cadastrandoTodos}
                  style={({ pressed }) => [
                    styles.cartaoItem,
                    {
                      backgroundColor: cores.card,
                      borderColor: precisaRevisao
                        ? "#E6A700"
                        : cores.borda,
                      opacity: pressed ? 0.7 : 1,
                    },
                    precisaRevisao && styles.cartaoItemRevisao,
                    cadastrandoTodos && styles.botaoDesabilitado,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.linhaNomeItem}>
                      <Text
                        style={[
                          styles.nomeItem,
                          { color: cores.texto },
                        ]}
                        numberOfLines={2}
                      >
                        {item.nome || "Alimento não identificado"}
                      </Text>

                      {precisaRevisao && (
                        <View style={styles.chipRevisao}>
                          <Ionicons
                            name="warning-outline"
                            size={12}
                            color="#7A5200"
                          />

                          <Text style={styles.textoChipRevisao}>
                            Revisar
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.detalheItem,
                        { color: cores.textoSecundario },
                      ]}
                    >
                      {item.quantidade} {unidade} · {item.categoria}
                    </Text>

                    {precisaRevisao && (
                      <Text style={styles.textoPendencia}>
                        Conferir: {pendencias}
                      </Text>
                    )}
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    {!!preco && (
                      <Text
                        style={[
                          styles.precoItem,
                          { color: cores.texto },
                        ]}
                      >
                        {preco}
                      </Text>
                    )}

                    <View
                      style={[
                        styles.chipCadastrar,
                        {
                          backgroundColor: precisaRevisao
                            ? "#FFF3CD"
                            : cores.primariaSuave,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          precisaRevisao
                            ? "create-outline"
                            : "add-circle-outline"
                        }
                        size={14}
                        color={
                          precisaRevisao
                            ? "#7A5200"
                            : cores.primariaTexto
                        }
                      />

                      <Text
                        style={[
                          styles.textoChipCadastrar,
                          {
                            color: precisaRevisao
                              ? "#7A5200"
                              : cores.primariaTexto,
                          },
                        ]}
                      >
                        {precisaRevisao ? "Revisar" : "Cadastrar"}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          ) : (
            <View
              style={[
                styles.cartaoVazio,
                {
                  backgroundColor: cores.card,
                  borderColor: cores.borda,
                },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={38}
                color={cores.primariaTexto}
              />

              <Text style={[styles.tituloVazio, { color: cores.texto }]}>
                Nenhum alimento legível
              </Text>

              <Text
                style={[
                  styles.textoVazio,
                  { color: cores.textoSecundario },
                ]}
              >
                Não consegui identificar alimentos nesta foto. Tente outra foto
                com a nota inteira, bem iluminada e sem dobras.
              </Text>
            </View>
          )}

          <Pressable
            style={[styles.botaoPrincipal, { marginTop: 6 }]}
            onPress={refazerFoto}
            disabled={cadastrandoTodos}
          >
            <Ionicons
              name="camera-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.textoBotao}>
              Analisar outra foto
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.botaoSecundario,
              {
                backgroundColor: cores.card,
                borderColor: cores.borda,
              },
            ]}
            onPress={cadastrarManualmente}
            disabled={cadastrandoTodos}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={cores.primariaTexto}
            />

            <Text
              style={[
                styles.textoBotao,
                { color: cores.primariaTexto },
              ]}
            >
              Cadastrar manualmente
            </Text>
          </Pressable>
        </ScrollView>

        <CalendarioModal
          visivel={modalValidadeAberta}
          titulo="Validade dos alimentos"
          valor={dataCompraNota}
          minData={dataCompraNota}
          mensagemMinima={MSG_VALIDADE_ANTES_COMPRA}
          aoSelecionar={cadastrarTodosOsItens}
          aoFechar={() => setModalValidadeAberta(false)}
        />
      </View>
    );
  }

  // ---------- CÂMERA / PRÉVIA DA FOTO ----------
  return (
    <View style={styles.container}>
      {/* PRÉVIA DA FOTO */}
      {foto ? (
        <Image
          source={{ uri: foto }}
          style={styles.camera}
          resizeMode="contain"
        />
      ) : (
        /* CÂMERA AO VIVO */
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />
      )}

      {/* CABEÇALHO */}
      <View style={styles.cabecalho}>
        <Pressable
          style={styles.botaoVoltar}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={26}
            color="#FFFFFF"
          />
        </Pressable>

        <Text style={styles.tituloCabecalho}>
          {foto ? "Conferir nota fiscal" : "Fotografar nota fiscal"}
        </Text>
      </View>

      {/* CONTROLES */}
      <View style={styles.controles}>
        {foto ? (
          <>
            {!!erroAnalise && (
              <View style={styles.caixaErro}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.textoErro}>
                  {erroAnalise}
                </Text>
              </View>
            )}

            <Pressable
              style={[
                styles.botaoPrincipal,
                styles.botaoLargo,
                analisando && styles.botaoDesabilitado,
              ]}
              onPress={analisarFoto}
              disabled={analisando}
            >
              {analisando ? (
                <>
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                  />

                  <Text style={styles.textoBotao}>
                    Lendo a nota...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="sparkles-outline"
                    size={22}
                    color="#FFFFFF"
                  />

                  <Text style={styles.textoBotao}>
                    Analisar com IA
                  </Text>
                </>
              )}
            </Pressable>

            <View style={styles.linhaBotoes}>
              <Pressable
                style={[
                  styles.botaoSecundario,
                  styles.botaoMetade,
                ]}
                onPress={refazerFoto}
                disabled={analisando}
              >
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.textoBotao}>
                  Refazer
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.botaoSecundario,
                  styles.botaoMetade,
                ]}
                onPress={cadastrarManualmente}
                disabled={analisando}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.textoBotao}>
                  Sem IA
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.instrucao}>
              Posicione a nota fiscal dentro da câmera, com boa iluminação.
            </Text>

            <Pressable
              style={styles.botaoCapturar}
              onPress={tirarFoto}
              disabled={capturando}
            >
              {capturando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="camera"
                  size={32}
                  color="#FFFFFF"
                />
              )}
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  camera: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  cabecalho: {
    position: "absolute",
    top: 45,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  botaoVoltar: {
    padding: 10,
    backgroundColor: "#00000080",
    borderRadius: 30,
  },

  tituloCabecalho: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  controles: {
    position: "absolute",
    bottom: 45,
    left: 20,
    right: 20,
    alignItems: "center",
    gap: 14,
  },

  instrucao: {
    color: "#FFFFFF",
    fontSize: 15,
    textAlign: "center",
    backgroundColor: "#00000080",
    padding: 10,
    borderRadius: 10,
  },

  caixaErro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#B3261E",
    padding: 12,
    borderRadius: 12,
    width: "100%",
  },

  textoErro: {
    color: "#FFFFFF",
    fontSize: 13,
    flex: 1,
  },

  botaoCapturar: {
    width: 75,
    height: 75,
    borderRadius: 50,
    backgroundColor: "#4CAF50",
    borderWidth: 5,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoPrincipal: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  botaoLargo: {
    width: "100%",
  },

  botaoSecundario: {
    backgroundColor: "#555555",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },

  linhaBotoes: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },

  botaoMetade: {
    flex: 1,
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    gap: 15,
    backgroundColor: "#FFFFFF",
  },

  titulo: {
    fontSize: 22,
    fontWeight: "bold",
  },

  descricao: {
    fontSize: 15,
    textAlign: "center",
    color: "#666666",
  },

  textoVoltar: {
    color: "#4CAF50",
    fontSize: 16,
    marginTop: 10,
  },

  // ---------- RESULTADO ----------
  resultado: {
    flex: 1,
    paddingTop: 50,
  },

  cabecalhoResultado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  botaoVoltarResultado: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  tituloResultado: {
    fontSize: 19,
    fontWeight: "bold",
  },

  subtituloResultado: {
    fontSize: 12,
    marginTop: 2,
  },

  conteudoResultado: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 10,
  },

  textoAjudaLote: {
    fontSize: 12,
    textAlign: "center",
    marginTop: -4,
  },

  cartaoResumo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 4,
  },

  rotuloResumo: {
    fontSize: 12,
    fontWeight: "600",
  },

  dataResumo: {
    fontSize: 12,
    marginTop: 3,
  },

  totalResumo: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },

  avisoRevisao: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFF8E1",
    borderColor: "#E6A700",
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
  },

  tituloAvisoRevisao: {
    color: "#7A5200",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  textoAvisoRevisao: {
    color: "#7A5200",
    fontSize: 12,
    lineHeight: 17,
  },

  cartaoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },

  cartaoItemRevisao: {
    borderWidth: 1.5,
  },

  linhaNomeItem: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  nomeItem: {
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
  },

  detalheItem: {
    fontSize: 12,
    marginTop: 3,
  },

  textoPendencia: {
    color: "#9A6700",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 5,
  },

  precoItem: {
    fontSize: 15,
    fontWeight: "bold",
  },

  chipRevisao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFF3CD",
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  textoChipRevisao: {
    color: "#7A5200",
    fontSize: 10,
    fontWeight: "700",
  },

  chipCadastrar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
  },

  textoChipCadastrar: {
    fontSize: 11,
    fontWeight: "700",
  },

  cartaoVazio: {
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    padding: 22,
  },

  tituloVazio: {
    fontSize: 16,
    fontWeight: "bold",
  },

  textoVazio: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
});