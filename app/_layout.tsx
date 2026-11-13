import { ConquistaWatcher } from "@/src/components/ConquistaDesbloqueada";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

function ConteudoRaiz() {
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
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="redefinir_senha/index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="cadastro/index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="cadastrar_alimento/index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="sobre/index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="ajuda/index"
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

        <Stack.Screen
          name="missoes/index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="trofeus/index"
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