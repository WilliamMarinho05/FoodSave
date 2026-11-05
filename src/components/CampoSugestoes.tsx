import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTheme } from "../context/ThemeContext";
import { normalizar } from "../utils/formulario";

type Props = {
  label: string;
  icone: React.ComponentProps<typeof Ionicons>["name"];
  placeholder: string;
  valor: string;
  aoMudar: (texto: string) => void;
  opcoes: string[]; // já cadastradas, da mais relevante para a menos
  limite?: number;
  erro?: string;
  // Quando true, a última linha oferece "Cadastrar nova categoria"
  permitirNova?: boolean;
  rotuloNova?: string; // ex.: "categoria"
};

export default function CampoSugestoes({
  label,
  icone,
  placeholder,
  valor,
  aoMudar,
  opcoes,
  limite = 6,
  erro,
  permitirNova = false,
  rotuloNova = "opção",
}: Props) {
  const { cores } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focado, setFocado] = useState(false);

  const busca = normalizar(valor);
  const existeIgual = !!busca && opcoes.some((o) => normalizar(o) === busca);

  // Quem começa com o texto vem antes de quem só contém
  const filtradas = opcoes
    .filter((o) => normalizar(o).includes(busca))
    .sort((a, b) => {
      const aInicio = normalizar(a).startsWith(busca) ? 0 : 1;
      const bInicio = normalizar(b).startsWith(busca) ? 0 : 1;
      return aInicio - bInicio;
    });

  // Sem categoria "nova", não adianta sugerir exatamente o que já foi digitado
  const sugestoes = (
    permitirNova ? filtradas : filtradas.filter((o) => normalizar(o) !== busca)
  ).slice(0, limite);

  const mostrarNova = permitirNova && !existeIgual;
  const aberto = focado && (sugestoes.length > 0 || mostrarNova);

  const escolher = (texto: string) => {
    aoMudar(texto);
    setFocado(false);
    inputRef.current?.blur();
  };

  const textoNova = valor.trim()
    ? `Cadastrar "${valor.trim()}" como nova ${rotuloNova}`
    : `Cadastrar nova ${rotuloNova}`;

  return (
    <View style={styles.campo}>
      <Text style={[styles.label, { color: cores.textoSecundario }]}>{label}</Text>

      <View
        style={[
          styles.inputBox,
          {
            backgroundColor: cores.input,
            borderColor: erro ? cores.perigo : cores.borda,
          },
          focado && { borderColor: cores.primaria },
        ]}
      >
        <Ionicons name={icone} size={18} color={cores.primariaTexto} />

        <TextInput
          ref={inputRef}
          style={[styles.input, { color: cores.texto }]}
          placeholder={placeholder}
          placeholderTextColor={cores.textoFraco}
          value={valor}
          onChangeText={aoMudar}
          onFocus={() => setFocado(true)}
          // pequeno atraso para o toque na sugestão ser registrado
          onBlur={() => setTimeout(() => setFocado(false), 200)}
          autoCapitalize="sentences"
          autoCorrect={false}
          maxLength={40}
        />

        {!!valor && (
          <Pressable onPress={() => aoMudar("")} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={cores.textoFraco} />
          </Pressable>
        )}
      </View>

      {aberto && (
        <View
          style={[
            styles.lista,
            { backgroundColor: cores.card, borderColor: cores.borda },
          ]}
        >
          {sugestoes.map((item) => (
            <Pressable
              key={item}
              style={({ pressed }) => [
                styles.linhaSugestao,
                { borderTopColor: cores.bordaSuave },
                pressed && styles.linhaPressionada,
              ]}
              onPress={() => escolher(item)}
            >
              <Ionicons name="time-outline" size={16} color={cores.textoFraco} />
              <Text
                style={[styles.textoSugestao, { color: cores.texto }]}
                numberOfLines={1}
              >
                {item}
              </Text>
            </Pressable>
          ))}

          {mostrarNova && (
            <Pressable
              style={({ pressed }) => [
                styles.linhaSugestao,
                styles.linhaNova,
                { borderTopColor: cores.bordaSuave, backgroundColor: cores.primariaSuave },
                sugestoes.length === 0 && styles.semBordaTopo,
                pressed && styles.linhaPressionada,
              ]}
              onPress={() =>
                valor.trim() ? escolher(valor.trim()) : inputRef.current?.focus()
              }
            >
              <Ionicons name="add-circle" size={18} color={cores.primariaTexto} />
              <Text
                style={[styles.textoNova, { color: cores.primariaTexto }]}
                numberOfLines={2}
              >
                {textoNova}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {!!erro && <Text style={[styles.erro, { color: cores.perigo }]}>{erro}</Text>}

      {!erro &&
        !aberto &&
        permitirNova &&
        !!valor.trim() &&
        !existeIgual && (
          <Text style={[styles.dicaNova, { color: cores.primariaTexto }]}>
            Nova {rotuloNova} será criada.
          </Text>
        )}
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

  inputFocado: {
    borderColor: "#43855F",
  },

  inputErro: {
    borderColor: "#C0392B",
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#26332D",
    height: "100%",
  },

  lista: {
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E3E8E4",
    overflow: "hidden",
  },

  linhaSugestao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E3E8E4",
  },

  linhaNova: {
    backgroundColor: "#EAF2EC",
  },

  semBordaTopo: {
    borderTopWidth: 0,
  },

  linhaPressionada: {
    opacity: 0.7,
  },

  textoSugestao: {
    flex: 1,
    fontSize: 14,
    color: "#26332D",
  },

  textoNova: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#43855F",
  },

  erro: {
    marginTop: 5,
    fontSize: 11,
    color: "#C0392B",
  },

  dicaNova: {
    marginTop: 5,
    fontSize: 11,
    color: "#43855F",
  },
});
