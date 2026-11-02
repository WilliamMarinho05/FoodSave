import { useTheme } from "@/src/context/ThemeContext";
import { supabase } from "@/src/lib/supabase";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";

export default function RedefinirSenha() {
  const { cores } = useTheme();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  useEffect(() => {
  async function verificarRecuperacao() {
    if (typeof window === "undefined") {
      return;
    }

    const hash = window.location.hash;

    if (!hash) {
      return;
    }

    const parametros = new URLSearchParams(hash.substring(1));

    const accessToken = parametros.get("access_token");
    const refreshToken = parametros.get("refresh_token");

    if (!accessToken || !refreshToken) {
      return;
    }

    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error(
        "Erro ao criar sessão de recuperação:",
        error
      );
    }
  }

  verificarRecuperacao();
}, []);

  async function redefinirSenha() {
    if (!novaSenha || !confirmarSenha) {
      Alert.alert("Atenção", "Preencha os dois campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não são iguais.");
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert(
        "Atenção",
        "A senha deve ter pelo menos 6 caracteres."
      );
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }

      Alert.alert(
        "Sucesso",
        "Sua senha foi alterada com sucesso!"
      );
    } catch (erro) {
      console.error("Erro ao redefinir senha:", erro);

      Alert.alert(
        "Erro",
        "Não foi possível alterar sua senha."
      );
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Text style={[styles.titulo, { color: cores.primariaTexto }]}>Redefinir Senha</Text>

      <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
        Digite sua nova senha abaixo.
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
        placeholder="Nova senha"
        placeholderTextColor={cores.textoFraco}
        secureTextEntry
        value={novaSenha}
        onChangeText={setNovaSenha}
      />

      <TextInput
        style={[
          styles.input,
          {
            color: cores.texto,
            backgroundColor: cores.input,
            borderColor: cores.borda,
          },
        ]}
        placeholder="Confirmar nova senha"
        placeholderTextColor={cores.textoFraco}
        secureTextEntry
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: cores.primaria }]}
        onPress={redefinirSenha}
      >
        <Text style={styles.textoBotao}>
          Redefinir Senha
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#FAF9F6",
  },

  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#43855F",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: "#FFF",
  },

  botao: {
    width: "100%",
    height: 45,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  textoBotao: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
