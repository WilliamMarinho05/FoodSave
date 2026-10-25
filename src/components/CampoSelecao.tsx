import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type OpcaoSelecao = { valor: string; rotulo: string };

type Props = {
  label: string;
  titulo: string;
  icone: React.ComponentProps<typeof Ionicons>["name"];
  placeholder: string;
  valor: string;
  opcoes: OpcaoSelecao[];
  aoSelecionar: (valor: string) => void;
  erro?: string;
};

// Campo em que só é possível escolher entre as opções existentes (sem digitar)
export default function CampoSelecao({
  label,
  titulo,
  icone,
  placeholder,
  valor,
  opcoes,
  aoSelecionar,
  erro,
}: Props) {
  const [aberto, setAberto] = useState(false);

  const rotuloAtual = opcoes.find((o) => o.valor === valor)?.rotulo ?? "";

  return (
    <View style={styles.campo}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        style={[styles.inputBox, !!erro && styles.inputErro]}
        onPress={() => setAberto(true)}
      >
        <Ionicons name={icone} size={18} color="#43855F" />

        <Text
          style={[styles.valor, !valor && styles.placeholder]}
          numberOfLines={1}
        >
          {rotuloAtual || placeholder}
        </Text>

        <Ionicons name="chevron-down" size={18} color="#8C9AA0" />
      </Pressable>

      {!!erro && <Text style={styles.erro}>{erro}</Text>}

      <Modal
        visible={aberto}
        transparent
        animationType="slide"
        onRequestClose={() => setAberto(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setAberto(false)}
          />

          <View style={styles.sheet}>
            <View style={styles.puxador} />

            <Text style={styles.tituloSheet}>{titulo}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {opcoes.map((opcao) => {
                const selecionada = opcao.valor === valor;

                return (
                  <Pressable
                    key={opcao.valor}
                    style={[
                      styles.opcao,
                      selecionada && styles.opcaoSelecionada,
                    ]}
                    onPress={() => {
                      aoSelecionar(opcao.valor);
                      setAberto(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.opcaoTexto,
                        selecionada && styles.opcaoTextoSelecionada,
                      ]}
                    >
                      {opcao.rotulo}
                    </Text>

                    {selecionada && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#43855F"
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    marginBottom: 14,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#46534D",
    marginBottom: 6,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 12,
    paddingHorizontal: 12,
  },

  inputErro: {
    borderColor: "#C0392B",
  },

  valor: {
    flex: 1,
    fontSize: 14,
    color: "#26332D",
  },

  placeholder: {
    color: "#8C9AA0",
  },

  erro: {
    marginTop: 5,
    fontSize: 11,
    color: "#C0392B",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(38, 51, 45, 0.45)",
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: "65%",
  },

  puxador: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D8D8D8",
    marginBottom: 14,
  },

  tituloSheet: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#26332D",
    marginBottom: 8,
  },

  opcao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  opcaoSelecionada: {
    backgroundColor: "#EAF2EC",
  },

  opcaoTexto: {
    fontSize: 14,
    color: "#26332D",
  },

  opcaoTextoSelecionada: {
    color: "#43855F",
    fontWeight: "bold",
  },
});
