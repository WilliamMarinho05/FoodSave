import { useTheme } from "@/src/context/ThemeContext";
import { supabase } from "@/src/lib/supabase";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";

export default function EsqueceuSenha() {
  const { cores } = useTheme();
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviarEmail() {
    if (!email.trim()) {
      Alert.alert("Atenção", "Digite seu e-mail.");
      return;
    }

    try {
      setCarregando(true);

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
        redirectTo: "http://localhost:8081/redefinir_senha",
        }
        );

      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }

      Alert.alert(
        "E-mail enviado",
        "Se esse e-mail estiver cadastrado, você receberá um link para recuperar sua senha."
      );
    } catch (erro) {
      console.error("Erro ao recuperar senha:", erro);

      Alert.alert(
        "Erro",
        "Não foi possível enviar o e-mail de recuperação."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Image
        source={require("../../assets/images/logo.jpeg")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.campos}>
        <Text style={[styles.titulo, { color: cores.texto }]}>Recuperar Senha</Text>

        <TextInput
          style={[
            styles.input,
            {
              color: cores.texto,
              backgroundColor: cores.input,
              borderColor: cores.borda,
            },
          ]}
          placeholder="Digite seu e-mail"
          placeholderTextColor={cores.textoFraco}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.campos}>
        <TouchableOpacity
          style={[styles.botao, { backgroundColor: cores.primaria }]}
          onPress={enviarEmail}
          disabled={carregando}
        >
          <Text style={styles.textoBotao}>
            {carregando ? "Enviando..." : "Enviar E-mail"}
          </Text>
        </TouchableOpacity>
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

  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
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
    marginTop: 10,
  },

  textoBotao: {
    color: "#fff",
  },

  logo: {
    width: 250,
    height: 250,
    alignSelf: "center",
    marginBottom: 20,
  },
});