import { StyleSheet, Text, View } from "react-native";

export default function Alertas() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao FoodSave!</Text>
      <Text>Essa é a tela Alertas.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});