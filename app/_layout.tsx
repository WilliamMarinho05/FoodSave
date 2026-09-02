import { Stack } from "expo-router";

export default function RootLayout() {
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

    </Stack>
  );
}