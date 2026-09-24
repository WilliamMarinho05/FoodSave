import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { supabase } from "../src/lib/supabase";

export default function Index() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Atenção", "Por favor, preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Erro no Login", error.message);
      setLoading(false);
    } else {
      router.replace("/home"); 
    }
  };

  return (
    <View style={styles.container}>

      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.titulo}>Bem-vindo!</Text>
        <Text style={styles.subtitulo}>
          Entre na sua conta para continuar
        </Text>
      </View>

      {/* CARD DO FORMULÁRIO */}
      <View style={styles.card}>

        <View style={styles.campo}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#A0A0A0"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.campoSenha}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#A0A0A0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <View style={styles.esqueciSenhaContainer}>
            <Link style={styles.link} href="/esquec_senha">
              Esqueci minha senha
            </Link>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.botao,
            pressed && !loading && styles.botaoPressionado,
            loading && styles.botaoDesabilitado
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotao}>Entrar</Text>
          )}
        </Pressable>

      </View>

      {/* RODAPÉ */}
      <View style={styles.rodape}>
        <Text style={styles.textoRodape}>
          Ainda não tem uma conta?
        </Text>
        <Pressable onPress={() => router.push("/cadastro")}>
          <Text style={styles.linkCriarConta}>
            Criar conta
          </Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  // TELA
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F4F8F5",
  },
  // CABEÇALHO
  header: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    marginBottom: 28,
  },
  logoContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  logo: {
    width: 105,
    height: 105,
    borderRadius: 20,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontSize: 15,
    color: "#7B8491",
    textAlign: "center",
  },
  // CARD
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  // CAMPOS
  campo: {
    width: "100%",
    marginBottom: 20,
  },
  campoSenha: {
    width: "100%",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8E4",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#F8FAF9",
  },
  // ESQUECI SENHA
  esqueciSenhaContainer: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  link: {
    color: "#388E3C",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "none",
  },
  // BOTÃO
  botao: {
    width: "100%",
    height: 54,
    backgroundColor: "#4CAF50",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  botaoPressionado: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  botaoDesabilitado: {
    backgroundColor: "#9E9E9E",
    shadowOpacity: 0,
    elevation: 0,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  // RODAPÉ
  rodape: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 26,
  },
  textoRodape: {
    color: "#7B8491",
    fontSize: 14,
    marginRight: 5,
  },
  linkCriarConta: {
    color: "#388E3C",
    fontSize: 14,
    fontWeight: "700",
  },
});