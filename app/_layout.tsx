import { Stack } from "expo-router";
import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";

export default function RootLayout() {
  const router = useRouter();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="home/index"
        options={{
          title: "FoodSave",
        }}
      />

      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false
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
          headerShown: true,
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
    </Stack>
  );
}