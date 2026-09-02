import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function Cadastro() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  // Permite somente letras e espaços
  const handleNome = (texto: string, setter: (valor: string) => void) => {
    const somenteLetras = texto.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    setter(somenteLetras);
  };

  // Formata automaticamente para DD/MM/AAAA
  const handleDataNascimento = (texto: string) => {
    let data = texto.replace(/\D/g, "");

    if (data.length > 8) {
      data = data.substring(0, 8);
    }

    if (data.length >= 5) {
      data = `${data.substring(0, 2)}/${data.substring(
        2,
        4
      )}/${data.substring(4)}`;
    } else if (data.length >= 3) {
      data = `${data.substring(0, 2)}/${data.substring(2)}`;
    }

    setDataNascimento(data);
  };

  const criarConta = () => {
    if (!nome || !sobrenome || !dataNascimento || !email || !senha) {
      alert("Preencha todos os campos.");
      return;
    }

    if (senha !== confirmacaoSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    alert("Conta criada com sucesso!");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Criar conta</Text>

          <Text style={styles.subtitulo}>
            Preencha seus dados para criar sua conta
          </Text>
        </View>

        {/* NOME */}
        <View style={styles.campos}>
          <Text style={styles.label}>Nome</Text>

          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={(texto) => handleNome(texto, setNome)}
            placeholder="Digite seu nome"
            placeholderTextColor="#999"
            autoCapitalize="words"
          />
        </View>

        {/* SOBRENOME */}
        <View style={styles.campos}>
          <Text style={styles.label}>Sobrenome</Text>

          <TextInput
            style={styles.input}
            value={sobrenome}
            onChangeText={(texto) =>
              handleNome(texto, setSobrenome)
            }
            placeholder="Digite seu sobrenome"
            placeholderTextColor="#999"
            autoCapitalize="words"
          />
        </View>

        {/* DATA DE NASCIMENTO */}
        <View style={styles.campos}>
          <Text style={styles.label}>Data de nascimento</Text>

          <TextInput
            style={styles.input}
            value={dataNascimento}
            onChangeText={handleDataNascimento}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        {/* EMAIL */}
        <View style={styles.campos}>
          <Text style={styles.label}>E-mail</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* SENHA */}
        <View style={styles.campos}>
          <Text style={styles.label}>Senha</Text>

          <View style={styles.inputSenhaContainer}>
            <TextInput
              style={styles.inputSenha}
              value={senha}
              onChangeText={setSenha}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
            />

            <Pressable
              style={styles.botaoOlho}
              onPress={() => setMostrarSenha(!mostrarSenha)}
            >
              <Ionicons
                name={mostrarSenha ? "eye" : "eye-off"}
                size={20}
                color="#777"
               />

            </Pressable>
          </View>
        </View>

        {/* CONFIRMAÇÃO DA SENHA */}
        <View style={styles.campos}>
          <Text style={styles.label}>Confirmar senha</Text>

          <View style={styles.inputSenhaContainer}>
            <TextInput
              style={styles.inputSenha}
              value={confirmacaoSenha}
              onChangeText={setConfirmacaoSenha}
              placeholder="Digite a senha novamente"
              placeholderTextColor="#999"
              secureTextEntry={!mostrarConfirmacao}
              autoCapitalize="none"
            />

            <Pressable
              style={styles.botaoOlho}
              onPress={() =>
                setMostrarConfirmacao(!mostrarConfirmacao)
              }
            >
              <Ionicons
                name={mostrarSenha ? "eye" : "eye-off"}
                size={20}
                color="#777"
               />
            </Pressable>
          </View>
        </View>

        {/* BOTÃO */}
        <Pressable
          style={styles.botao}
          onPress={criarConta}
        >
          <Text style={styles.textoBotao}>
            Criar conta
          </Text>
        </Pressable>

        {/* RODAPÉ */}
        <View style={styles.rodape}>
          <Text style={styles.textoRodape}>
            Já possui uma conta?
          </Text>

          <Link href="/" style={styles.link}>
            Entrar
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",

    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,

    backgroundColor: "#fff",
  },

  card: {
    width: "100%",
    maxWidth: 450,
  },

  header: {
    marginBottom: 50,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 14,
    color: "#777",
    lineHeight: 20,
  },

  campos: {
    width: "100%",
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 7,
  },

  input: {
    width: "100%",
    height: 45,

    borderWidth: 1,
    borderColor: "#D5D5D5",
    borderRadius: 7,

    paddingHorizontal: 12,

    fontSize: 14,
    color: "#333",

    backgroundColor: "#FAFAFA",
  },

  inputSenhaContainer: {
    width: "100%",
    height: 45,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#D5D5D5",
    borderRadius: 7,

    backgroundColor: "#FAFAFA",
    
  },

  inputSenha: {
    flex: 1,
    height: "100%",

    paddingHorizontal: 12,

    fontSize: 14,
    color: "#333",
  },

  botaoOlho: {
    width: 45,
    height: "100%",

    justifyContent: "center",
    alignItems: "center",
  },

  iconeOlho: {
    fontSize: 20,
    color: "#777",
  },

  botao: {
    width: "100%",
    height: 45,

    backgroundColor: "#4CAF50",
    borderRadius: 7,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 40,
  },

  textoBotao: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  rodape: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    flexWrap: "wrap",

    marginTop: 24,
    paddingHorizontal: 10,
  },

  textoRodape: {
    color: "#666",
    fontSize: 14,
    marginRight: 5,
  },

  link: {
    color: "#0a52cd",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});