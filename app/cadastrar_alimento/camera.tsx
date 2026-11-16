
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CameraNotaFiscal() {
  const router = useRouter();

  const cameraRef = useRef<CameraView>(null);
  const [permissao, solicitarPermissao] = useCameraPermissions();

  const [foto, setFoto] = useState<string | null>(null);
  const [capturando, setCapturando] = useState(false);

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
      Alert.alert("Erro", "Não foi possível tirar a foto.");
    } finally {
      setCapturando(false);
    }
  };

  // Refazer foto
  const refazerFoto = () => {
    setFoto(null);
  };

  // Confirmar foto e retornar ao cadastro
  const utilizarFoto = () => {
    if (!foto) return;

    router.replace({
      pathname: "/cadastrar_alimento",
      params: {
        fotoNota: foto,
      },
    });
  };

  // Carregando informações da permissão
  if (!permissao) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" />
        <Text>Verificando permissão da câmera...</Text>
      </View>
    );
  }

  // Permissão negada
  if (!permissao.granted) {
    return (
      <View style={styles.centralizado}>
        <Ionicons name="camera-outline" size={60} color="#4CAF50" />

        <Text style={styles.titulo}>
          Acesso à câmera
        </Text>

        <Text style={styles.descricao}>
          Precisamos acessar sua câmera para fotografar a nota fiscal.
        </Text>

        <Pressable
          style={styles.botaoPrincipal}
          onPress={solicitarPermissao}
        >
          <Text style={styles.textoBotao}>
            Permitir acesso à câmera
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.textoVoltar}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

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
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.tituloCabecalho}>
          {foto ? "Conferir nota fiscal" : "Fotografar nota fiscal"}
        </Text>
      </View>

      {/* CONTROLES */}
      <View style={styles.controles}>
        {foto ? (
          <>
            <Pressable
              style={styles.botaoSecundario}
              onPress={refazerFoto}
            >
              <Ionicons name="refresh-outline" size={22} color="#FFFFFF" />
              <Text style={styles.textoBotao}>
                Refazer
              </Text>
            </Pressable>

            <Pressable
              style={styles.botaoPrincipal}
              onPress={utilizarFoto}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
              <Text style={styles.textoBotao}>
                Utilizar foto
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.instrucao}>
              Posicione a nota fiscal dentro da câmera.
            </Text>

            <Pressable
              style={styles.botaoCapturar}
              onPress={tirarFoto}
              disabled={capturando}
            >
              {capturando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={32} color="#FFFFFF" />
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
    gap: 18,
  },

  instrucao: {
    color: "#FFFFFF",
    fontSize: 15,
    textAlign: "center",
    backgroundColor: "#00000080",
    padding: 10,
    borderRadius: 10,
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

  botaoSecundario: {
    backgroundColor: "#555555",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
});
