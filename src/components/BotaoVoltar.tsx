import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

type BotaoVoltarProps = {
  destinoFallback?: "/" | "/home";
};

export default function BotaoVoltar({
  destinoFallback = "/home",
}: BotaoVoltarProps) {
  const router = useRouter();
  const { cores } = useTheme();

  const handleVoltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(destinoFallback);
    }
  };

  return (
    <Pressable
      style={styles.botao}
      onPress={handleVoltar}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
    >
      <Ionicons
        name="arrow-back"
        size={24}
        color={cores.primariaTexto}
      />

      <Text
        style={[
          styles.texto,
          { color: cores.primariaTexto },
        ]}
      >
        Voltar
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },

  texto: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "600",
  },
});