import { supabase } from "@/src/services/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EsqueceuSenha() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [carregando, setCarregando] = useState(false);

    const handleEnviarEmail = async () => {
    if (!email.trim()) {
        Alert.alert("Atenção", "Por favor, digite o seu e-mail cadastrado.");
        return;
    }

    try {
        setCarregando(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

        if (error) {
            throw error;
        }

        Alert.alert(
            "E-mail enviado!", 
            "Verifique sua caixa de entrada para redefinir sua senha.",
            [{ text: "OK", onPress: () => router.back() }]
        );

    } catch (error: any) {
        Alert.alert("Erro", error.message || "Não foi possível enviar o e-mail.");
    } finally {
        setCarregando(false);
    }
};

    return (
        <View style={styles.container}>
            <Image 
                source={require("../../assets/images/logo.jpeg")} 
                style={styles.logo}
                resizeMode="contain"
            />
            
            <View style={styles.camposContainer}>
                <Text style={styles.tituloRecuperar}>Recuperar Senha</Text>
                
                <TextInput 
                    style={styles.input} 
                    placeholder="Digite seu e-mail" 
                    placeholderTextColor="#888"
                    keyboardType="email-address" 
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>

            <View style={styles.camposContainer}>
                <TouchableOpacity 
                    style={[styles.botao, carregando && { opacity: 0.7 }]} 
                    onPress={handleEnviarEmail}
                    disabled={carregando}
                >
                    {carregando ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.textoBotao}>Enviar E-mail</Text>
                    )}
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
        backgroundColor: "#F8F7F1", // Padronizado com o fundo do resto do app
        paddingHorizontal: 20,
    },

    camposContainer: {
        width: "100%",
        maxWidth: 350,
        marginBottom: 20,
    },

    tituloRecuperar: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#26332D",
        marginBottom: 10,
    },
  
    input: {
        width: "100%",
        height: 45,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D8D8D8",
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 14,
        color: "#26332D",
    },

    botao: {
        width: "100%",
        height: 45,
        backgroundColor: "#43855F", // Ajustado para o tom de verde padrão do projeto
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 5,
    },

    textoBotao: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },

    logo: {
        width: 180,
        height: 180,
        alignSelf: "center",
        marginBottom: 30,
    }
});