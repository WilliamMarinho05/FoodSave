import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { cadastrarAlimento } from "../../src/services/alimentos";
import { atualizarProgressoMissao } from "../../src/services/missoes";

export default function CadastrarAlimento() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("");
  const [peso, setPeso] = useState("");
  const [dataCompra, setDataCompra] = useState("");
  const [validade, setValidade] = useState("");

  const [salvando, setSalvando] = useState(false);

  // Converte DD/MM/AAAA para AAAA-MM-DD
  const converterData = (data: string) => {
    const partes = data.trim().split("/");

    if (partes.length !== 3) {
      throw new Error("Digite as datas no formato DD/MM/AAAA.");
    }

    const [dia, mes, ano] = partes;

    if (
      dia.length !== 2 ||
      mes.length !== 2 ||
      ano.length !== 4
    ) {
      throw new Error("Digite as datas no formato DD/MM/AAAA.");
    }

    const diaNumero = Number(dia);
    const mesNumero = Number(mes);
    const anoNumero = Number(ano);

    if (
      Number.isNaN(diaNumero) ||
      Number.isNaN(mesNumero) ||
      Number.isNaN(anoNumero) ||
      diaNumero < 1 ||
      diaNumero > 31 ||
      mesNumero < 1 ||
      mesNumero > 12
    ) {
      throw new Error("Informe uma data válida.");
    }

    return `${ano}-${mes}-${dia}`;
  };

  // Limpa o formulário
  const limparFormulario = () => {
    setNome("");
    setCategoria("");
    setQuantidade("");
    setUnidade("");
    setPeso("");
    setDataCompra("");
    setValidade("");
  };

  // Salva o alimento no Supabase
  const salvarAlimentoNoBanco = async () => {
    if (
      !nome.trim() ||
      !categoria.trim() ||
      !quantidade.trim() ||
      !unidade.trim() ||
      !dataCompra.trim() ||
      !validade.trim()
    ) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha todos os campos obrigatórios."
      );

      return null;
    }

    const quantidadeNumero = Number(
      quantidade.replace(",", ".")
    );

    if (
      Number.isNaN(quantidadeNumero) ||
      quantidadeNumero <= 0
    ) {
      Alert.alert(
        "Quantidade inválida",
        "Informe uma quantidade maior que zero."
      );

      return null;
    }

    const dataCompraFormatada = converterData(dataCompra);
    const validadeFormatada = converterData(validade);

    const alimentoSalvo = await cadastrarAlimento({
      nome: nome.trim(),
      categoria: categoria.trim(),
      quantidade: quantidadeNumero,
      unidade: unidade.trim(),
      dataCompra: dataCompraFormatada,
      validade: validadeFormatada,
    });

    return alimentoSalvo;
  };

  // BOTÃO SALVAR ALIMENTO
  const handleSalvar = async () => {
    if (salvando) {
      return;
    }

    try {
      setSalvando(true);

      const alimentoSalvo = await salvarAlimentoNoBanco();

      if (!alimentoSalvo) {
        return;
      }

      console.log(
        "Alimento cadastrado com sucesso:",
        alimentoSalvo
      );

      // Atualiza missão somente depois do cadastro
      await atualizarProgressoMissao(
        "cadastrar_alimentos"
      );

      Alert.alert(
        "Sucesso",
        "Alimento cadastrado com sucesso!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/home"),
          },
        ]
      );
    } catch (erro: any) {
      console.error(
        "Erro ao cadastrar alimento:",
        erro
      );

      Alert.alert(
        "Erro",
        erro?.message ||
          "Não foi possível cadastrar o alimento."
      );
    } finally {
      setSalvando(false);
    }
  };

  // BOTÃO SALVAR E CADASTRAR OUTRO
  const handleSalvarOutro = async () => {
    if (salvando) {
      return;
    }

    try {
      setSalvando(true);

      const alimentoSalvo = await salvarAlimentoNoBanco();

      if (!alimentoSalvo) {
        return;
      }

      console.log(
        "Alimento cadastrado com sucesso:",
        alimentoSalvo
      );

      await atualizarProgressoMissao(
        "cadastrar_alimentos"
      );

      limparFormulario();

      Alert.alert(
        "Sucesso",
        "Alimento salvo! Você pode cadastrar outro."
      );
    } catch (erro: any) {
      console.error(
        "Erro ao cadastrar alimento:",
        erro
      );

      Alert.alert(
        "Erro",
        erro?.message ||
          "Não foi possível cadastrar o alimento."
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* CABEÇALHO */}
      <View style={styles.cabecalho}>
        <Pressable
          style={styles.botaoVoltar}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="#43855F"
          />
        </Pressable>

        <Text style={styles.titulo}>
          Cadastrar Alimento
        </Text>
      </View>

      {/* FOTO */}
      <View style={styles.areaFoto}>
        <View style={styles.circuloCamera}>
          <Ionicons
            name="camera-outline"
            size={28}
            color="#43855F"
          />
        </View>

        <Text style={styles.textoFoto}>
          Tirar Foto do Alimento
        </Text>
      </View>

      {/* NOME */}
      <View style={styles.campo}>
        <Text style={styles.label}>
          Nome do Alimento
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: Macarrão Espaguete"
          placeholderTextColor="#8C9AA0"
          value={nome}
          onChangeText={setNome}
        />
      </View>

      {/* CATEGORIA + QUANTIDADE */}
      <View style={styles.linha}>
        <View style={styles.campoMetade}>
          <Text style={styles.label}>
            Categoria
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Laticínio"
            placeholderTextColor="#8C9AA0"
            value={categoria}
            onChangeText={setCategoria}
          />
        </View>

        <View style={styles.campoMetade}>
          <Text style={styles.label}>
            Quantidade
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: 2"
            placeholderTextColor="#8C9AA0"
            keyboardType="decimal-pad"
            value={quantidade}
            onChangeText={setQuantidade}
          />
        </View>
      </View>

      {/* UNIDADE + PESO */}
      <View style={styles.linha}>
        <View style={styles.campoMetade}>
          <Text style={styles.label}>
            Unidade
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Litro"
            placeholderTextColor="#8C9AA0"
            value={unidade}
            onChangeText={setUnidade}
          />
        </View>

        <View style={styles.campoMetade}>
          <Text style={styles.label}>
            Peso
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex: 1 Kg"
            placeholderTextColor="#8C9AA0"
            value={peso}
            onChangeText={setPeso}
          />
        </View>
      </View>

      {/* DATA DE COMPRA + VALIDADE */}
      <View style={styles.linha}>
        <View style={styles.campoMetade}>
          <Text style={styles.label}>
            Data de Compra
          </Text>

          <TextInput
            style={styles.input}
            placeholder="23/09/2026"
            placeholderTextColor="#8C9AA0"
            keyboardType="numeric"
            value={dataCompra}
            onChangeText={setDataCompra}
            maxLength={10}
          />
        </View>

        <View style={styles.campoMetade}>
          <Text style={styles.label}>
            Validade
          </Text>

          <TextInput
            style={styles.input}
            placeholder="28/10/2026"
            placeholderTextColor="#8C9AA0"
            keyboardType="numeric"
            value={validade}
            onChangeText={setValidade}
            maxLength={10}
          />
        </View>
      </View>

      {/* BOTÃO SALVAR */}
      <Pressable
        style={[
          styles.botaoSalvar,
          salvando && styles.botaoDesabilitado,
        ]}
        onPress={handleSalvar}
        disabled={salvando}
      >
        <Text style={styles.textoBotaoSalvar}>
          {salvando
            ? "Salvando..."
            : "Salvar Alimento"}
        </Text>
      </Pressable>

      {/* BOTÃO SALVAR E CADASTRAR OUTRO */}
      <Pressable
        style={[
          styles.botaoOutro,
          salvando && styles.botaoDesabilitado,
        ]}
        onPress={handleSalvarOutro}
        disabled={salvando}
      >
        <Text style={styles.textoBotaoOutro}>
          Salvar e Cadastrar Outro
        </Text>
      </Pressable>
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
    paddingBottom: 30,
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  botaoVoltar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#26332D",
  },

  areaFoto: {
    alignItems: "center",
    marginBottom: 22,
  },

  circuloCamera: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#43855F",
    backgroundColor: "#EAF2EC",
    justifyContent: "center",
    alignItems: "center",
  },

  textoFoto: {
    marginTop: 8,
    fontSize: 10,
    color: "#43855F",
  },

  campo: {
    marginBottom: 12,
  },

  linha: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  campoMetade: {
    flex: 1,
  },

  label: {
    fontSize: 10,
    color: "#46534D",
    marginBottom: 5,
  },

  input: {
    height: 40,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 11,
    color: "#26332D",
  },

  botaoSalvar: {
    height: 42,
    backgroundColor: "#43855F",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  textoBotaoSalvar: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  botaoOutro: {
    height: 42,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#43855F",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  textoBotaoOutro: {
    color: "#43855F",
    fontSize: 12,
    fontWeight: "bold",
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },
});