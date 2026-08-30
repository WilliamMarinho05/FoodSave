import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EsqueceuSenha() {
    return (
        <View style={styles.container}>
            <Image 
                source={require("../../assets/images/logo.jpeg")} 
                style={styles.logo}
                resizeMode="contain"
            />
            <View style={styles.campos}>
            <Text style={styles.campos}>Recuperar Senha</Text>
            
            <TextInput 
                style={styles.input} 
                placeholder="Digite seu e-mail" 
                keyboardType="email-address" 
            />
            </View>

            <View style={styles.campos}>
                <TouchableOpacity style={styles.botao}>
                    <Text style={styles.textoBotao}>Enviar E-mail</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    
  },

  campos: {
    width: "80%",
    marginBottom: "10%",
  },
  
  input:{
    width: "100%",
    height: 40,

    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,

    paddingHorizontal: 10,
  },

  botao: {
    width: "100%",
    height: 40,
    backgroundColor: "#4CAF50",
    borderRadius: 5,

    

    justifyContent: "center",
    alignItems: "center",

    marginTop: 10
  },

  textoBotao: {
    color: "#fff",
  },

  link: {
    color: "#0a52cd",
    textDecorationLine: "underline",
    fontSize: 14,
    marginTop: 15,

    alignSelf: "flex-end",
  },

  linkCriarConta: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },

  campoCriarConta: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 20,
  },

  textoCriarConta: {
    color: "#666",
    fontSize: 14,
  },
  logo: {
    width: 250,
    height: 250,
    alignSelf: "center",
    marginBottom: 20,
  }


});