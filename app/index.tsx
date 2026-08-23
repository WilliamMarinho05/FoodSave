import { StyleSheet, Text, TextInput, View } from "react-native";

export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <TextInput placeholder="Digite seu nome"/>
      <Text>Hello World!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
