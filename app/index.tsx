import { Link, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View
      style={styles.container}
    >
      <Image 
        source={require("../assets/images/logo.jpeg")} 
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.campos}>
        <Text>Usuario:</Text>
        <TextInput style={styles.input} placeholder="Usuario"/>
      </View>

      <View style={styles.campos}>
        <Text>Senha:</Text>
        <TextInput style={styles.input} placeholder="Senha" secureTextEntry/>

        <Pressable>
          <Link style={styles.link} href="/esquec_senha">
            Esqueci minha senha
          </Link>
        </Pressable>

      </View>

      <View style={styles.campos}>
        <Pressable 
          style={styles.botao} 
          onPress={() => router.push("/home")}
        >
          <Text style={styles.textoBotao}>Entrar</Text>
        </Pressable>

        <View style={styles.campoCriarConta}>
          <Text style={styles.textoCriarConta}>
            Ainda não tem uma conta?
          </Text>

          <Pressable onPress={() => alert("Criar conta")}>
            <Text style={styles.linkCriarConta}>Criar conta</Text>
          </Pressable>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  campos: {
    width: "80%",
    marginBottom: "10%",
  },
  
  input: {
    width: "100%",
    height: 40,

    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,

    paddingHorizontal: 10,
  },

  botao: {
    width: "100%",
    height: 40,
    backgroundColor: "#4CAF50",
    borderRadius: 5,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 10
  },

  textoBotao: {
    color: "#fff",
  },

  link: {
    color: "#0a52cd",
    textDecorationLine: "underline",
    fontSize: 14,
    marginTop: 15,

    alignSelf: "flex-end",
  },

  linkCriarConta: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },

  campoCriarConta: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 20,
  },

  textoCriarConta: {
    color: "#666",
    fontSize: 14,
  },

  logo: {
    width: 250,
    height: 250,
    alignSelf: "center",
    marginBottom: 20,
  }
});