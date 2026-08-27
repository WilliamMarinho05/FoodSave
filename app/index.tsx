import { StyleSheet, Text, TextInput, View } from "react-native";

export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <Text>Usuario:</Text>
      <TextInput style={styles.input} placeholder="Usuario"/>
      <Text>Senha</Text>
      <TextInput style={styles.input} placeholder="Senha" secureTextEntry/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    
  },
  
  input:{
     width: 250,
    height: 40,

    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,

    paddingHorizontal: 10,
  }
});
