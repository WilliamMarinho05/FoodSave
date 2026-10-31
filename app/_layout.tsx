import { ConquistaWatcher } from "@/src/components/ConquistaDesbloqueada";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text } from "react-native";

function ConteudoRaiz() {
  const router = useRouter();
  const { cores } = useTheme();

  return (
    <>
      <StatusBar style={cores.statusBar} />

      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: cores.fundo },
          headerStyle: { backgroundColor: cores.card },
          headerTintColor: cores.texto,
          headerTitleStyle: { color: cores.texto },
          headerBackTitle: "Voltar",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="esquec_senha/index"
          options={{
            title: "Recuperar Senha",
            headerBackTitle: "Voltar",
          }}
        />

        <Stack.Screen
          name="cadastro/index"
          options={{
            title: "Cadastro",
            headerBackTitle: "Voltar",
          }}
        />

        <Stack.Screen
          name="cadastrar_alimento/index"
          options={{
            headerShown: false,
            headerTitle: () => (
              <Pressable onPress={() => router.push("/")}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: cores.texto,
                  }}
                >
                  FoodSave
                </Text>
              </Pressable>
            ),
          }}
        />

        <Stack.Screen
          name="sobre/index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="dados_pessoais/index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="configuracoes/index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>

      <ConquistaWatcher />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ConteudoRaiz />
    </ThemeProvider>
  );
}
