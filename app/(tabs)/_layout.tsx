import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { cores } = useTheme();

   return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: cores.primariaTexto,
        tabBarInactiveTintColor: cores.textoSecundario,

        headerShown: true,

        sceneStyle: {
          backgroundColor: cores.fundo,
        },

        headerStyle: {
          backgroundColor: cores.card,
        },

        headerTintColor: cores.texto,

        headerTitleStyle: {
          color: cores.texto,
          fontWeight: "500",
        },

        tabBarStyle: {
          backgroundColor: cores.card,
          borderTopColor: cores.borda,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "FoodSave",
          tabBarLabel: "Início",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="alimentos/index"
        options={{
          title: "Meus Alimentos",
          tabBarLabel: "Alimentos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="nutrition-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="alertas/index"
        options={{
          title: "Alertas",
          tabBarLabel: "Alertas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="assistente/index"
        options={{
          title: "Assistente",
          tabBarLabel: "Assistente",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil/index"
        options={{
          title: "Perfil",
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}