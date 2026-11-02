import { useTheme } from "@/src/context/ThemeContext";
import { supabase } from "@/src/lib/supabase";
import { mostrarAlerta, traduzirErroAuth } from "@/src/utils/mensagens";
import { criarSessaoRecuperacao } from "@/src/utils/recuperacaoSenha";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type EstadoLink = "verificando" | "valido" | "invalido";

export default function RedefinirSenha() {
  const router = useRouter();
  const { cores } = useTheme();

  const [estadoLink, setEstadoLink] = useState<EstadoLink>("verificando");
  const [mensagemLink, setMensagemLink] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvando, setSalvando] = useState(false);
  const salvandoRef = useRef(false);

  useEffect(() => {
    let ativo = true;

    async function validarUrl(url: string | null) {
      if (!ativo) {
        return;
      }

      if (url) {
        const resultado = await criarSessaoRecuperacao(url);

        if (!ativo) {
          return;
        }

        if (resultado.ok) {
          // Remove os tokens da URL para não reutilizá-los ao recarregar
          if (Platform.OS === "web" && typeof window !== "undefined") {
            window.history.replaceState(null, "", window.location.pathname);
          }
          setEstadoLink("valido");
          return;
        }

        // Pode ser um usuário já autenticado abrindo a tela
        const { data } = await supabase.auth.getSession();

        if (!ativo) {
          return;
        }

        if (data.session) {
          setEstadoLink("valido");
          return;
        }

        setMensagemLink(
          "O link de recuperação é inválido ou expirou. Solicite um novo e-mail."
        );
        if (resultado.erro) {
          console.warn("Falha ao validar link de recuperação:", resultado.erro);
        }
        setEstadoLink("invalido");
        return;
      }

      // Sem parâmetros na URL: só permite se já existir uma sessão ativa
      const { data } = await supabase.auth.getSession();

      if (!ativo) {
        return;
      }

      if (data.session) {
        setEstadoLink("valido");
      } else {
        setMensagemLink(
          "Abra o link enviado para o seu e-mail para redefinir a senha."
        );
        setEstadoLink("invalido");
      }
    }

    async function iniciar() {
      let url: string | null = null;

      if (Platform.OS === "web" && typeof window !== "undefined") {
        url = window.location.href;
      } else {
        url = await Linking.getInitialURL();
      }

      const temParametros =
        !!url && /access_token|refresh_token|[?&#]code=|error/.test(url);

      await validarUrl(temParametros ? url : null);
    }

    // No celular, o app pode já estar aberto quando o link chega
    const inscricao =
      Platform.OS === "web"
        ? null
        : Linking.addEventListener("url", ({ url }) => {
            validarUrl(url);
          });

    iniciar();

    return () => {
      ativo = false;
      inscricao?.remove();
    };
  }, []);

  async function sairParaLogin() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  function avisarSucesso(): Promise<void> {
    const titulo = "Senha redefinida";
    const mensagem =
      "Sua senha foi alterada com sucesso. Faça login novamente.";

    if (Platform.OS === "web") {
      mostrarAlerta(titulo, mensagem);
      return Promise.resolve();
    }

    return new Promise((resolver) => {
      Alert.alert(titulo, mensagem, [{ text: "OK", onPress: () => resolver() }], {
        cancelable: false,
      });
    });
  }

  async function redefinirSenha() {
    if (salvandoRef.current) {
      return;
    }

    if (!novaSenha || !confirmarSenha) {
      mostrarAlerta("Atenção", "Preencha os dois campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      mostrarAlerta("Atenção", "As senhas não são iguais.");
      return;
    }

    if (novaSenha.length < 6) {
      mostrarAlerta("Atenção", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    salvandoRef.current = true;
    setSalvando(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) {
        mostrarAlerta("Erro", traduzirErroAuth(error.message, error.code));
        return;
      }

      await avisarSucesso();
      await sairParaLogin();
    } catch (erro) {
      console.error("Erro ao redefinir senha:", erro);
      mostrarAlerta("Erro", "Não foi possível alterar sua senha.");
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
  }

  if (estadoLink === "verificando") {
    return (
      <View style={[styles.container, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.primariaTexto} />
        <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
          Validando link...
        </Text>
      </View>
    );
  }

  if (estadoLink === "invalido") {
    return (
      <View style={[styles.container, { backgroundColor: cores.fundo }]}>
        <Ionicons name="link-outline" size={48} color={cores.perigo} />

        <Text style={[styles.titulo, { color: cores.primariaTexto }]}>
          Link inválido ou expirado
        </Text>

        <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
          {mensagemLink}
        </Text>

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: cores.primaria }]}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.textoBotao}>Voltar para o login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <Text style={[styles.titulo, { color: cores.primariaTexto }]}>
        Redefinir Senha
      </Text>

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
        editable={!salvando}
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
        editable={!salvando}
      />

      <TouchableOpacity
        style={[
          styles.botao,
          { backgroundColor: cores.primaria },
          salvando && styles.botaoDesabilitado,
        ]}
        onPress={redefinirSenha}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoBotao}>Redefinir Senha</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkVoltar}
        onPress={() => router.replace("/")}
        disabled={salvando}
      >
        <Text style={[styles.linkVoltarTexto, { color: cores.primariaTexto }]}>
          Voltar para o login
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
    marginTop: 10,
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

  botaoDesabilitado: {
    opacity: 0.6,
  },

  textoBotao: {
    color: "#FFF",
    fontWeight: "bold",
  },

  linkVoltar: {
    marginTop: 20,
    alignItems: "center",
  },

  linkVoltarTexto: {
    fontSize: 14,
    fontWeight: "600",
  },
});
