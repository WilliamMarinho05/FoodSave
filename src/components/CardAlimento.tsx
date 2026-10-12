import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AlimentoComStatus } from "../hooks/useListaAlimentos";
import { CORES_STATUS, textoPrazo } from "../utils/validade";

interface Props {
  alimento: AlimentoComStatus;
  onPress: () => void;
}

export default function CardAlimento({ alimento, onPress }: Props) {
  const cor = CORES_STATUS[alimento.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: cor.borda, backgroundColor: cor.fundo },
        pressed && styles.pressionado,
      ]}
    >
      <View style={styles.conteudo}>
        <Text style={styles.nome} numberOfLines={1}>
          {alimento.nome}
        </Text>

        {!!alimento.categoria && (
          <Text style={styles.info} numberOfLines={1}>
            {alimento.categoria}
          </Text>
        )}

        <Text style={styles.info}>
          Validade: {alimento.validade || "Não informada"}
        </Text>

        <Text style={styles.info}>
          Qtd: {alimento.quantidade} {alimento.unidade}
        </Text>
      </View>

      <View style={styles.lateral}>
        <View style={[styles.pill, { backgroundColor: cor.pill }]}>
          <Text style={[styles.pillTexto, { color: cor.texto }]}>
            {textoPrazo(alimento.dias)}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#43855F" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
  },
  pressionado: {
    opacity: 0.85,
  },
  conteudo: {
    flex: 1,
    paddingRight: 8,
  },
  nome: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#43855F",
    marginBottom: 2,
  },
  info: {
    fontSize: 12,
    color: "#8C9AA0",
    marginTop: 1,
  },
  lateral: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pillTexto: {
    fontSize: 10,
    fontWeight: "700",
  },
});
