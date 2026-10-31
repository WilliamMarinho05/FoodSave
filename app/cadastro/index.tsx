import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { supabase } from "../../src/lib/supabase";

export default function Cadastro() {
  const router = useRouter();
  const { cores } = useTheme();

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [loading, setLoading] = useState(false); // Adicionado controle de carregamento

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
      data = `${data.substring(0, 2)}/${data.substring(2, 4)}/${data.substring(4)}`;
    } else if (data.length >= 3) {
      data = `${data.substring(0, 2)}/${data.substring(2)}`;
    }

    setDataNascimento(data);
  };

  const criarConta = async () => {
    if (!nome || !sobrenome || !dataNascimento || !email || !senha || !confirmacaoSenha) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (senha !== confirmacaoSenha) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }

    // Converte a data de DD/MM/AAAA para AAAA-MM-DD
    const partesData = dataNascimento.split("/");

    if (partesData.length !== 3) {
      Alert.alert("Atenção", "Digite uma data de nascimento válida.");
      return;
    }

    const [dia, mes, ano] = partesData;
    const dataNascimentoBanco = `${ano}-${mes}-${dia}`;

    setLoading(true);

    try {
      // Cria o usuário no Supabase Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            nome: nome.trim(),
            sobrenome: sobrenome.trim(),
            data_nascimento: dataNascimentoBanco,
          },
        },
      });

      if (authError) {
        Alert.alert("Erro ao criar conta", authError.message);
        return;
      }

      if (!authData.user) {
        Alert.alert("Erro", "Não foi possível criar o usuário.");
        return;
      }

      Alert.alert(
        "Sucesso!", 
        "Conta criada com sucesso! Se você habilitou a confirmação por e-mail no Supabase, verifique sua caixa de entrada."
      );

      router.replace("/");
    } catch (error) {
      console.error("Erro inesperado:", error);
      Alert.alert("Erro", "Ocorreu um erro ao criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: cores.fundo }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.titulo, { color: cores.texto }]}>Criar conta</Text>
          <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
            Preencha seus dados para criar sua conta
          </Text>
        </View>

        {/* NOME */}
        <View style={styles.campos}>
          <Text style={[styles.label, { color: cores.textoSecundario }]}>Nome</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: cores.texto,
                backgroundColor: cores.input,
                borderColor: cores.borda,
              },
            ]}
            value={nome}
            onChangeText={(texto) => handleNome(texto, setNome)}
            placeholder="Digite seu nome"
            placeholderTextColor={cores.textoFraco}
            autoCapitalize="words"
          />
        </View>

        {/* SOBRENOME */}
        <View style={styles.campos}>
          <Text style={[styles.label, { color: cores.textoSecundario }]}>Sobrenome</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: cores.texto,
                backgroundColor: cores.input,
                borderColor: cores.borda,
              },
            ]}
            value={sobrenome}
            onChangeText={(texto) => handleNome(texto, setSobrenome)}
            placeholder="Digite seu sobrenome"
            placeholderTextColor={cores.textoFraco}
            autoCapitalize="words"
          />
        </View>

        {/* DATA DE NASCIMENTO */}
        <View style={styles.campos}>
          <Text style={[styles.label, { color: cores.textoSecundario }]}>
            Data de nascimento
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: cores.texto,
                backgroundColor: cores.input,
                borderColor: cores.borda,
              },
            ]}
            value={dataNascimento}
            onChangeText={handleDataNascimento}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={cores.textoFraco}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        {/* EMAIL */}
        <View style={styles.campos}>
          <Text style={[styles.label, { color: cores.textoSecundario }]}>E-mail</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: cores.texto,
                backgroundColor: cores.input,
                borderColor: cores.borda,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu e-mail"
            placeholderTextColor={cores.textoFraco}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* SENHA */}
        <View style={styles.campos}>
          <Text style={[styles.label, { color: cores.textoSecundario }]}>Senha</Text>
          <View
            style={[
              styles.inputSenhaContainer,
              { backgroundColor: cores.input, borderColor: cores.borda },
            ]}
          >
            <TextInput
              style={[styles.inputSenha, { color: cores.texto }]}
              value={senha}
              onChangeText={setSenha}
              placeholder="Digite sua senha"
              placeholderTextColor={cores.textoFraco}
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
                color={cores.textoFraco}
               />
            </Pressable>
          </View>
        </View>

        {/* CONFIRMAÇÃO DA SENHA */}
        <View style={styles.campos}>
          <Text style={[styles.label, { color: cores.textoSecundario }]}>
            Confirmar senha
          </Text>
          <View
            style={[
              styles.inputSenhaContainer,
              { backgroundColor: cores.input, borderColor: cores.borda },
            ]}
          >
            <TextInput
              style={[styles.inputSenha, { color: cores.texto }]}
              value={confirmacaoSenha}
              onChangeText={setConfirmacaoSenha}
              placeholder="Digite a senha novamente"
              placeholderTextColor={cores.textoFraco}
              secureTextEntry={!mostrarConfirmacao}
              autoCapitalize="none"
            />
            <Pressable
              style={styles.botaoOlho}
              onPress={() => setMostrarConfirmacao(!mostrarConfirmacao)}
            >
              {/* Ajustado: Agora lê o estado correto mostrarConfirmacao */}
              <Ionicons
                name={mostrarConfirmacao ? "eye" : "eye-off"} 
                size={20}
                color={cores.textoFraco}
               />
            </Pressable>
          </View>
        </View>

        {/* BOTÃO */}
        <Pressable
          style={[
            styles.botao,
            { backgroundColor: cores.primaria },
            loading && styles.botaoDesabilitado,
          ]}
          onPress={criarConta}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotao}>Criar conta</Text>
          )}
        </Pressable>

        {/* RODAPÉ */}
        <View style={styles.rodape}>
          <Text style={[styles.textoRodape, { color: cores.textoSecundario }]}>
            Já possui uma conta?
          </Text>
          <Link href="/" style={[styles.link, { color: cores.primariaTexto }]}>
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
  botao: {
    width: "100%",
    height: 45,
    backgroundColor: "#4CAF50",
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  botaoDesabilitado: {
    backgroundColor: "#9E9E9E",
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