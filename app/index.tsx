import { Link, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View
      style={styles.container}
    >
      <View style={styles.header}>
        <Image 
          source={require("../assets/images/logo.jpeg")} 
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.titulo}>Bem-vindo!</Text>

        <Text style={styles.subtitulo}>
          Entre na sua conta para continuar
        </Text>
      </View>

      <View style={styles.formulario}>
        <View style={styles.campo}>
          <Text style={styles.label}>Usuario:</Text>

          <TextInput style={styles.input} placeholder="Usuario"/>
        </View>

        <View style={styles.campo}>
          <Text style={styles.label}>Senha:</Text>
          <TextInput style={styles.input} placeholder="Senha" secureTextEntry/>

          <Pressable>
            <Link style={styles.link} href="/esquec_senha">
              Esqueci minha senha
            </Link>
          </Pressable>

        </View>

        <Pressable 
          style={styles.botao} 
          onPress={() => router.push("/home")}
        >
          <Text style={styles.textoBotao}>Entrar</Text>
        </Pressable>
    </View>

    <View style={styles.rodape}>
      <Text style={styles.textoRodape}>
        Ainda não tem uma conta?
      </Text>

      <Pressable onPress={() => router.push("/cadastro")}>
        <Text style={styles.linkCriarConta}>Criar conta</Text>
      </Pressable>

      </View>

    </View>
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

  // -------------------------
  // CABEÇALHO
  // -------------------------

  header: {
    width: "100%",
    maxWidth: 450,

    alignItems: "center",

    marginBottom: 35,
  },

  logo: {
    width: 200,
    height: 300,

    marginBottom: 30,
    marginTop: 20,
    backgroundColor: "#fff",
  },

  titulo: {
    fontSize: 26,
    fontWeight: "700",

    color: "#333",

    marginBottom: 5,
  },

  subtitulo: {
    fontSize: 14,

    color: "#777",

    textAlign: "center",
  },

  // -------------------------
  // FORMULÁRIO
  // -------------------------

  formulario: {
    width: "100%",
    maxWidth: 450,
  },

  campo: {
    width: "100%",

    marginBottom: 20,
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

  link: {
    alignSelf: "flex-end",

    color: "#0a52cd",

    textDecorationLine: "underline",

    fontSize: 14,

    marginTop: 8,
  },

  // -------------------------
  // BOTÃO
  // -------------------------

  botao: {
    width: "100%",
    height: 45,

    backgroundColor: "#4CAF50",

    borderRadius: 7,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 50,
  },

  textoBotao: {
    color: "#fff",

    fontSize: 15,
    fontWeight: "600",
  },

  // -------------------------
  // RODAPÉ
  // -------------------------

  rodape: {
    width: "100%",
    maxWidth: 450,

    flexDirection: "row",

    justifyContent: "center",
    alignItems: "center",

    flexWrap: "wrap",

    marginTop: 25,
  },

  textoRodape: {
    color: "#666",

    fontSize: 14,

    marginRight: 5,
  },

  linkCriarConta: {
    color: "#4CAF50",

    fontSize: 14,

    fontWeight: "600",
  },
});