import { ConquistaWatcher } from "@/src/components/ConquistaDesbloqueada";
import { ThemeProvider } from "@/src/context/ThemeContext";
import { Stack, useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

export default function RootLayout() {
  const router = useRouter();

  return (
     <ThemeProvider>
    <>
      <Stack>
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
    </ThemeProvider>
  );
}