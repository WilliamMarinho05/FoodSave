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
        name="esquec_senha/index"
        options={{
          title: "Recuperar Senha",
          headerBackTitle: "Voltar",
        }}
      />
    </Stack>
  );
}